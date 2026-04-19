import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  ApiClientError,
  getHotels,
  getSearchPrices,
  startSearchPrices,
  stopSearchPrices
} from '@shared/api';

import { SearchToursService } from './searchToursService';

const apiMocks = vi.hoisted(() => ({
  getHotels: vi.fn(),
  getSearchPrices: vi.fn(),
  startSearchPrices: vi.fn(),
  stopSearchPrices: vi.fn()
}));

vi.mock('@shared/api', () => {
  class MockApiClientError extends Error {
    readonly code: number;
    readonly status: number;
    readonly waitUntil?: string;

    constructor(
      message: string,
      options: { code: number; status: number; waitUntil?: string }
    ) {
      super(message);
      this.name = 'ApiClientError';
      this.code = options.code;
      this.status = options.status;
      this.waitUntil = options.waitUntil;
    }
  }

  return {
    ApiClientError: MockApiClientError,
    getHotels: apiMocks.getHotels,
    getSearchPrices: apiMocks.getSearchPrices,
    startSearchPrices: apiMocks.startSearchPrices,
    stopSearchPrices: apiMocks.stopSearchPrices
  };
});

const NOW = new Date('2026-04-19T12:00:00.000Z');
const NOW_ISO = NOW.toISOString();

const egyptHotels = {
  7953: {
    id: 7953,
    name: 'Marlin Inn Azur Resort',
    img: 'hotel-egypt.webp',
    cityId: 712,
    cityName: 'Хургада',
    countryId: '43',
    countryName: 'Єгипет'
  }
};

const turkeyHotels = {
  7898: {
    id: 7898,
    name: 'Saphir Hotel & Villas',
    img: 'hotel-turkey.webp',
    cityId: 953,
    cityName: 'Аланія',
    countryId: '115',
    countryName: 'Туреччина'
  }
};

const cheapEgyptPrice = {
  id: 'price-egypt-cheap',
  amount: 1200,
  currency: 'usd' as const,
  startDate: '2026-05-01',
  endDate: '2026-05-08',
  hotelID: '7953'
};

const expensiveEgyptPrice = {
  id: 'price-egypt-expensive',
  amount: 2400,
  currency: 'usd' as const,
  startDate: '2026-05-02',
  endDate: '2026-05-09',
  hotelID: '7953'
};

const turkeyPrice = {
  id: 'price-turkey',
  amount: 1800,
  currency: 'usd' as const,
  startDate: '2026-05-03',
  endDate: '2026-05-10',
  hotelID: '7898'
};

function createCountryHotel(countryId: string) {
  return {
    1: {
      id: 1,
      name: `Hotel ${countryId}`,
      img: `hotel-${countryId}.webp`,
      cityId: 1,
      cityName: 'City',
      countryId,
      countryName: `Country ${countryId}`
    }
  };
}

const startSearchPricesMock = vi.mocked(startSearchPrices);
const getSearchPricesMock = vi.mocked(getSearchPrices);
const stopSearchPricesMock = vi.mocked(stopSearchPrices);
const getHotelsMock = vi.mocked(getHotels);

function addSeconds(date: Date, seconds: number) {
  return new Date(date.getTime() + seconds * 1000).toISOString();
}

async function flushPromises() {
  await Promise.resolve();
  await Promise.resolve();
}

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

function useFakeNow() {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
}

