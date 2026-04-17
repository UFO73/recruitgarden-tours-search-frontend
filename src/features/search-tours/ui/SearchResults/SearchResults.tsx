import type { TourCardModel } from '@entities/tour/model';

import { TourCard } from '../TourCard';

import styles from './SearchResults.module.scss';

interface SearchResultsProps {
  cards: TourCardModel[];
}

export function SearchResults({ cards }: SearchResultsProps) {
  return (
    <div className={styles.wrap}>
      <ul className={styles.grid}>
        {cards.map((tour) => (
          <li key={tour.priceId} className={styles.item}>
            <TourCard tour={tour} />
          </li>
        ))}
      </ul>
    </div>
  );
}
