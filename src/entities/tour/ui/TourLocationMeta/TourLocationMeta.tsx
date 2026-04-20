import { Icon } from '@shared/ui';

import styles from './TourLocationMeta.module.scss';

interface TourLocationMetaProps {
  countryFlagUrl?: string;
  countryName?: string;
  cityName?: string;
  inlineLabel?: string;
}

export function TourLocationMeta({
  countryFlagUrl,
  countryName,
  cityName,
  inlineLabel
}: TourLocationMetaProps) {
  if (inlineLabel) {
    return (
      <p className={styles.inline}>
        {countryFlagUrl ? (
          <img
            alt=""
            className={styles.flag}
            height={16}
            src={countryFlagUrl}
            width={22}
          />
        ) : null}
        <span>{inlineLabel}</span>
      </p>
    );
  }

  return (
    <div className={styles.rows}>
      {countryName ? (
        <p className={styles.row}>
          <span className={styles.icon} aria-hidden>
            <Icon name="globe" size={18} />
          </span>
          {countryFlagUrl ? (
            <img
              alt=""
              className={styles.flag}
              height={16}
              src={countryFlagUrl}
              width={22}
            />
          ) : null}
          <span>{countryName}</span>
        </p>
      ) : null}
      {cityName ? (
        <p className={styles.row}>
          <span className={styles.icon} aria-hidden>
            <Icon name="city" size={18} />
          </span>
          <span>{cityName}</span>
        </p>
      ) : null}
    </div>
  );
}
