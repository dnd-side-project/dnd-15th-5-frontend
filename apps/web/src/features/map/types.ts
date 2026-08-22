import type { HOME_CATEGORIES } from './constants';

export type MapPosition = {
  lat: number;
  lng: number;
};

export type HomeCategoryFilterValue = (typeof HOME_CATEGORIES)[number] | 'recommendation';

export type CurrentPositionError =
  | { reason: 'permissionDenied'; message: string }
  | { reason: 'positionUnavailable'; message: string }
  | { reason: 'timeout'; message: string }
  | { reason: 'servicesDisabled'; message: string };

export type MapSticker = {
  id: string;
  image: string;
  label: string;
  position: MapPosition;
  visitCount: number;
};
