export type GeoOptionKind = 'country' | 'city' | 'hotel';
export type GeoOptionIcon = 'globe' | 'city' | 'hotel';

interface BaseGeoOption {
  id: string;
  name: string;
  kind: GeoOptionKind;
  icon: GeoOptionIcon;
  label: string;
  description?: string;
}

export interface CountryGeoOption extends BaseGeoOption {
  kind: 'country';
  countryId: string;
  flagUrl: string;
}

export interface CityGeoOption extends BaseGeoOption {
  kind: 'city';
  cityId: number;
}

export interface HotelGeoOption extends BaseGeoOption {
  kind: 'hotel';
  hotelId: number;
  cityId: number;
  cityName: string;
  countryId: string;
  countryName: string;
  imageUrl: string;
}

export type GeoOption = CountryGeoOption | CityGeoOption | HotelGeoOption;
