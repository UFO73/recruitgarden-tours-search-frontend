export interface Price {
  id: string;
  amount: number;
  currency: string;
  startDate: string;
  endDate: string;
  hotelId?: number;
}
