import type { HOME_CATEGORIES } from './constants';

export type MapPosition = {
  lat: number;
  lng: number;
};

export type HomeCategory = (typeof HOME_CATEGORIES)[number];

export type CurrentPositionError =
  | { reason: 'permissionDenied'; message: string }
  | { reason: 'positionUnavailable'; message: string }
  | { reason: 'timeout'; message: string }
  | { reason: 'servicesDisabled'; message: string };

export type MapSticker = {
  id: string;
  image: string;
  isLiked: boolean;
  label: string;
  place: MapPlaceDetail;
  position: MapPosition;
  visitCount: number;
};

export type MapPlaceDetail = {
  address: string;
  category: HomeCategory;
  id: string;
  isRegular: boolean;
  name: string;
  stickerImages: readonly string[];
};

export type ShopRecommendationReason = '나의 관심 카테고리' | '내 동네에서 많이 방문한 곳';

export type ShopRecommendation = {
  googleMapsUri?: string | null;
  id: string;
  isLiked: boolean;
  place: MapPlaceDetail;
  position: MapPosition;
  reason: ShopRecommendationReason;
  thumbnailSrc: string | null;
  visitCount: number;
};
