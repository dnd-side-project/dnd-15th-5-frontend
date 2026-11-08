import type {
  RecommendedPlaceDetailResponse,
  RecommendedPlaceItem,
  VisitedPlaceMarkerItem,
} from '@/features/map/apis/dto';
import { HOME_CATEGORIES } from '@/features/map/constants';
import type {
  HomeCategory,
  LikedPlaceMapNavigation,
  MapSticker,
  ShopRecommendation,
  ShopRecommendationReason,
} from '@/features/map/types';
import { StickerEyesImage, getStickerImageByName } from '@/shared/assets/images/stickers';

import type { ShopSearchResult } from '@chapchap/shared/shop';

const DEFAULT_CATEGORY: HomeCategory = '기타';

export const normalizeHomeCategory = (category?: string): HomeCategory =>
  HOME_CATEGORIES.find((item) => item === category) ?? DEFAULT_CATEGORY;

/** 방문 장소 API 응답 중 지도에 표시할 수 있는 항목만 스티커 모델로 변환합니다. */
export const toMapStickers = (places?: VisitedPlaceMarkerItem[]): MapSticker[] =>
  (places ?? []).flatMap((place) => {
    // NOTE: 백엔드가 방문하지 않고 좋아요만 한 장소를 visitCount 0으로 함께 반환하고 있다.
    // 지도 스티커는 소비 기록으로 획득한 장소만 표시해야 하므로 백엔드 수정 전까지 제외한다.
    if (place.visitCount === 0) {
      return [];
    }

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
        googlePlaceId: place.googlePlaceId,
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

/** 방문 횟수와 관계없이 좋아요한 장소를 지도 하트 마커 모델로 변환합니다. */
export const toLikedPlaceRecommendations = (
  places?: VisitedPlaceMarkerItem[]
): ShopRecommendation[] =>
  (places ?? []).flatMap((place) => {
    if (
      !place.liked ||
      place.placeId === undefined ||
      !place.placeName ||
      place.latitude === undefined ||
      place.longitude === undefined
    ) {
      return [];
    }

    const id = String(place.placeId);
    const category = normalizeHomeCategory(place.category);

    return [
      {
        id,
        isLiked: true,
        place: {
          id,
          name: place.placeName,
          category,
          address: '',
          isRegular: false,
          stickerImages: [],
        },
        position: { lat: place.latitude, lng: place.longitude },
        reason: '내 동네에서 많이 방문한 곳' as const,
        thumbnailSrc: null,
        visitCount: place.visitCount ?? 0,
      },
    ];
  });

/**
 * 좋아요 장소 상세 응답과 방문 장소 마커를 바텀시트 모델로 합칩니다.
 */
export const toLikedPlaceRecommendation = (
  placeId: string,
  detail?: RecommendedPlaceDetailResponse,
  fallback?: ShopRecommendation
): ShopRecommendation | undefined => {
  const name = detail?.name ?? fallback?.place.name;
  const latitude = detail?.latitude ?? fallback?.position.lat;
  const longitude = detail?.longitude ?? fallback?.position.lng;

  if (!name || latitude === undefined || longitude === undefined) return undefined;

  return {
    id: placeId,
    isLiked: true,
    place: {
      id: placeId,
      name,
      category: detail?.category
        ? normalizeHomeCategory(detail.category)
        : (fallback?.place.category ?? DEFAULT_CATEGORY),
      address: detail?.roadAddress?.trim() || fallback?.place.address || detail?.dongName || '',
      isRegular: fallback?.place.isRegular ?? false,
      stickerImages: fallback?.place.stickerImages ?? [],
    },
    position: { lat: latitude, lng: longitude },
    reason: fallback?.reason ?? '내 동네에서 많이 방문한 곳',
    thumbnailSrc: detail?.thumbnailUrls?.[0] ?? fallback?.thumbnailSrc ?? null,
    visitCount: fallback?.visitCount ?? 0,
  };
};

/** 상세 응답에 기록에 필요한 장소 정보가 모두 있으면 검색 결과 모델로 변환합니다. */
export const toLikedPlaceRecordShop = (
  detail?: RecommendedPlaceDetailResponse
): ShopSearchResult | undefined => {
  const id = detail?.googlePlaceId?.trim();
  const name = detail?.name?.trim();
  const address = detail?.roadAddress?.trim();
  const latitude = detail?.latitude;
  const longitude = detail?.longitude;

  if (
    !id ||
    !name ||
    !address ||
    typeof latitude !== 'number' ||
    !Number.isFinite(latitude) ||
    typeof longitude !== 'number' ||
    !Number.isFinite(longitude)
  ) {
    return undefined;
  }

  return { id, name, address, latitude, longitude, photoUrl: detail?.thumbnailUrls?.[0] ?? null };
};

/** 목록에서 지도 이동할 때 전달된 장소 정보로 마커·시트 대체 데이터를 만듭니다. */
export const toLikedPlaceNavigationRecommendation = (
  navigation: LikedPlaceMapNavigation
): ShopRecommendation => ({
  id: navigation.placeId,
  isLiked: true,
  place: {
    id: navigation.placeId,
    name: navigation.name,
    category: navigation.category,
    address: navigation.address ?? '',
    isRegular: false,
    stickerImages: [],
  },
  position: navigation.position,
  reason: '내 동네에서 많이 방문한 곳',
  thumbnailSrc: null,
  visitCount: 0,
});

/** 지도 스티커를 소비 기록 폼이 사용하는 가게 모델로 변환합니다. */
export const toShopSearchResult = (sticker?: MapSticker): ShopSearchResult | undefined => {
  const googlePlaceId = sticker?.googlePlaceId?.trim();
  const name = sticker?.place.name.trim();
  const latitude = sticker?.position.lat;
  const longitude = sticker?.position.lng;

  if (
    !sticker ||
    !googlePlaceId ||
    !name ||
    typeof latitude !== 'number' ||
    !Number.isFinite(latitude) ||
    typeof longitude !== 'number' ||
    !Number.isFinite(longitude)
  ) {
    return undefined;
  }

  return {
    id: googlePlaceId,
    name,
    address: sticker.place.address.trim(),
    photoUrl: null,
    latitude,
    longitude,
  };
};

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

/** 카테고리별 인기 장소 응답을 같은 장소가 중복되지 않는 캐러셀 모델로 변환합니다. */
export const toShopRecommendations = ({
  allPlaces,
}: {
  allPlaces?: RecommendedPlaceItem[];
}): ShopRecommendation[] => {
  const candidates = (allPlaces ?? []).map((place) =>
    toRecommendation(place, '카테고리별 인기 가게')
  );
  const seenPlaceIds = new Set<string>();

  return candidates.flatMap((recommendation) => {
    if (!recommendation || seenPlaceIds.has(recommendation.id)) {
      return [];
    }

    seenPlaceIds.add(recommendation.id);
    return [recommendation];
  });
};
