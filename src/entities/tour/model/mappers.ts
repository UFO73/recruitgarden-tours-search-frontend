import type { Hotel } from '@entities/hotel/model';
import type { Price } from '@entities/price/model';
import { formatCurrency, formatDate, formatDateRange } from '@shared/lib';

import type {
  MapTourCardModelsContext,
  TourCardModel,
  TourDetailsModel,
  TourDetailsServiceModel
} from './types';

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

function formatTourCardPrice(amount: number): string {
  const formatted = new Intl.NumberFormat('uk-UA', {
    maximumFractionDigits: 0
  }).format(amount);

  return `${formatted} грн`;
}

function createFallbackHotel(
  hotelId: number | undefined,
  countryId: string,
  countryName: string
): Hotel {
  return {
    id: hotelId ?? 0,
    name: 'Готель невідомий',
    imageUrl: '',
    cityId: 0,
    cityName: '—',
    countryId,
    countryName
  };
}

export function mapTourCardModels(
  prices: Price[],
  hotelsById: Map<number, Hotel>,
  context: MapTourCardModelsContext
): TourCardModel[] {
  return prices.map((price) => {
    const hotelId = price.hotelId;
    const hotel =
      hotelId != null
        ? (hotelsById.get(hotelId) ??
          createFallbackHotel(hotelId, context.countryId, context.countryName))
        : createFallbackHotel(undefined, context.countryId, context.countryName);

    const card = mapTourCardModel(hotel, price);

    return {
      ...card,
      countryFlagUrl: context.countryFlagUrl
    };
  });
}

export function mapTourCardModel(hotel: Hotel, price: Price): TourCardModel {
  return {
    priceId: price.id,
    hotelId: hotel.id,
    hotelName: hotel.name,
    locationLabel: formatLocationLabel(hotel),
    startDateLabel: formatDate(price.startDate),
    priceLabel: formatTourCardPrice(price.amount),
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
