import { SearchForm, type SearchFormSubmitValue } from '@features/search-tours/ui';

import styles from './SearchPage.module.scss';

export function SearchPage() {
  const handleSubmit = (value: SearchFormSubmitValue) => {
    console.log('Search form submit:', value);
  };

  return (
    <main className={styles.page}>
      <SearchForm onSubmit={handleSubmit} />
    </main>
  );
}
