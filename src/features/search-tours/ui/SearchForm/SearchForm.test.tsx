/**
 * @vitest-environment jsdom
 */

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useCountriesQuery } from '@entities/country/model';
import { useGeoSearchQuery } from '@entities/geo/model';

import { SearchForm } from './SearchForm';

vi.mock('@entities/country/model', () => ({
  useCountriesQuery: vi.fn()
}));

vi.mock('@entities/geo/model', () => ({
  useGeoSearchQuery: vi.fn()
}));

const useCountriesQueryMock = vi.mocked(useCountriesQuery);
const useGeoSearchQueryMock = vi.mocked(useGeoSearchQuery);

const countries = [
  {
    id: '43',
    name: 'Єгипет',
    flagUrl: 'egypt.webp'
  },
  {
    id: '115',
    name: 'Туреччина',
    flagUrl: 'turkey.webp'
  }
];

const geoOptions = [
  {
    id: 'city-712',
    kind: 'city' as const,
    icon: 'city' as const,
    label: 'Хургада',
    name: 'Хургада',
    cityId: 712,
    countryId: '43',
    description: 'Єгипет'
  },
  {
    id: 'hotel-7953',
    kind: 'hotel' as const,
    icon: 'hotel' as const,
    label: 'Marlin Inn Azur Resort',
    name: 'Marlin Inn Azur Resort',
    hotelId: 7953,
    cityId: 712,
    cityName: 'Хургада',
    countryId: '43',
    countryName: 'Єгипет',
    description: 'Хургада, Єгипет',
    imageUrl: 'hotel.webp'
  }
];

function setupQueries() {
  useCountriesQueryMock.mockReturnValue({ data: countries } as ReturnType<
    typeof useCountriesQuery
  >);
  useGeoSearchQueryMock.mockImplementation(
    (query) =>
      ({
        data: query?.trim() ? geoOptions : []
      }) as ReturnType<typeof useGeoSearchQuery>
  );
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('SearchForm', () => {
  it('shows countries on input focus and submits selected country', () => {
    setupQueries();

    const handleSubmit = vi.fn();

    render(<SearchForm onSubmit={handleSubmit} />);

    const input = screen.getByRole('combobox');
    const submitButton = screen.getByRole('button', { name: 'Знайти' });

    expect((submitButton as HTMLButtonElement).disabled).toBe(true);

    fireEvent.focus(input);
    fireEvent.click(screen.getByRole('option', { name: /Єгипет/ }));

    expect((input as HTMLInputElement).value).toBe('Єгипет');
    expect((submitButton as HTMLButtonElement).disabled).toBe(false);

    fireEvent.click(submitButton);

    expect(handleSubmit).toHaveBeenCalledWith({
      kind: 'country',
      label: 'Єгипет',
      value: 'Єгипет',
      countryId: '43',
      cityId: undefined,
      hotelId: undefined
    });
  });

  it('switches to geo search while typing and submits selected city', async () => {
    setupQueries();

    const handleSubmit = vi.fn();

    render(<SearchForm onSubmit={handleSubmit} />);

    const input = screen.getByRole('combobox');

    fireEvent.change(input, { target: { value: 'Хур' } });

    await waitFor(() => {
      expect(screen.getAllByRole('option')).toHaveLength(2);
    });

    expect(useGeoSearchQueryMock).toHaveBeenLastCalledWith('Хур', {
      enabled: true
    });

    fireEvent.click(screen.getAllByRole('option')[0]!);
    fireEvent.click(screen.getByRole('button', { name: 'Знайти' }));

    expect(handleSubmit).toHaveBeenCalledWith({
      kind: 'city',
      label: 'Хургада',
      value: 'Хургада',
      countryId: '43',
      cityId: 712,
      hotelId: undefined
    });
  });

  it('submits selected hotel with Enter', async () => {
    setupQueries();

    const handleSubmit = vi.fn();

    render(<SearchForm onSubmit={handleSubmit} />);

    const input = screen.getByRole('combobox');

    fireEvent.change(input, { target: { value: 'Mar' } });

    await waitFor(() => {
      expect(screen.getByRole('option', { name: /Marlin Inn Azur Resort/ })).toBeTruthy();
    });

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        kind: 'hotel',
        label: 'Marlin Inn Azur Resort',
        value: 'Marlin Inn Azur Resort',
        countryId: '43',
        cityId: 712,
        hotelId: 7953
      });
    });
  });
});
