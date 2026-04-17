# 🧪 Мок API (браузерні функції)

Це набір **браузерних функцій**, які повертають `Promise<Response>` (аналогічно до `fetch`).
Дані генеруються в пам'яті, без реального бекенду.

## ✅ Публічні функції

```ts
function getCountries(): Promise<Response>;
function searchGeo(query?: string): Promise<Response>;
function startSearchPrices(countryID: string): Promise<Response>;
function getSearchPrices(token: string): Promise<Response>;
function stopSearchPrices(token: string): Promise<Response>;
function getHotels(countryID: string): Promise<Response>;
function getHotel(hotelId: number | string): Promise<Response>;
function getPrice(priceId: string): Promise<Response>;
```

> Успішні сценарії повертають `Response` зі статусом `200`.
> Помилки повертаються через `Promise.reject(Response)` зі статусами `400/404/425`.

## 📦 Моделі даних

```ts
type Country = { id: string; name: string; flag: string };
type City = { id: number; name: string };
type Hotel = {
  id: number;
  name: string;
  img: string;
  cityId: number;
  cityName: string;
  countryId: string;
  countryName: string;
};

type CountriesMap = Record<string, Country>;
type HotelsMap = Record<string, Hotel>;

type PriceOffer = {
  id: string;
  amount: number;
  currency: 'usd';
  startDate: string;
  endDate: string;
  hotelID?: string;
};

type PricesMap = Record<string, PriceOffer>;

type GeoEntity =
  | (Country & { type: 'country' })
  | (City & { type: 'city' })
  | (Hotel & { type: 'hotel' });

type GeoResponse = Record<string, GeoEntity>;

type ErrorResponse = {
  code: number;
  error: true;
  message: string;
  waitUntil?: string;
};

type StartSearchResponse = {
  token: string;
  waitUntil: string;
};

type GetSearchPricesResponse = {
  prices: PricesMap;
};

type StopSearchResponse = {
  status: 'cancelled';
  message: string;
};
```

## 🔧 Опис функцій

### `getCountries(): Promise<Response>`

Повертає словник країн.

- **200 OK** → `CountriesMap`

### `searchGeo(query?: string): Promise<Response>`

Імітує підказки для країн/міст/готелів.

- **200 OK** → `GeoResponse`

### `startSearchPrices(countryID: string): Promise<Response>`

Стартує пошук цін по країні.

- **200 OK** → `StartSearchResponse`
- **400 Bad Request** → `ErrorResponse`

### `getSearchPrices(token: string): Promise<Response>`

Повертає результати пошуку цін або статус «ще не готово».

- **200 OK** → `GetSearchPricesResponse`
- **404 Not Found** → `ErrorResponse`
- **425 Too Early** → `ErrorResponse`

### `stopSearchPrices(token: string): Promise<Response>`

Скасовує активний пошук.

- **200 OK** → `StopSearchResponse`
- **404 Not Found** → `ErrorResponse`

### `getHotels(countryID: string): Promise<Response>`

Повертає словник готелів у країні.

- **200 OK** → `HotelsMap`

### `getHotel(hotelId: number | string): Promise<Response>`

Повертає деталі готелю.

- **200 OK** → `Hotel`
- **404 Not Found** → `ErrorResponse`

### `getPrice(priceId: string): Promise<Response>`

Повертає ціну по конкретному `priceId`.

- **200 OK** → `PriceOffer`
- **404 Not Found** → `ErrorResponse`
