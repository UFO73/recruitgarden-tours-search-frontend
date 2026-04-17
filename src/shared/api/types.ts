export interface ApiErrorResponse {
  code: number;
  error: true;
  message: string;
  waitUntil?: string;
}

export interface RawCountry {
  id: string;
  name: string;
  flag: string;
}

export interface RawCity {
  id: number;
  name: string;
  countryId?: string;
}

export interface RawHotel {
  id: number;
  name: string;
  img: string;
  cityId: number;
  cityName: string;
  countryId: string;
  countryName: string;
}

export interface RawHotelDetails extends RawHotel {
  description: string;
  services: Record<string, string>;
}

export interface RawPriceOffer {
  id: string;
  amount: number;
  currency: 'usd';
  startDate: string;
  endDate: string;
  hotelID?: string;
}

export type RawCountriesMap = Record<string, RawCountry>;
export type RawHotelsMap = Record<string, RawHotel>;
export type RawPricesMap = Record<string, RawPriceOffer>;

export type RawGeoEntity =
  | (RawCountry & { type: 'country' })
  | (RawCity & { type: 'city' })
  | (RawHotel & { type: 'hotel' });

export type RawGeoResponse = Record<string, RawGeoEntity>;

export interface RawStartSearchResponse {
  token: string;
  waitUntil: string;
}

export interface RawGetSearchPricesResponse {
  prices: RawPricesMap;
}

export interface RawStopSearchResponse {
  status: 'cancelled';
  message: string;
}
