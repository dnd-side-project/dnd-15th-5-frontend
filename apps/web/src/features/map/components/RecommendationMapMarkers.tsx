import { AdvancedMarker, useMap } from '@vis.gl/react-google-maps';
import { useEffect, useRef } from 'react';

import { useNearbyPlaceRecommendationsQuery } from '@/features/map/apis/hooks/useNearbyPlaceRecommendationsQuery';
import { useVisitedPlaceStickersQuery } from '@/features/map/apis/hooks/useVisitedPlaceStickersQuery';
import { RECOMMENDATION_MAP_ZOOM } from '@/features/map/constants';
import { useCreatedPlaceStamp } from '@/features/map/hooks/useCreatedPlaceStamp';
import { useFocusMapOnPosition } from '@/features/map/hooks/useFocusMapOnPosition';
import { useHomeBottomSheetStore } from '@/features/map/stores/homeBottomSheetStore';
import { useLocationSelectionStore } from '@/features/map/stores/locationSelectionStore';
import { useMapCategoryFilterStore } from '@/features/map/stores/mapCategoryFilterStore';
import { useShopRecommendationStore } from '@/features/map/stores/shopRecommendationStore';
import type { HomeCategory, ShopRecommendation } from '@/features/map/types';
import {
  ShoppingPinActiveIcon,
  ShoppingPinIcon,
  BeautyPinActiveIcon,
  BeautyPinIcon,
  ExercisePinActiveIcon,
  ExercisePinIcon,
  MarketPinActiveIcon,
  MarketPinIcon,
  OtherPinActiveIcon,
  OtherPinIcon,
  CafePinActiveIcon,
  CafePinIcon,
  HobbyPinActiveIcon,
  HobbyPinIcon,
  LikedPlacePinActiveIcon,
  LikedPlacePinIcon,
  RestaurantPinActiveIcon,
  RestaurantPinIcon,
} from '@/shared/assets/icons';
import { cn } from '@/shared/lib/cn';

import type { ComponentType, SVGProps } from 'react';

import './recommendationMapMarkers.css';
import '@/shared/styles/stickerStamp.css';

function RecommendationMarkerIcon({
  placeId,
  isActive,
  Icon,
}: {
  placeId: string;
  isActive: boolean;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
}) {
  const stamp = useCreatedPlaceStamp(placeId);
  return (
    <Icon
      key={`${isActive ? 'active' : 'default'}-${stamp.animationKey}`}
      aria-hidden="true"
      data-state={isActive ? 'active' : 'default'}
      onAnimationEnd={stamp.onAnimationEnd}
      className={cn(
        stamp.isPlaying
          ? 'map-place-stamp sticker-stamp-playing'
          : stamp.animationKey === 0 && 'recommendation-marker-icon',
        'block',
        isActive ? 'h-18 w-14' : 'size-9'
      )}
    />
  );
}

type RecommendationMarkerIcons = {
  active: ComponentType<SVGProps<SVGSVGElement>>;
  default: ComponentType<SVGProps<SVGSVGElement>>;
};

const ACTIVE_MARKER_TIP_OFFSET_PX = 58;

const LIKE_MARKER_ICONS: RecommendationMarkerIcons = {
  active: LikedPlacePinActiveIcon,
  default: LikedPlacePinIcon,
};

const CATEGORY_MARKER_ICONS: Record<HomeCategory, RecommendationMarkerIcons> = {
  카페: { active: CafePinActiveIcon, default: CafePinIcon },
  음식점: { active: RestaurantPinActiveIcon, default: RestaurantPinIcon },
  '취미/놀거리': { active: HobbyPinActiveIcon, default: HobbyPinIcon },
  운동: { active: ExercisePinActiveIcon, default: ExercisePinIcon },
  '편의점/마트': { active: MarketPinActiveIcon, default: MarketPinIcon },
  '미용/뷰티': { active: BeautyPinActiveIcon, default: BeautyPinIcon },
  기타: { active: OtherPinActiveIcon, default: OtherPinIcon },
  쇼핑: { active: ShoppingPinActiveIcon, default: ShoppingPinIcon },
};

const getRecommendationMarkerIcons = ({ isLiked, place }: ShopRecommendation) => {
  if (isLiked) {
    return LIKE_MARKER_ICONS;
  }

  return CATEGORY_MARKER_ICONS[place.category];
};

