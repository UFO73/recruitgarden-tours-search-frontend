import { Card } from '@shared/ui/Card';

import styles from './EmptyState.module.scss';

export interface EmptyStateProps {
  className?: string;
  title: string;
  description?: string;
}

export function EmptyState({ className, title, description }: EmptyStateProps) {
  const classes = [styles.state, className].filter(Boolean).join(' ');

  return (
    <Card className={classes}>
      <h2 className={styles.title}>{title}</h2>
      {description ? <p className={styles.description}>{description}</p> : null}
    </Card>
  );
}
