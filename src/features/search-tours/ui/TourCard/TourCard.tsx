import { Link } from 'react-router-dom';

import type { TourCardModel } from '@entities/tour/model';
import { TourHotelMedia, TourLocationMeta } from '@entities/tour/ui';
import { Icon } from '@shared/ui';

import styles from './TourCard.module.scss';

interface TourCardProps {
  tour: TourCardModel;
}

export function TourCard({ tour }: TourCardProps) {
  const to = `/tour/${encodeURIComponent(tour.priceId)}/${tour.hotelId}`;

  return (
    <article className={styles.card}>
      <TourHotelMedia
        hotelName={tour.hotelName}
        imageUrl={tour.imageUrl}
        variant="card"
      />
      <div className={styles.body}>
        <h3 className={styles.hotelName}>{tour.hotelName}</h3>
        <TourLocationMeta
          countryFlagUrl={tour.countryFlagUrl}
          inlineLabel={tour.locationLabel}
        />
        <div className={styles.dateBlock}>
          <span className={styles.dateLabel}>Старт туру</span>
          <div className={styles.dateRow}>
            <span className={styles.dateIcon} aria-hidden>
              <Icon name="calendar" size={18} />
            </span>
            <span className={styles.dateValue}>{tour.startDateLabel}</span>
          </div>
        </div>
        <p className={styles.price}>{tour.priceLabel}</p>
        <Link className={styles.link} to={to}>
          Відкрити ціну
        </Link>
      </div>
    </article>
  );
}
