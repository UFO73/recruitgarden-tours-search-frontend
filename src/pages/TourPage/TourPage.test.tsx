/**
 * @vitest-environment jsdom
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { getCountries, getHotel, getPrice } from '@shared/api';

import { TourPage } from './TourPage';

const apiMocks = vi.hoisted(() => ({
  getCountries: vi.fn(),
  getHotel: vi.fn(),
  getPrice: vi.fn()
}));

vi.mock('@shared/api', () => ({
  getCountries: apiMocks.getCountries,
  getHotel: apiMocks.getHotel,
  getPrice: apiMocks.getPrice
}));

const getCountriesMock = vi.mocked(getCountries);
const getHotelMock = vi.mocked(getHotel);
const getPriceMock = vi.mocked(getPrice);

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });

  return { promise, resolve, reject };
}

function renderTourPage(path = '/tour/price-1/7953') {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false
      }
    }
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/tour/:priceId/:hotelId" element={<TourPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('TourPage loading states', () => {
  it('shows loading while price and hotel details are pending', async () => {
    const priceDeferred = createDeferred<Awaited<ReturnType<typeof getPrice>>>();
    const hotelDeferred = createDeferred<Awaited<ReturnType<typeof getHotel>>>();

    getPriceMock.mockReturnValue(priceDeferred.promise);
    getHotelMock.mockReturnValue(hotelDeferred.promise);
    getCountriesMock.mockResolvedValue({});

    renderTourPage();

    expect(await screen.findByText('Завантажуємо тур…')).toBeTruthy();

    priceDeferred.resolve({
      id: 'price-1',
      amount: 2400,
      currency: 'usd',
      startDate: '2026-05-01',
      endDate: '2026-05-08',
      hotelID: '7953'
    });
    hotelDeferred.resolve({
      id: 7953,
      name: 'Marlin Inn Azur Resort',
      img: 'hotel.webp',
      cityId: 712,
      cityName: 'Хургада',
      countryId: '43',
      countryName: 'Єгипет',
      description: 'Готель біля моря.',
      services: { wifi: 'yes' }
    });

    await screen.findByRole('heading', { name: 'Marlin Inn Azur Resort' });
  });

  it('renders tour details when price, hotel and country data are loaded', async () => {
    getPriceMock.mockResolvedValue({
      id: 'price-1',
      amount: 2400,
      currency: 'usd',
      startDate: '2026-05-01',
      endDate: '2026-05-08',
      hotelID: '7953'
    });
    getHotelMock.mockResolvedValue({
      id: 7953,
      name: 'Marlin Inn Azur Resort',
      img: 'hotel.webp',
      cityId: 712,
      cityName: 'Хургада',
      countryId: '43',
      countryName: 'Єгипет',
      description: 'Готель біля моря.',
      services: { wifi: 'yes' }
    });
    getCountriesMock.mockResolvedValue({
      43: {
        id: '43',
        name: 'Єгипет',
        flag: 'flag.webp'
      }
    });

    renderTourPage();

    expect(
      await screen.findByRole('heading', { name: 'Marlin Inn Azur Resort' })
    ).toBeTruthy();
    expect(screen.getByText('Готель біля моря.')).toBeTruthy();
    expect(screen.getByText('Wi-Fi')).toBeTruthy();
    expect(document.body.textContent).toContain('2 400 USD');
    expect(document.body.textContent).toContain('01.05.2026 - 08.05.2026');
  });

  it('renders an error state when details loading fails', async () => {
    getPriceMock.mockRejectedValue(new Error('Offer was not found'));
    getHotelMock.mockResolvedValue({
      id: 7953,
      name: 'Marlin Inn Azur Resort',
      img: 'hotel.webp',
      cityId: 712,
      cityName: 'Хургада',
      countryId: '43',
      countryName: 'Єгипет',
      description: 'Готель біля моря.',
      services: { wifi: 'yes' }
    });
    getCountriesMock.mockResolvedValue({});

    renderTourPage();

    expect(await screen.findByText('Помилка')).toBeTruthy();
    expect(screen.getByText('Offer was not found')).toBeTruthy();
  });

  it('renders an error state for invalid URL params without hanging in loading', async () => {
    renderTourPage('/tour/price-1/not-a-hotel-id');

    await waitFor(() => {
      expect(screen.queryByText('Завантажуємо тур…')).toBeNull();
    });
    expect(screen.getByText('Помилка')).toBeTruthy();
    expect(screen.getByText('Некоректний ідентифікатор готелю.')).toBeTruthy();
    expect(getPriceMock).not.toHaveBeenCalled();
    expect(getHotelMock).not.toHaveBeenCalled();
  });
});
