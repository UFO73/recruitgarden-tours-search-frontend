import { Link, useParams } from 'react-router-dom';

import { TourDetailsCard, useTourDetails } from '@features/tour-details';
import { Card, ErrorState, Icon, Spinner } from '@shared/ui';

import styles from './TourPage.module.scss';

export function TourPage() {
  const { priceId: priceIdParam, hotelId: hotelIdParam } = useParams<{
    priceId: string;
    hotelId: string;
  }>();
  const tourDetails = useTourDetails({ priceIdParam, hotelIdParam });

  if (tourDetails.status === 'loading') {
    return (
      <div className={styles.page}>
        <Card className={styles.stateCard}>
          <Spinner />
          <p className={styles.stateText}>Завантажуємо тур…</p>
        </Card>
      </div>
    );
  }

  if (tourDetails.status === 'error') {
    return (
      <div className={styles.page}>
        <ErrorState
          description={tourDetails.errorMessage}
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

  return (
    <div className={styles.page}>
      <TourDetailsCard data={tourDetails.data} />

      <Link className={styles.backLink} to="/">
        <Icon className={styles.backLinkIcon} name="chevron-left" size={18} />
        До пошуку
      </Link>
    </div>
  );
}
