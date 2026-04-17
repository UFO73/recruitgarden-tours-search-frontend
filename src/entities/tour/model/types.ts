export interface MapTourCardModelsContext {
  countryId: string;
  countryName: string;
  countryFlagUrl?: string;
}

export interface TourCardModel {
  priceId: string;
  hotelId: number;
  hotelName: string;
  locationLabel: string;
  startDateLabel: string;
  priceLabel: string;
  imageUrl: string;
  countryFlagUrl?: string;
}

export interface TourDetailsServiceModel {
  key: string;
  label: string;
  value: string;
}

export interface TourDetailsModel {
  priceId: string;
  hotelId: number;
  hotelName: string;
  locationLabel: string;
  description: string;
  services: TourDetailsServiceModel[];
  periodLabel: string;
  priceLabel: string;
  imageUrl: string;
}
