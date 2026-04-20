import { TourHotelMedia, TourLocationMeta } from '@entities/tour/ui';
import { Icon } from '@shared/ui';
import { getTourServiceIconName } from '@shared/ui/Icon/getTourServiceIconName';
import type { IconName } from '@shared/ui/Icon';

import type { TourDetailsData } from '../../model';

import styles from './TourDetailsCard.module.scss';

interface TourDetailsCardProps {
  data: TourDetailsData;
}

function isServiceActive(value: string) {
  const normalized = value.trim().toLowerCase();

  return normalized === 'yes' || normalized === 'true' || normalized === 'так';
}

export function TourDetailsCard({ data }: TourDetailsCardProps) {
  const { details } = data;

  return (
    <article className={styles.card}>
      <h1 className={styles.title}>{details.hotelName}</h1>
      <TourLocationMeta
        cityName={data.cityName}
        countryFlagUrl={data.countryFlagUrl}
        countryName={data.countryName}
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
        <time className={styles.period} dateTime={data.priceStartDate}>
          {details.periodLabel}
        </time>
      </div>

      <div className={styles.footer}>
        <p className={styles.price}>{details.priceLabel}</p>
      </div>
    </article>
  );
}
