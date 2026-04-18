import type { ReactNode } from 'react';

import { Card } from '@shared/ui/Card';

import styles from './EmptyState.module.scss';

export interface EmptyStateProps {
  className?: string;
  title: string;
  description?: string;
  icon?: ReactNode;
}

export function EmptyState({ className, title, description, icon }: EmptyStateProps) {
  const classes = [styles.state, className].filter(Boolean).join(' ');

  return (
    <Card className={classes}>
      {icon ? <div className={styles.iconWrap}>{icon}</div> : null}
      <h2 className={styles.title}>{title}</h2>
      {description ? <p className={styles.description}>{description}</p> : null}
    </Card>
  );
}