/** 추천 가게와 좋아요 장소를 카테고리 필터에 맞춰 표시하고, 선택 시 지도와 시트를 동기화합니다. */
export default function RecommendationMapMarkers() {
  const map = useMap();
  const focusMap = useFocusMapOnPosition(map);
  const activeSheet = useHomeBottomSheetStore((state) => state.activeSheet);
  const showLikedRecommendation = useHomeBottomSheetStore((state) => state.showLikedRecommendation);
  const showRecommendation = useHomeBottomSheetStore((state) => state.showRecommendation);
  const showRecommendationPlace = useHomeBottomSheetStore((state) => state.showRecommendationPlace);
  const activeRecommendationId = useShopRecommendationStore(
    (state) => state.activeRecommendationId
  );
  const setActiveRecommendation = useShopRecommendationStore(
    (state) => state.setActiveRecommendation
  );
  const isRecommendationOpen = activeSheet.type === 'recommendation';
  const isRecommendationDetailOpen = activeSheet.type === 'recommendationPlace';
  const isRecommendationFlow = isRecommendationOpen || isRecommendationDetailOpen;
  const recommendationCategory = useShopRecommendationStore((state) => state.selectedCategory);
  const confirmedPosition = useLocationSelectionStore((state) => state.confirmedPosition);
  const isLikedRecommendationOpen = activeSheet.type === 'likedRecommendation';
  const selectedRecommendationId =
    isLikedRecommendationOpen || isRecommendationDetailOpen
      ? activeSheet.recommendationId
      : isRecommendationOpen
        ? activeRecommendationId
        : null;
  const visibleHeightPx = useHomeBottomSheetStore((state) => state.visibleHeightPx) || undefined;
  const selectedCategory = useMapCategoryFilterStore((state) => state.selectedCategory);
  const { recommendations } = useNearbyPlaceRecommendationsQuery(
    isRecommendationFlow && Boolean(confirmedPosition)
  );
  const { likedRecommendations } = useVisitedPlaceStickersQuery();
  const likedRecommendationById = new Map(
    (isRecommendationFlow ? [] : likedRecommendations).map((recommendation) => [
      recommendation.id,
      recommendation,
    ])
  );
  recommendations.forEach((recommendation) => {
    const isLiked = recommendation.isLiked || likedRecommendationById.has(recommendation.id);
    if (isRecommendationFlow || isLiked) {
      likedRecommendationById.set(recommendation.id, {
        ...recommendation,
        ...likedRecommendationById.get(recommendation.id),
        isLiked,
      });
    }
  });
  const visibleRecommendations = [...likedRecommendationById.values()].filter(({ place }) => {
    const category = isRecommendationFlow ? recommendationCategory : selectedCategory;
    return !category || place.category === category;
  });
  const lastFocusedRecommendationIdRef = useRef<string | null>(null);
  const lastFocusedVisibleHeightPxRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!isRecommendationFlow || !selectedRecommendationId) {
      lastFocusedRecommendationIdRef.current = null;
      return;
    }
    if (!map) return;

    // NOTE: id와 시트 실측 높이가 둘 다 이전과 같으면(= handleMarkerSelect가 이미 처리했거나
    // 직전 실행과 동일) 다시 포커스하지 않는다. 높이만 바뀐 경우(콘텐츠 리플로우 등)는
    // 같은 추천이라도 다시 포커스해서 핀이 바뀐 시트 높이에 가려지지 않게 한다.
    if (
      lastFocusedRecommendationIdRef.current === selectedRecommendationId &&
      lastFocusedVisibleHeightPxRef.current === visibleHeightPx
    ) {
      return;
    }

    const activeRecommendation = recommendations.find(({ id }) => id === selectedRecommendationId);
    if (!activeRecommendation) {
      return;
    }

    lastFocusedRecommendationIdRef.current = selectedRecommendationId;
    lastFocusedVisibleHeightPxRef.current = visibleHeightPx;
    focusMap(activeRecommendation.position, RECOMMENDATION_MAP_ZOOM, visibleHeightPx);
  }, [
    selectedRecommendationId,
    recommendations,
    focusMap,
    map,
    isRecommendationFlow,
    visibleHeightPx,
  ]);

  const handleMarkerSelect = (recommendation: ShopRecommendation) => {
    lastFocusedRecommendationIdRef.current = recommendation.id;
    lastFocusedVisibleHeightPxRef.current = visibleHeightPx;
    focusMap(recommendation.position, RECOMMENDATION_MAP_ZOOM, visibleHeightPx);
    setActiveRecommendation(recommendation.id);
    if (isRecommendationFlow) {
      showRecommendationPlace(recommendation.id);
      return;
    }
    if (recommendation.isLiked) {
      showLikedRecommendation(recommendation.id);
      return;
    }

    showRecommendation();
  };

  if (isRecommendationFlow && !confirmedPosition) return null;

  return (
    <>
      {visibleRecommendations.map((recommendation) => {
        const markerIcons = getRecommendationMarkerIcons(recommendation);
        const isActive = recommendation.id === selectedRecommendationId;
        const MarkerIcon = isActive ? markerIcons.active : markerIcons.default;
        // 선택 SVG의 핀 끝은 y=58이며 그 아래는 그림자 여백입니다.
        const anchorTop = isActive ? `-${ACTIVE_MARKER_TIP_OFFSET_PX}px` : '-50%';

        return (
          <AdvancedMarker
            key={recommendation.id}
            position={recommendation.position}
            anchorLeft="-50%"
            anchorTop={anchorTop}
            zIndex={isActive ? 2 : 1}
            title={`${recommendation.place.name} 추천 마커${isActive ? ', 선택됨' : ''}`}
            onClick={() => handleMarkerSelect(recommendation)}
          >
            <RecommendationMarkerIcon
              key={isActive ? 'active' : 'default'}
              placeId={recommendation.id}
              isActive={isActive}
              Icon={MarkerIcon}
            />
          </AdvancedMarker>
        );
      })}
    </>
  );
}
