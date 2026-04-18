import { Card, EmptyState, ErrorState, Icon, Spinner } from '@shared/ui';
import type { ViewState } from '@shared/lib';

import styles from './SearchStatusPanel.module.scss';

interface SearchStatusPanelProps {
  viewState: ViewState<unknown>;
}

export function SearchStatusPanel({ viewState }: SearchStatusPanelProps) {
  if (viewState.status === 'loading') {
    return (
      <Card className={styles.loadingCard}>
        <Spinner />
        <div className={styles.loadingContent}>
          <h2 className={styles.title}>Шукаємо тури</h2>
          <p className={styles.description}>
            Очікуємо доступне вікно запиту та завантажуємо результати.
          </p>
        </div>
      </Card>
    );
  }

  if (viewState.status === 'error') {
    return (
      <ErrorState
        description={viewState.errorMessage}
        icon={<Icon name="alert" size={32} />}
        title="Не вдалося виконати пошук"
      />
    );
  }

  if (viewState.status === 'empty') {
    return (
      <EmptyState
        description="Спробуйте змінити напрямок пошуку."
        icon={<Icon name="search" size={32} />}
        title="За вашим запитом турів не знайдено"
      />
    );
  }

  return null;
}
