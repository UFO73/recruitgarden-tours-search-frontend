import type { RawGeoEntity, RawGeoResponse } from '@shared/api';

import type { GeoOption } from './types';

function mapCountryGeoOption(
  rawEntity: Extract<RawGeoEntity, { type: 'country' }>
): GeoOption {
  return {
    id: rawEntity.id,
    name: rawEntity.name,
    kind: 'country',
    icon: 'globe',
    label: rawEntity.name,
    countryId: rawEntity.id,
    flagUrl: rawEntity.flag
  };
}

function mapCityGeoOption(rawEntity: Extract<RawGeoEntity, { type: 'city' }>): GeoOption {
  return {
    id: String(rawEntity.id),
    name: rawEntity.name,
    kind: 'city',
    icon: 'city',
    label: rawEntity.name,
    cityId: rawEntity.id
  };
}

function mapHotelGeoOption(
  rawEntity: Extract<RawGeoEntity, { type: 'hotel' }>
): GeoOption {
  return {
    id: String(rawEntity.id),
    name: rawEntity.name,
    kind: 'hotel',
    icon: 'hotel',
    label: rawEntity.name,
    description: `${rawEntity.cityName}, ${rawEntity.countryName}`,
    hotelId: rawEntity.id,
    cityId: rawEntity.cityId,
    cityName: rawEntity.cityName,
    countryId: rawEntity.countryId,
    countryName: rawEntity.countryName,
    imageUrl: rawEntity.img
  };
}

export function mapGeoOption(rawEntity: RawGeoEntity): GeoOption {
  switch (rawEntity.type) {
    case 'country':
      return mapCountryGeoOption(rawEntity);
    case 'city':
      return mapCityGeoOption(rawEntity);
    case 'hotel':
      return mapHotelGeoOption(rawEntity);
  }
}

export function mapGeoOptions(rawGeoResponse: RawGeoResponse): GeoOption[] {
  return Object.values(rawGeoResponse).map(mapGeoOption);
}
