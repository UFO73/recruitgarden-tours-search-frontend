export interface HotelService {
  key: string;
  value: string;
}

export interface Hotel {
  id: number;
  name: string;
  imageUrl: string;
  cityId: number;
  cityName: string;
  countryId: string;
  countryName: string;
  description?: string;
  services?: HotelService[];
}
