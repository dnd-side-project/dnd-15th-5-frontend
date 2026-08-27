import type { RecommendedPlaceItem, VisitedPlaceMarkerItem } from '@/features/map/apis/dto';
import { HOME_CATEGORIES } from '@/features/map/constants';
import type {
  HomeCategory,
  MapSticker,
  ShopRecommendation,
  ShopRecommendationReason,
} from '@/features/map/types';
import { StickerEyesImage, getStickerImageByName } from '@/shared/assets/images/stickers';

const DEFAULT_CATEGORY: HomeCategory = '기타';

export const normalizeHomeCategory = (category?: string): HomeCategory =>
  HOME_CATEGORIES.find((item) => item === category) ?? DEFAULT_CATEGORY;

/** 방문 장소 API 응답 중 지도에 표시할 수 있는 항목만 스티커 모델로 변환합니다. */
export const toMapStickers = (places?: VisitedPlaceMarkerItem[]): MapSticker[] =>
  (places ?? []).flatMap((place) => {
    if (
      place.placeId === undefined ||
      !place.placeName ||
      place.latitude === undefined ||
      place.longitude === undefined
    ) {
      return [];
    }

    const image = getStickerImageByName(place.stickerName) ?? StickerEyesImage;
    const category = normalizeHomeCategory(place.category);

    return [
      {
        id: String(place.placeId),
        image,
        isLiked: Boolean(place.liked),
        label: place.stickerName ?? category,
        place: {
          id: String(place.placeId),
          name: place.placeName,
          category,
          address: '',
          isRegular: false,
          stickerImages: [image],
        },
        position: { lat: place.latitude, lng: place.longitude },
        visitCount: place.visitCount ?? 0,
      },
    ];
  });

const toRecommendation = (
  place: RecommendedPlaceItem,
  reason: ShopRecommendationReason
): ShopRecommendation | null => {
  if (
    place.placeId === undefined ||
    !place.name ||
    place.latitude === undefined ||
    place.longitude === undefined
  ) {
    return null;
  }

  return {
    googleMapsUri: place.googleMapsUri ?? null,
    id: String(place.placeId),
    isLiked: Boolean(place.liked),
    place: {
      id: String(place.placeId),
      name: place.name,
      category: normalizeHomeCategory(place.category),
      address: place.dongName ?? '',
      isRegular: false,
      stickerImages: [],
    },
    position: { lat: place.latitude, lng: place.longitude },
    reason,
    thumbnailSrc: place.thumbnailUrl ?? null,
    visitCount: place.visitCount ?? 0,
  };
};

/** 추천 사유별 응답을 같은 장소가 중복되지 않는 캐러셀 모델로 변환합니다. */
export const toShopRecommendations = ({
  sameCategoryPlaces,
  myTownPlaces,
}: {
  sameCategoryPlaces?: RecommendedPlaceItem[];
  myTownPlaces?: RecommendedPlaceItem[];
}): ShopRecommendation[] => {
  const candidates = [
    ...(sameCategoryPlaces ?? []).map((place) => toRecommendation(place, '나의 관심 카테고리')),
    ...(myTownPlaces ?? []).map((place) => toRecommendation(place, '내 동네에서 많이 방문한 곳')),
  ];
  const seenPlaceIds = new Set<string>();

  return candidates.flatMap((recommendation) => {
    if (!recommendation || seenPlaceIds.has(recommendation.id)) {
      return [];
    }

    seenPlaceIds.add(recommendation.id);
    return [recommendation];
  });
};
