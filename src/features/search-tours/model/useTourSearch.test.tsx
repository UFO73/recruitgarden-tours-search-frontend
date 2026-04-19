/**
 * @vitest-environment jsdom
 */

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { Hotel } from '@entities/hotel/model';
import type { Price } from '@entities/price/model';

import { useTourSearch } from './useTourSearch';

const serviceMocks = vi.hoisted(() => ({
  hasActiveSearch: vi.fn(),
  search: vi.fn()
}));

vi.mock('@services/search-tours', () => ({
  SearchToursService: vi.fn(function SearchToursService() {
    return serviceMocks;
  })
}));

const hotel: Hotel = {
  id: 7953,
  name: 'Marlin Inn Azur Resort',
  imageUrl: 'hotel.webp',
  cityId: 712,
  cityName: 'Хургада',
  countryId: '43',
  countryName: 'Єгипет'
};

const price: Price = {
  id: 'price-1',
  amount: 2400,
  currency: 'usd',
  startDate: '2026-05-01',
  endDate: '2026-05-08',
  hotelId: 7953
};

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });

  return { promise, resolve, reject };
}

function SearchHarness({ countryId = '43' }: { countryId?: string }) {
  const { isRestarting, isSearching, startSearch, viewState } = useTourSearch();

  return (
    <div>
      <button type="button" onClick={() => void startSearch({ countryId })}>
        search
      </button>
      <span data-testid="status">{viewState.status}</span>
      <span data-testid="is-searching">{String(isSearching)}</span>
      <span data-testid="is-restarting">{String(isRestarting)}</span>
      {viewState.status === 'error' ? (
        <span data-testid="error">{viewState.errorMessage}</span>
      ) : null}
      {viewState.status === 'success' ? (
        <span data-testid="result-count">{viewState.data.prices.length}</span>
      ) : null}
    </div>
  );
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('useTourSearch UI state transitions', () => {
  it('moves from idle to loading and then success', async () => {
    const deferred = createDeferred<{
      countryId: string;
      prices: Price[];
      hotelsById: Map<number, Hotel>;
    }>();

    serviceMocks.hasActiveSearch.mockReturnValue(false);
    serviceMocks.search.mockReturnValue(deferred.promise);

    render(<SearchHarness />);

    expect(screen.getByTestId('status').textContent).toBe('idle');

    fireEvent.click(screen.getByRole('button', { name: 'search' }));

    expect(screen.getByTestId('status').textContent).toBe('loading');
    expect(screen.getByTestId('is-searching').textContent).toBe('true');

    deferred.resolve({
      countryId: '43',
      prices: [price],
      hotelsById: new Map([[hotel.id, hotel]])
    });

    await waitFor(() => {
      expect(screen.getByTestId('status').textContent).toBe('success');
    });
    expect(screen.getByTestId('result-count').textContent).toBe('1');
    expect(screen.getByTestId('is-searching').textContent).toBe('false');
  });

  it('moves from loading to empty when service returns no prices', async () => {
    serviceMocks.hasActiveSearch.mockReturnValue(false);
    serviceMocks.search.mockResolvedValue({
      countryId: '43',
      prices: [],
      hotelsById: new Map()
    });

    render(<SearchHarness />);

    fireEvent.click(screen.getByRole('button', { name: 'search' }));

    expect(screen.getByTestId('status').textContent).toBe('loading');

    await waitFor(() => {
      expect(screen.getByTestId('status').textContent).toBe('empty');
    });
  });

  it('moves from loading to error when service rejects', async () => {
    serviceMocks.hasActiveSearch.mockReturnValue(false);
    serviceMocks.search.mockRejectedValue(new Error('Search failed'));

    render(<SearchHarness />);

    fireEvent.click(screen.getByRole('button', { name: 'search' }));

    expect(screen.getByTestId('status').textContent).toBe('loading');

    await waitFor(() => {
      expect(screen.getByTestId('status').textContent).toBe('error');
    });
    expect(screen.getByTestId('error').textContent).toBe('Search failed');
  });

  it('uses restarting state when a new search starts during an active search', async () => {
    const deferred = createDeferred<{
      countryId: string;
      prices: Price[];
      hotelsById: Map<number, Hotel>;
    }>();

    serviceMocks.hasActiveSearch.mockReturnValue(true);
    serviceMocks.search.mockReturnValue(deferred.promise);

    render(<SearchHarness />);

    fireEvent.click(screen.getByRole('button', { name: 'search' }));

    expect(screen.getByTestId('status').textContent).toBe('idle');
    expect(screen.getByTestId('is-restarting').textContent).toBe('true');
    expect(screen.getByTestId('is-searching').textContent).toBe('true');

    deferred.resolve({
      countryId: '43',
      prices: [price],
      hotelsById: new Map([[hotel.id, hotel]])
    });

    await waitFor(() => {
      expect(screen.getByTestId('status').textContent).toBe('success');
    });
    expect(screen.getByTestId('is-restarting').textContent).toBe('false');
  });
});
