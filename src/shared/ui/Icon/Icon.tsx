import styles from './Icon.module.scss';
import { icons } from './icons';

export type IconName = keyof typeof icons;

export interface IconProps {
  className?: string;
  name: IconName;
  size?: number;
  title?: string;
}

export function Icon({ className, name, size = 20, title }: IconProps) {
  const classes = [styles.icon, className].filter(Boolean).join(' ');

  return (
    <svg
      aria-hidden={title ? undefined : true}
      className={classes}
      fill="none"
      height={size}
      role={title ? 'img' : undefined}
      viewBox="0 0 24 24"
      width={size}
    >
      {title ? <title>{title}</title> : null}
      {icons[name]}
    </svg>
  );
}
