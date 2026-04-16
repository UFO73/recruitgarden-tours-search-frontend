import type { ReactNode } from 'react';

import styles from './Popover.module.scss';

type PopoverAlign = 'start' | 'center' | 'end';

export interface PopoverProps {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  isOpen: boolean;
  align?: PopoverAlign;
  trigger: ReactNode;
}

export function Popover({
  children,
  className,
  contentClassName,
  isOpen,
  align = 'start',
  trigger
}: PopoverProps) {
  const rootClasses = [styles.popover, className].filter(Boolean).join(' ');
  const contentClasses = [styles.content, styles[align], contentClassName]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClasses}>
      <div className={styles.trigger}>{trigger}</div>
      {isOpen ? <div className={contentClasses}>{children}</div> : null}
    </div>
  );
}
