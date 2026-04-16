import styles from './Spinner.module.scss';

type SpinnerSize = 'sm' | 'md';

export interface SpinnerProps {
  className?: string;
  size?: SpinnerSize;
}

export function Spinner({ className, size = 'md' }: SpinnerProps) {
  const classes = [styles.spinner, styles[size], className].filter(Boolean).join(' ');

  return <span className={classes} aria-label="Loading" role="status" />;
}
