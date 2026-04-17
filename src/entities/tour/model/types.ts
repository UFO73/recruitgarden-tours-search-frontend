export interface TourCardModel {
  priceId: string;
  hotelId: number;
  hotelName: string;
  locationLabel: string;
  periodLabel: string;
  priceLabel: string;
  imageUrl: string;
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
