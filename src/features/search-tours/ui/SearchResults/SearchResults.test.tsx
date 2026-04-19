/**
 * @vitest-environment jsdom
 */

import { cleanup, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';

import type { TourCardModel } from '@entities/tour/model';

import { SearchResults } from './SearchResults';

const cards: TourCardModel[] = [
  {
    priceId: 'price-cheap',
    hotelId: 7953,
    hotelName: 'Marlin Inn Azur Resort',
    locationLabel: 'Єгипет, Хургада',
    startDateLabel: '01.05.2026',
    priceLabel: '1 200 USD',
    imageUrl: 'marlin.webp',
    countryFlagUrl: 'egypt.webp'
  },
  {
    priceId: 'price expensive',
    hotelId: 7898,
    hotelName: 'Saphir Hotel & Villas',
    locationLabel: 'Туреччина, Аланія',
    startDateLabel: '03.05.2026',
    priceLabel: '1 800 USD',
    imageUrl: 'saphir.webp',
    countryFlagUrl: 'turkey.webp'
  }
];

afterEach(() => {
  cleanup();
});

describe('SearchResults', () => {
  it('renders tour cards in provided order with details and route links', () => {
    render(
      <MemoryRouter>
        <SearchResults cards={cards} />
      </MemoryRouter>
    );

    const items = screen.getAllByRole('listitem');

    expect(items).toHaveLength(2);
    expect(
      within(items[0]!).getByRole('heading', { name: cards[0]!.hotelName })
    ).toBeTruthy();
    expect(within(items[0]!).getByText(cards[0]!.locationLabel)).toBeTruthy();
    expect(within(items[0]!).getByText(cards[0]!.startDateLabel)).toBeTruthy();
    expect(items[0]!.textContent).toContain(cards[0]!.priceLabel);
    expect(
      within(items[0]!).getByRole('img', { name: cards[0]!.hotelName })
    ).toBeTruthy();

    expect(
      within(items[1]!).getByRole('heading', { name: cards[1]!.hotelName })
    ).toBeTruthy();

    const firstLink = within(items[0]!).getByRole('link', { name: 'Відкрити ціну' });
    const secondLink = within(items[1]!).getByRole('link', { name: 'Відкрити ціну' });

    expect(firstLink.getAttribute('href')).toBe('/tour/price-cheap/7953');
    expect(secondLink.getAttribute('href')).toBe('/tour/price%20expensive/7898');
  });
});
