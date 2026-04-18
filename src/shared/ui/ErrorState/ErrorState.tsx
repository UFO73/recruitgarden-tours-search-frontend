import type { ReactNode } from 'react';

import { Card } from '@shared/ui/Card';

import styles from './ErrorState.module.scss';

export interface ErrorStateProps {
  className?: string;
  title: string;
  description?: string;
  icon?: ReactNode;
}

export function ErrorState({ className, title, description, icon }: ErrorStateProps) {
  const classes = [styles.state, className].filter(Boolean).join(' ');

  return (
    <Card className={classes}>
      {icon ? <div className={styles.iconWrap}>{icon}</div> : null}
      <h2 className={styles.title}>{title}</h2>
      {description ? <p className={styles.description}>{description}</p> : null}
    </Card>
  );
}
