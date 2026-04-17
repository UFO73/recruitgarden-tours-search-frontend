import type { RawHotel, RawHotelDetails, RawHotelsMap } from '@shared/api';

import type { Hotel, HotelService } from './types';

function mapHotelServices(
  rawServices?: Record<string, string>
): HotelService[] | undefined {
  if (!rawServices) {
    return undefined;
  }

  return Object.entries(rawServices).map(([key, value]) => ({
    key,
    value
  }));
}

export function mapHotel(rawHotel: RawHotel | RawHotelDetails): Hotel {
  return {
    id: rawHotel.id,
    name: rawHotel.name,
    imageUrl: rawHotel.img,
    cityId: rawHotel.cityId,
    cityName: rawHotel.cityName,
    countryId: rawHotel.countryId,
    countryName: rawHotel.countryName,
    description: 'description' in rawHotel ? rawHotel.description : undefined,
    services: 'services' in rawHotel ? mapHotelServices(rawHotel.services) : undefined
  };
}

export function mapHotels(rawHotels: RawHotelsMap): Hotel[] {
  return Object.values(rawHotels).map(mapHotel);
}
