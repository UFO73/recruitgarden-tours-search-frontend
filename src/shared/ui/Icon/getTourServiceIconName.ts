import type { IconName } from './Icon';

const SERVICE_ICON_BY_KEY: Partial<Record<string, IconName>> = {
  wifi: 'wifi',
  aquapark: 'waves',
  tennis_court: 'tennis',
  laundry: 'laundry',
  parking: 'car'
};

export function getTourServiceIconName(serviceKey: string): IconName {
  return SERVICE_ICON_BY_KEY[serviceKey] ?? 'check';
}
