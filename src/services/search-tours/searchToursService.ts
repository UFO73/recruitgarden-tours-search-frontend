import { mapPrices, type Price } from '@entities/price/model';
import { ApiClientError, getSearchPrices, startSearchPrices } from '@shared/api';

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

export class SearchToursService {
  private readonly cache = new Map<string, Price[]>();

  getCached(countryId: string) {
    return this.cache.get(countryId);
  }

  async search({ countryId }: SearchToursParams) {
    const cachedPrices = this.getCached(countryId);

    if (cachedPrices) {
      return cachedPrices;
    }

    const { token, waitUntil } = await this.startSearchWithRetry(countryId);
    const prices = await this.pollPricesUntilReady(token, waitUntil);
    const sortedPrices = sortPrices(prices);

    this.cache.set(countryId, sortedPrices);

    return sortedPrices;
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
        if (
          error instanceof ApiClientError &&
          error.status === 425 &&
          error.waitUntil
        ) {
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
