import type { RawGeoEntity, RawGeoResponse } from '@shared/api';

import type { CityGeoOption, GeoOption } from './types';

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

/** Same shape as `RawCity` from `@shared/api` (avoids import clash with `./types`). */
interface RawCityRow {
  id: number;
  name: string;
  countryId?: string;
}

function mapCityGeoOption(rawEntity: RawCityRow): CityGeoOption {
  const countryId: string | undefined = rawEntity.countryId;

  return {
    id: String(rawEntity.id),
    name: rawEntity.name,
    kind: 'city',
    icon: 'city',
    label: rawEntity.name,
    cityId: rawEntity.id,
    countryId
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
