import type { Hotel } from '@entities/hotel/model';
import type { Price } from '@entities/price/model';
import { formatCurrency, formatDateRange } from '@shared/lib';

import type { TourCardModel, TourDetailsModel, TourDetailsServiceModel } from './types';

const hotelServiceLabels: Record<string, string> = {
  wifi: 'Wi-Fi',
  aquapark: 'Aquapark',
  tennis_court: 'Tennis court',
  laundry: 'Laundry',
  parking: 'Parking'
};

function formatLocationLabel(hotel: Hotel) {
  return `${hotel.countryName}, ${hotel.cityName}`;
}

function mapTourDetailsServices(hotel: Hotel): TourDetailsServiceModel[] {
  if (!hotel.services) {
    return [];
  }

  return hotel.services.map((service) => ({
    key: service.key,
    label: hotelServiceLabels[service.key] ?? service.key.replaceAll('_', ' '),
    value: service.value
  }));
}

export function mapTourCardModel(hotel: Hotel, price: Price): TourCardModel {
  return {
    priceId: price.id,
    hotelId: hotel.id,
    hotelName: hotel.name,
    locationLabel: formatLocationLabel(hotel),
    periodLabel: formatDateRange(price.startDate, price.endDate),
    priceLabel: formatCurrency(price.amount, price.currency),
    imageUrl: hotel.imageUrl
  };
}

export function mapTourDetailsModel(hotel: Hotel, price: Price): TourDetailsModel {
  return {
    priceId: price.id,
    hotelId: hotel.id,
    hotelName: hotel.name,
    locationLabel: formatLocationLabel(hotel),
    description: hotel.description ?? '',
    services: mapTourDetailsServices(hotel),
    periodLabel: formatDateRange(price.startDate, price.endDate),
    priceLabel: formatCurrency(price.amount, price.currency),
    imageUrl: hotel.imageUrl
  };
}
