import { mapHotels, type Hotel } from '@entities/hotel/model';
import { mapPrices, type Price } from '@entities/price/model';
import {
  ApiClientError,
  getHotels,
  getSearchPrices,
  startSearchPrices
} from '@shared/api';

const SEARCH_RETRY_LIMIT = 2;

export interface SearchToursParams {
  countryId: string;
}

function getWaitDuration(waitUntil: string) {
  const targetTimestamp = new Date(waitUntil).getTime();

  if (Number.isNaN(targetTimestamp)) {
    return 0;
  }

  return Math.max(targetTimestamp - Date.now(), 0);
}

function waitUntilAllowed(waitUntil: string) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, getWaitDuration(waitUntil));
  });
}

function sortPrices(prices: Price[]) {
  return [...prices].sort((left, right) => left.amount - right.amount);
}

export interface SearchToursResult {
  prices: Price[];
  hotelsById: Map<number, Hotel>;
}

export class SearchToursService {
  private readonly cache = new Map<string, Price[]>();
  private readonly hotelsCache = new Map<string, Map<number, Hotel>>();

  getCached(countryId: string) {
    return this.cache.get(countryId);
  }

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
    const cachedPrices = this.getCached(countryId);

    if (cachedPrices) {
      const hotelsById = await this.getHotelsByCountryId(countryId);

      return { prices: cachedPrices, hotelsById };
    }

    const { token, waitUntil } = await this.startSearchWithRetry(countryId);
    const prices = await this.pollPricesUntilReady(token, waitUntil);
    const sortedPrices = sortPrices(prices);

    this.cache.set(countryId, sortedPrices);

    const hotelsById = await this.getHotelsByCountryId(countryId);

    return { prices: sortedPrices, hotelsById };
  }

  private async startSearchWithRetry(countryId: string) {
    let retriesLeft = SEARCH_RETRY_LIMIT;

    while (true) {
      try {
        return await startSearchPrices(countryId);
      } catch (error) {
        if (retriesLeft === 0) {
          throw error;
        }

        retriesLeft -= 1;
      }
    }
  }

  private async pollPricesUntilReady(token: string, initialWaitUntil: string) {
    let waitUntil = initialWaitUntil;
    let retriesLeft = SEARCH_RETRY_LIMIT;

    while (true) {
      await waitUntilAllowed(waitUntil);

      try {
        const response = await getSearchPrices(token);

        return mapPrices(response.prices);
      } catch (error) {
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
}
