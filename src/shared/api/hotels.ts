import { ApiClientError, requestJson } from './client';
import type { RawHotelDetails, RawHotelsMap } from './types';

import {
  getHotel as getHotelRaw,
  getHotels as getHotelsRaw
} from '@shared/api/raw/api.js';

export function getHotels(countryId: string) {
  return requestJson<RawHotelsMap>(getHotelsRaw(countryId));
}

export async function getHotel(hotelId: number | string) {
  const response = await requestJson<Partial<RawHotelDetails>>(getHotelRaw(hotelId));

  if (!response.id) {
    throw new ApiClientError('Hotel with this ID was not found.', {
      code: 404,
      status: 404
    });
  }

  return response as RawHotelDetails;
}
