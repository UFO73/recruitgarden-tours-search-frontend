import type { IconName } from './Icon';

const SERVICE_ICON_BY_KEY: Partial<Record<string, IconName>> = {
  wifi: 'wifi',
  aquapark: 'waves',
  pool: 'waves',
  swimming_pool: 'waves',
  tennis_court: 'tennis',
  laundry: 'laundry',
  parking: 'car',
  meal: 'utensils',
  food: 'utensils',
  dining: 'utensils'
};

export function getTourServiceIconName(serviceKey: string): IconName {
  return SERVICE_ICON_BY_KEY[serviceKey] ?? 'check';
}
