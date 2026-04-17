import { SearchToursSection } from '@features/search-tours/ui';

import styles from './SearchPage.module.scss';

export function SearchPage() {
  return (
    <main className={styles.page}>
      <SearchToursSection />
    </main>
  );
}
