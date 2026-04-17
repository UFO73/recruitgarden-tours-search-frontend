import { checkIcon } from './check';
import { chevronDownIcon } from './chevronDown';
import { cityIcon } from './city';
import { globeIcon } from './globe';
import { hotelIcon } from './hotel';
import { searchIcon } from './search';

export const icons = {
  check: checkIcon,
  'chevron-down': chevronDownIcon,
  city: cityIcon,
  globe: globeIcon,
  hotel: hotelIcon,
  search: searchIcon
} as const;
