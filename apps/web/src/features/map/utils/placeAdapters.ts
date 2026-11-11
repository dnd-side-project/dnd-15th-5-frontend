import type {
  NearbyPlacesResponse,
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
} from '@/features/map/types';
import { StickerEyesImage, getStickerImage } from '@/shared/assets/images/stickers';

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

    const image =
      getStickerImage({ imageUrl: place.imageUrl, itemName: place.stickerName }) ??
      StickerEyesImage;
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

/** 목록에서 지도 이동할 때 전달된 장소 정보로 지도 마커 데이터를 만듭니다. */
export const toLikedPlaceNavigationRecommendation = (
  navigation: LikedPlaceMapNavigation
): ShopRecommendation => ({
  id: navigation.placeId,
  isLiked: true,
  place: {
    id: navigation.placeId,
    name: navigation.name,
    category: navigation.category,
    address: navigation.address?.trim() || undefined,
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
    address: sticker.place.address?.trim() ?? '',
    photoUrl: null,
    latitude,
    longitude,
  };
};

const toRecommendation = (place: RecommendedPlaceItem): ShopRecommendation | null => {
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
      address: place.dongName?.trim() || undefined,
      isRegular: false,
      stickerImages: [],
    },
    position: { lat: place.latitude, lng: place.longitude },
    reason: '카테고리별 인기 가게',
    thumbnailSrc: place.thumbnailUrl ?? null,
    visitCount: place.visitCount ?? 0,
  };
};

/** 카테고리별 인기 장소 응답을 같은 장소가 중복되지 않는 캐러셀 모델로 변환합니다. */
export const toShopRecommendations = (response?: NearbyPlacesResponse): ShopRecommendation[] => {
  const categoryPlaces = (response?.categoryPlaces ?? []).flatMap((group) => group.places ?? []);
  const allPlaces = response?.allPlaces ?? [];
  const likedByPlaceId = new Map<string, boolean>();

  for (const place of [...categoryPlaces, ...allPlaces]) {
    if (place.placeId === undefined || typeof place.liked !== 'boolean') continue;
    const id = String(place.placeId);
    if (!likedByPlaceId.has(id)) likedByPlaceId.set(id, place.liked);
  }

  const candidates = (allPlaces.length > 0 ? allPlaces : categoryPlaces).map(toRecommendation);
  const seenPlaceIds = new Set<string>();

  return candidates.flatMap((recommendation) => {
    if (!recommendation || seenPlaceIds.has(recommendation.id)) {
      return [];
    }

    seenPlaceIds.add(recommendation.id);
    return [
      {
        ...recommendation,
        isLiked: likedByPlaceId.get(recommendation.id) ?? recommendation.isLiked,
      },
    ];
  });
};
