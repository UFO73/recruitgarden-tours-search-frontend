import { mapHotels, type Hotel } from '@entities/hotel/model';
import { mapPrices, type Price } from '@entities/price/model';
import {
  ApiClientError,
  getHotels,
  getSearchPrices,
  startSearchPrices,
  stopSearchPrices
} from '@shared/api';

const SEARCH_RETRY_LIMIT = 2;
const PRICES_CACHE_TTL_MS = 5 * 60 * 1000;
const HOTELS_CACHE_TTL_MS = 30 * 60 * 1000;
const SEARCH_CACHE_MAX_SIZE = 20;

interface CacheOptions {
  maxSize: number;
  ttlMs: number;
}

interface CacheEntry<TValue> {
  expiresAt: number;
  value: TValue;
}

class TtlCache<TKey, TValue> {
  private readonly store = new Map<TKey, CacheEntry<TValue>>();

  constructor(private readonly options: CacheOptions) {}

  get(key: TKey): TValue | undefined {
    const entry = this.store.get(key);

    if (!entry) {
      return undefined;
    }

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }

    return entry.value;
  }

  set(key: TKey, value: TValue): void {
    this.store.delete(key);

    while (this.store.size >= this.options.maxSize) {
      const oldestKey = this.store.keys().next().value;

      if (oldestKey === undefined) {
        break;
      }

      this.store.delete(oldestKey);
    }

    this.store.set(key, {
      value,
      expiresAt: Date.now() + this.options.ttlMs
    });
  }

  delete(key: TKey): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

export interface SearchToursParams {
  countryId: string;
}

function getWaitDuration(waitUntil: string): number {
  const targetTimestamp = new Date(waitUntil).getTime();

  if (Number.isNaN(targetTimestamp)) {
    return 0;
  }

  return Math.max(targetTimestamp - Date.now(), 0);
}

function sortPrices(prices: Price[]): Price[] {
  return [...prices].sort((left, right) => left.amount - right.amount);
}

export interface SearchToursResult {
  countryId: string;
  prices: Price[];
  hotelsById: Map<number, Hotel>;
}

interface ActiveSearchContext {
  cancelWait?: () => void;
  id: number;
  token?: string;
}

class SearchCancelledError extends Error {
  constructor() {
    super('Search was cancelled.');
    this.name = 'SearchCancelledError';
  }
}

export class SearchToursService {
  private readonly cache = new TtlCache<string, Price[]>({
    maxSize: SEARCH_CACHE_MAX_SIZE,
    ttlMs: PRICES_CACHE_TTL_MS
  });
  private readonly hotelsCache = new TtlCache<string, Map<number, Hotel>>({
    maxSize: SEARCH_CACHE_MAX_SIZE,
    ttlMs: HOTELS_CACHE_TTL_MS
  });
  private activeSearch: ActiveSearchContext | null = null;
  private nextSearchId = 0;

  hasActiveSearch(): boolean {
    return this.activeSearch !== null;
  }

  getCached(countryId: string): Price[] | undefined {
    return this.cache.get(countryId);
  }

  invalidateCountry = (countryId: string): void => {
    this.cache.delete(countryId);
    this.hotelsCache.delete(countryId);
  };

  clearCache = (): void => {
    this.cache.clear();
    this.hotelsCache.clear();
  };

  async getHotelsByCountryId(countryId: string): Promise<Map<number, Hotel>> {
    const cached = this.hotelsCache.get(countryId);

    if (cached) {
      return cached;
    }

    const raw = await getHotels(countryId);
    const list = mapHotels(raw);
    const map = new Map(list.map((hotel) => [hotel.id, hotel]));

    this.hotelsCache.set(countryId, map);

    return map;
  }

