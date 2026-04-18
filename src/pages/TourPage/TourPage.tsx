import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';

import type { Country } from '@entities/country/model';
import { useCountriesQuery } from '@entities/country/model/useCountriesQuery';
import type { Hotel } from '@entities/hotel/model';
import { useHotelDetailsQuery } from '@entities/hotel/model/useHotelDetailsQuery';
import type { Price } from '@entities/price/model';
import { usePriceDetailsQuery } from '@entities/price/model/usePriceDetailsQuery';
import { mapTourDetailsModel, type TourDetailsModel } from '@entities/tour/model';
import { TourHotelMedia, TourLocationMeta } from '@features/search-tours/ui';
import { getTourServiceIconName } from '@shared/ui/Icon/getTourServiceIconName';
import { Card, ErrorState, Icon, Spinner } from '@shared/ui';
import type { IconName } from '@shared/ui/Icon';

import styles from './TourPage.module.scss';

function getCountryFlagUrl(
  countryId: string | undefined,
  countries: Country[] | undefined
): string | undefined {
  if (!countryId || !countries) {
    return undefined;
  }

  return countries.find((country) => country.id === countryId)?.flagUrl;
}

function getTourDetails(
  hotel: Hotel | undefined,
  price: Price | undefined
): TourDetailsModel | null {
  if (!hotel || !price) {
    return null;
  }

  return mapTourDetailsModel(hotel, price);
}

function isServiceActive(value: string) {
  const normalized = value.trim().toLowerCase();

  return normalized === 'yes' || normalized === 'true' || normalized === 'так';
}

export function TourPage() {
  const { priceId: priceIdParam, hotelId: hotelIdParam } = useParams<{
    priceId: string;
    hotelId: string;
  }>();

  const priceId = priceIdParam ? decodeURIComponent(priceIdParam) : '';
  const hotelIdNum = hotelIdParam !== undefined ? Number(hotelIdParam) : NaN;
  const hotelIdValid = Number.isFinite(hotelIdNum) && hotelIdNum >= 0;

  const priceQuery = usePriceDetailsQuery(priceId || undefined, {
    enabled: Boolean(priceId)
  });
  const hotelQuery = useHotelDetailsQuery(hotelIdValid ? hotelIdNum : undefined, {
    enabled: hotelIdValid
  });
  const countriesQuery = useCountriesQuery();
  const countryList = useMemo<Country[]>(
    () => countriesQuery.data ?? [],
    [countriesQuery.data]
  );
  const hotel: Hotel | undefined = hotelQuery.data;
  const price: Price | undefined = priceQuery.data;

  const details = useMemo(() => getTourDetails(hotel, price), [hotel, price]);

  const countryFlagUrl = useMemo(
    () => getCountryFlagUrl(hotel?.countryId, countryList),
    [countryList, hotel?.countryId]
  );

  const isLoading = priceQuery.isPending || hotelQuery.isPending;
  const paramsInvalid = !priceId || !hotelIdValid;
  const queriesFailed = priceQuery.isError || hotelQuery.isError;
  const readyButNoDetails =
    priceQuery.isSuccess && hotelQuery.isSuccess && details === null;
  const showError =
    !isLoading && (paramsInvalid || queriesFailed || readyButNoDetails || !details);

  const errorMessage = useMemo(() => {
    if (!priceId) {
      return 'Не передано ідентифікатор пропозиції.';
    }

    if (!hotelIdValid) {
      return 'Некоректний ідентифікатор готелю.';
    }

    if (priceQuery.error instanceof Error) {
      return priceQuery.error.message;
    }

    if (hotelQuery.error instanceof Error) {
      return hotelQuery.error.message;
    }

    return 'Не вдалося завантажити дані туру.';
  }, [hotelIdValid, hotelQuery.error, priceId, priceQuery.error]);

  if (isLoading) {
    return (
      <div className={styles.page}>
        <Card className={styles.stateCard}>
          <Spinner />
          <p className={styles.stateText}>Завантажуємо тур…</p>
        </Card>
      </div>
    );
  }

  if (showError) {
    return (
      <div className={styles.page}>
        <ErrorState
          description={errorMessage}
          icon={<Icon name="alert" size={32} />}
          title="Помилка"
        />
        <Link className={styles.backLink} to="/">
          <Icon className={styles.backLinkIcon} name="chevron-left" size={18} />
          До пошуку
        </Link>
      </div>
    );
  }

  if (!details || !hotel || !price) {
    return null;
  }

  return (
    <div className={styles.page}>
      <article className={styles.card}>
        <h1 className={styles.title}>{details.hotelName}</h1>
        <TourLocationMeta
          cityName={hotel.cityName}
          countryFlagUrl={countryFlagUrl}
          countryName={hotel.countryName}
        />

        <div className={styles.media}>
          <TourHotelMedia
            hotelName={details.hotelName}
            imageUrl={details.imageUrl}
            variant="detail"
          />
        </div>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Опис</h2>
          <p className={styles.description}>{details.description}</p>
        </section>

        {details.services.length > 0 ? (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Сервіси</h2>
            <ul className={styles.services}>
              {details.services.map((service) => {
                const active = isServiceActive(service.value);
                const serviceIconName: IconName = active
                  ? getTourServiceIconName(service.key)
                  : 'minus';

                return (
                  <li key={service.key} className={styles.serviceItem}>
                    <span
                      className={active ? styles.serviceIcon : styles.serviceIconMuted}
                      aria-hidden
                    >
                      <Icon name={serviceIconName} size={18} />
                    </span>
                    <span>{service.label}</span>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        <div className={styles.divider} />

        <div className={styles.dateRow}>
          <span className={styles.dateIcon} aria-hidden>
            <Icon name="calendar" size={20} />
          </span>
          <time className={styles.period} dateTime={price.startDate}>
            {details.periodLabel}
          </time>
        </div>

        <div className={styles.footer}>
          <p className={styles.price}>{details.priceLabel}</p>
          <Link className={styles.cta} to="/">
            Відкрити ціну
          </Link>
        </div>
      </article>

      <Link className={styles.backLink} to="/">
        <Icon className={styles.backLinkIcon} name="chevron-left" size={18} />
        До пошуку
      </Link>
    </div>
  );
}