describe('SearchToursService', () => {
  it('sorts prices and reuses cached prices and hotels for the same country', async () => {
    const service = new SearchToursService();

    startSearchPricesMock.mockResolvedValue({
      token: 'egypt-token',
      waitUntil: NOW_ISO
    });
    getSearchPricesMock.mockResolvedValue({
      prices: {
        [expensiveEgyptPrice.id]: expensiveEgyptPrice,
        [cheapEgyptPrice.id]: cheapEgyptPrice
      }
    });
    getHotelsMock.mockResolvedValue(egyptHotels);

    const firstResult = await service.search({ countryId: '43' });
    const secondResult = await service.search({ countryId: '43' });

    expect(firstResult.prices.map((price) => price.amount)).toEqual([1200, 2400]);
    expect(secondResult.prices).toEqual(firstResult.prices);
    expect(secondResult.hotelsById).toEqual(firstResult.hotelsById);
    expect(startSearchPricesMock).toHaveBeenCalledTimes(1);
    expect(getSearchPricesMock).toHaveBeenCalledTimes(1);
    expect(getHotelsMock).toHaveBeenCalledTimes(1);
  });

  it('refreshes prices when the cache TTL expires', async () => {
    useFakeNow();

    const service = new SearchToursService();

    startSearchPricesMock
      .mockResolvedValueOnce({
        token: 'first-token',
        waitUntil: NOW_ISO
      })
      .mockResolvedValueOnce({
        token: 'second-token',
        waitUntil: addSeconds(NOW, 301)
      });
    getSearchPricesMock
      .mockResolvedValueOnce({
        prices: {
          [cheapEgyptPrice.id]: cheapEgyptPrice
        }
      })
      .mockResolvedValueOnce({
        prices: {
          [expensiveEgyptPrice.id]: expensiveEgyptPrice
        }
      });
    getHotelsMock.mockResolvedValue(egyptHotels);

    const firstResult = await service.search({ countryId: '43' });

    vi.setSystemTime(addSeconds(NOW, 301));

    const secondResult = await service.search({ countryId: '43' });

    expect(firstResult.prices.map((price) => price.id)).toEqual([cheapEgyptPrice.id]);
    expect(secondResult.prices.map((price) => price.id)).toEqual([
      expensiveEgyptPrice.id
    ]);
    expect(startSearchPricesMock).toHaveBeenCalledTimes(2);
    expect(getSearchPricesMock).toHaveBeenCalledTimes(2);
    expect(getHotelsMock).toHaveBeenCalledTimes(1);
  });

  it('invalidates cached prices and hotels for one country', async () => {
    const service = new SearchToursService();

    startSearchPricesMock.mockResolvedValue({
      token: 'egypt-token',
      waitUntil: NOW_ISO
    });
    getSearchPricesMock.mockResolvedValue({
      prices: {
        [cheapEgyptPrice.id]: cheapEgyptPrice
      }
    });
    getHotelsMock.mockResolvedValue(egyptHotels);

    await service.search({ countryId: '43' });

    (service.invalidateCountry as (countryId: string) => void)('43');

    await service.search({ countryId: '43' });

    expect(startSearchPricesMock).toHaveBeenCalledTimes(2);
    expect(getSearchPricesMock).toHaveBeenCalledTimes(2);
    expect(getHotelsMock).toHaveBeenCalledTimes(2);
  });

  it('clears all cached search data', async () => {
    const service = new SearchToursService();

    startSearchPricesMock.mockResolvedValue({
      token: 'egypt-token',
      waitUntil: NOW_ISO
    });
    getSearchPricesMock.mockResolvedValue({
      prices: {
        [cheapEgyptPrice.id]: cheapEgyptPrice
      }
    });
    getHotelsMock.mockResolvedValue(egyptHotels);

    await service.search({ countryId: '43' });

    (service.clearCache as () => void)();

    await service.search({ countryId: '43' });

    expect(startSearchPricesMock).toHaveBeenCalledTimes(2);
    expect(getSearchPricesMock).toHaveBeenCalledTimes(2);
    expect(getHotelsMock).toHaveBeenCalledTimes(2);
  });

  it('removes the oldest cache record when max size is reached', async () => {
    const service = new SearchToursService();
    const countryIds = Array.from({ length: 21 }, (_, index) => String(index + 1));

    startSearchPricesMock.mockImplementation((countryId: string) =>
      Promise.resolve({
        token: `token-${countryId}`,
        waitUntil: NOW_ISO
      })
    );
    getSearchPricesMock.mockImplementation((token: string) => {
      const countryId = token.replace('token-', '');

      return Promise.resolve({
        prices: {
          [`price-${countryId}`]: {
            id: `price-${countryId}`,
            amount: 1000 + Number(countryId),
            currency: 'usd',
            startDate: '2026-05-01',
            endDate: '2026-05-08',
            hotelID: '1'
          }
        }
      });
    });
    getHotelsMock.mockImplementation((countryId: string) =>
      Promise.resolve(createCountryHotel(countryId))
    );

    for (const countryId of countryIds) {
      await service.search({ countryId });
    }

    await service.search({ countryId: '1' });

    expect(startSearchPricesMock).toHaveBeenCalledTimes(22);
    expect(getSearchPricesMock).toHaveBeenCalledTimes(22);
  });

  it('retries transient search-price failures up to two additional attempts', async () => {
    const service = new SearchToursService();

    startSearchPricesMock.mockResolvedValue({
      token: 'retry-token',
      waitUntil: NOW_ISO
    });
    getSearchPricesMock
      .mockRejectedValueOnce(new Error('Temporary failure'))
      .mockRejectedValueOnce(new Error('Temporary failure'))
      .mockResolvedValueOnce({
        prices: {
          [cheapEgyptPrice.id]: cheapEgyptPrice
        }
      });
    getHotelsMock.mockResolvedValue(egyptHotels);

    const result = await service.search({ countryId: '43' });

    expect(result.prices).toHaveLength(1);
    expect(getSearchPricesMock).toHaveBeenCalledTimes(3);
  });

  it('waits until the allowed polling window and handles 425 responses', async () => {
    useFakeNow();

    const service = new SearchToursService();

    startSearchPricesMock.mockResolvedValue({
      token: 'poll-token',
      waitUntil: addSeconds(NOW, 1)
    });
    getSearchPricesMock
      .mockRejectedValueOnce(
        new ApiClientError('Search results are not ready yet.', {
          code: 425,
          status: 425,
          waitUntil: addSeconds(NOW, 2)
        })
      )
      .mockResolvedValueOnce({
        prices: {
          [cheapEgyptPrice.id]: cheapEgyptPrice
        }
      });
    getHotelsMock.mockResolvedValue(egyptHotels);

    const searchPromise = service.search({ countryId: '43' });

    await vi.advanceTimersByTimeAsync(999);
    expect(getSearchPricesMock).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    expect(getSearchPricesMock).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1000);
    const result = await searchPromise;

    expect(result.prices).toHaveLength(1);
    expect(getSearchPricesMock).toHaveBeenCalledTimes(2);
  });

  it('cancels an active search before starting a new search', async () => {
    useFakeNow();

    const service = new SearchToursService();

    startSearchPricesMock.mockImplementation((countryId: string) =>
      Promise.resolve({
        token: countryId === '43' ? 'old-token' : 'new-token',
        waitUntil: countryId === '43' ? addSeconds(NOW, 10) : NOW_ISO
      })
    );
    getSearchPricesMock.mockResolvedValue({
      prices: {
        [turkeyPrice.id]: turkeyPrice
      }
    });
    getHotelsMock.mockResolvedValue(turkeyHotels);
    stopSearchPricesMock.mockResolvedValue({
      status: 'cancelled',
      message: 'Search has been cancelled successfully.'
    });

    const firstSearch = service
      .search({ countryId: '43' })
      .catch((error: unknown) => error);

    await flushPromises();

    const secondResult = await service.search({ countryId: '115' });
    const firstResult = await firstSearch;

    expect(firstResult).toBeInstanceOf(Error);
    expect(stopSearchPricesMock).toHaveBeenCalledWith('old-token');
    expect(secondResult.countryId).toBe('115');
    expect(getSearchPricesMock).toHaveBeenCalledTimes(1);
  });

  it('cancels an active search even when the next result is served from cache', async () => {
    useFakeNow();

    const service = new SearchToursService();

    startSearchPricesMock.mockImplementation((countryId: string) =>
      Promise.resolve({
        token: countryId === '43' ? 'old-token' : 'cached-token',
        waitUntil: countryId === '43' ? addSeconds(NOW, 10) : NOW_ISO
      })
    );
    getSearchPricesMock.mockResolvedValue({
      prices: {
        [turkeyPrice.id]: turkeyPrice
      }
    });
    getHotelsMock.mockResolvedValue(turkeyHotels);
    stopSearchPricesMock.mockResolvedValue({
      status: 'cancelled',
      message: 'Search has been cancelled successfully.'
    });

    await service.search({ countryId: '115' });

    const activeSearch = service
      .search({ countryId: '43' })
      .catch((error: unknown) => error);

    await flushPromises();

    const cachedResult = await service.search({ countryId: '115' });
    const activeResult = await activeSearch;

    expect(activeResult).toBeInstanceOf(Error);
    expect(cachedResult.countryId).toBe('115');
    expect(stopSearchPricesMock).toHaveBeenCalledWith('old-token');
    expect(startSearchPricesMock).toHaveBeenCalledTimes(2);
    expect(getSearchPricesMock).toHaveBeenCalledTimes(1);
  });
});