  async search({ countryId }: SearchToursParams): Promise<SearchToursResult> {
    if (this.activeSearch) {
      await this.cancelActiveSearch();
    }

    const cachedPrices = this.getCached(countryId);

    if (cachedPrices) {
      const hotelsById = await this.getHotelsByCountryId(countryId);

      return { countryId, prices: cachedPrices, hotelsById };
    }

    const searchContext = this.createActiveSearch();

    try {
      const { token, waitUntil } = await this.startSearchWithRetry(
        countryId,
        searchContext
      );

      this.ensureActiveSearch(searchContext);
      searchContext.token = token;

      const prices = await this.pollPricesUntilReady(token, waitUntil, searchContext);
      const sortedPrices = sortPrices(prices);

      this.cache.set(countryId, sortedPrices);

      const hotelsById = await this.getHotelsByCountryId(countryId);

      return { countryId, prices: sortedPrices, hotelsById };
    } finally {
      if (this.isActiveSearch(searchContext)) {
        this.activeSearch = null;
      }
    }
  }

  private createActiveSearch(): ActiveSearchContext {
    const searchContext: ActiveSearchContext = {
      id: this.nextSearchId + 1
    };

    this.nextSearchId = searchContext.id;
    this.activeSearch = searchContext;

    return searchContext;
  }

  private isActiveSearch(searchContext: ActiveSearchContext): boolean {
    return this.activeSearch?.id === searchContext.id;
  }

  private ensureActiveSearch(searchContext: ActiveSearchContext): void {
    if (!this.isActiveSearch(searchContext)) {
      throw new SearchCancelledError();
    }
  }

  private async cancelActiveSearch(): Promise<void> {
    const activeSearch = this.activeSearch;

    if (!activeSearch) {
      return;
    }

    this.activeSearch = null;
    activeSearch.cancelWait?.();

    if (!activeSearch.token) {
      return;
    }

    try {
      await stopSearchPrices(activeSearch.token);
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 404) {
        return;
      }

      throw error;
    }
  }

  private async startSearchWithRetry(
    countryId: string,
    searchContext: ActiveSearchContext
  ): Promise<{ token: string; waitUntil: string }> {
    let retriesLeft = SEARCH_RETRY_LIMIT;

    while (true) {
      try {
        const response = await startSearchPrices(countryId);

        this.ensureActiveSearch(searchContext);

        return response;
      } catch (error) {
        if (!this.isActiveSearch(searchContext)) {
          throw new SearchCancelledError();
        }

        if (retriesLeft === 0) {
          throw error;
        }

        retriesLeft -= 1;
      }
    }
  }

  private async pollPricesUntilReady(
    token: string,
    initialWaitUntil: string,
    searchContext: ActiveSearchContext
  ): Promise<Price[]> {
    let waitUntil = initialWaitUntil;
    let retriesLeft = SEARCH_RETRY_LIMIT;

    while (true) {
      await this.waitUntilAllowed(waitUntil, searchContext);
      this.ensureActiveSearch(searchContext);

      try {
        const response = await getSearchPrices(token);

        this.ensureActiveSearch(searchContext);

        return mapPrices(response.prices);
      } catch (error) {
        if (!this.isActiveSearch(searchContext)) {
          throw new SearchCancelledError();
        }

        if (error instanceof ApiClientError && error.status === 425 && error.waitUntil) {
          waitUntil = error.waitUntil;
          continue;
        }

        if (retriesLeft === 0) {
          throw error;
        }

        retriesLeft -= 1;
      }
    }
  }

  private waitUntilAllowed(
    waitUntil: string,
    searchContext: ActiveSearchContext
  ): Promise<void> {
    const waitDuration = getWaitDuration(waitUntil);

    if (waitDuration === 0) {
      return Promise.resolve();
    }

    return new Promise<void>((resolve, reject) => {
      const timeoutId = globalThis.setTimeout(() => {
        if (this.isActiveSearch(searchContext)) {
          searchContext.cancelWait = undefined;
        }

        resolve();
      }, waitDuration);

      searchContext.cancelWait = () => {
        globalThis.clearTimeout(timeoutId);
        searchContext.cancelWait = undefined;
        reject(new SearchCancelledError());
      };
    });
  }
}
