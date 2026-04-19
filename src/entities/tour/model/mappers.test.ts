import { describe, expect, it } from 'vitest';

import type { Hotel } from '@entities/hotel/model';
import type { Price } from '@entities/price/model';

import { mapTourCardModel, mapTourDetailsModel } from './mappers';

const hotel: Hotel = {
  id: 7953,
  name: 'Marlin Inn Azur Resort',
  imageUrl: 'hotel.webp',
  cityId: 712,
  cityName: 'Хургада',
  countryId: '43',
  countryName: 'Єгипет',
  description: 'Готель біля моря.',
  services: [{ key: 'wifi', value: 'yes' }]
};

const price: Price = {
  id: 'price-1',
  amount: 2400,
  currency: 'usd',
  startDate: '2026-05-01',
  endDate: '2026-05-08',
  hotelId: 7953
};

describe('tour mappers', () => {
  it('formats card price with API currency', () => {
    const card = mapTourCardModel(hotel, price);

    expect(card.priceLabel).toBe('2 400 USD');
  });

  it('formats details price with API currency', () => {
    const details = mapTourDetailsModel(hotel, price);

    expect(details.priceLabel).toBe('2 400 USD');
  });
});
