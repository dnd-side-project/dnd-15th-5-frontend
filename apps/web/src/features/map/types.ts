import type { HOME_CATEGORIES } from './constants';

export type MapPosition = {
  lat: number;
  lng: number;
};

export type HomeCategory = (typeof HOME_CATEGORIES)[number];

/** 좋아요 목록에서 홈 지도로 이동해 해당 장소를 열 때 전달하는 위치 정보입니다. */
export type LikedPlaceMapNavigation = {
  placeId: string;
  category: HomeCategory;
  position: MapPosition;
  name: string;
  address?: string;
};

export type CurrentPositionError =
  | { reason: 'permissionDenied'; message: string }
  | { reason: 'positionUnavailable'; message: string }
  | { reason: 'timeout'; message: string }
  | { reason: 'servicesDisabled'; message: string };

export type MapSticker = {
  googlePlaceId?: string;
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

export type ShopRecommendationReason =
  '나의 관심 카테고리' | '내 동네에서 많이 방문한 곳' | '카테고리별 인기 가게';

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
