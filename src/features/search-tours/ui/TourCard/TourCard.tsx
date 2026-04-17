import { Link } from 'react-router-dom';

import type { TourCardModel } from '@entities/tour/model';

import styles from './TourCard.module.scss';

interface TourCardProps {
  tour: TourCardModel;
}

export function TourCard({ tour }: TourCardProps) {
  const to = `/tour/${encodeURIComponent(tour.priceId)}/hotel/${tour.hotelId}`;

  return (
    <article className={styles.card}>
      <div className={styles.imageWrap}>
        {tour.imageUrl ? (
          <img
            alt={tour.hotelName}
            className={styles.image}
            loading="lazy"
            src={tour.imageUrl}
          />
        ) : (
          <div className={styles.imagePlaceholder} role="img" />
        )}
      </div>
      <div className={styles.body}>
        <h3 className={styles.hotelName}>{tour.hotelName}</h3>
        <p className={styles.location}>
          {tour.countryFlagUrl ? (
            <img
              alt=""
              className={styles.flag}
              height={16}
              src={tour.countryFlagUrl}
              width={22}
            />
          ) : null}
          <span>{tour.locationLabel}</span>
        </p>
        <div className={styles.dateBlock}>
          <span className={styles.dateLabel}>Старт туру</span>
          <span className={styles.dateValue}>{tour.startDateLabel}</span>
        </div>
        <p className={styles.price}>{tour.priceLabel}</p>
        <Link className={styles.link} to={to}>
          Відкрити ціну
        </Link>
      </div>
    </article>
  );
}
