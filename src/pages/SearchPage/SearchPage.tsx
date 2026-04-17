import { SearchToursSection } from '@features/search-tours/ui';

import styles from './SearchPage.module.scss';

export function SearchPage() {
  return (
    <div className={styles.page}>
      <SearchToursSection />
    </div>
  );
}
