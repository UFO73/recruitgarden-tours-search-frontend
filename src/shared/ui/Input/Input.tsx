import { forwardRef, type InputHTMLAttributes } from 'react';

import styles from './Input.module.scss';

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => {
    const classes = [styles.input, className].filter(Boolean).join(' ');

    return <input ref={ref} type={type} className={classes} {...props} />;
  }
);

Input.displayName = 'Input';
