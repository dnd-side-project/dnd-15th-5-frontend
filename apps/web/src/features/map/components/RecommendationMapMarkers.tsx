import { AdvancedMarker, useMap } from '@vis.gl/react-google-maps';
import { useEffect, useMemo, useRef } from 'react';

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

import type { ComponentType, RefObject, SVGProps } from 'react';

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

type RecommendationFocus = { id: string | null; height?: number };

type RecommendationMapFocusProps = {
  recommendations: ShopRecommendation[];
  selectedId: string | null;
  isMapReady: boolean;
  focusMap: ReturnType<typeof useFocusMapOnPosition>;
  lastFocusRef: RefObject<RecommendationFocus>;
};

/** 시트 높이 변경은 지도 위치만 보정하고 마커 목록을 다시 렌더링하지 않습니다. */
function RecommendationMapFocus({
  recommendations,
  selectedId,
  isMapReady,
  focusMap,
  lastFocusRef,
}: RecommendationMapFocusProps) {
  const height = useHomeBottomSheetStore((state) =>
    selectedId ? state.visibleHeightPx || undefined : undefined
  );

  useEffect(() => {
    if (!selectedId) {
      lastFocusRef.current = { id: null };
      return;
    }
    if (!isMapReady) return;
    if (lastFocusRef.current.id === selectedId && lastFocusRef.current.height === height) return;
    const recommendation = recommendations.find(({ id }) => id === selectedId);
    if (!recommendation) return;
    lastFocusRef.current = { id: selectedId, height };
    focusMap(recommendation.position, RECOMMENDATION_MAP_ZOOM, height);
  }, [selectedId, height, isMapReady, recommendations, focusMap, lastFocusRef]);

  return null;
}

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
  const selectedCategory = useMapCategoryFilterStore((state) => state.selectedCategory);
  const { recommendations } = useNearbyPlaceRecommendationsQuery(
    isRecommendationFlow && Boolean(confirmedPosition)
  );
  const { likedRecommendations } = useVisitedPlaceStickersQuery();
  const visibleRecommendations = useMemo(() => {
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
    return [...likedRecommendationById.values()].filter(({ place }) => {
      const category = isRecommendationFlow ? recommendationCategory : selectedCategory;
      return !category || place.category === category;
    });
  }, [
    recommendations,
    likedRecommendations,
    isRecommendationFlow,
    recommendationCategory,
    selectedCategory,
  ]);
  const lastFocusRef = useRef<RecommendationFocus>({ id: null });

  const handleMarkerSelect = (recommendation: ShopRecommendation) => {
    const visibleHeightPx = useHomeBottomSheetStore.getState().visibleHeightPx || undefined;
    lastFocusRef.current = { id: recommendation.id, height: visibleHeightPx };
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

  const canShowMarkers = !isRecommendationFlow || Boolean(confirmedPosition);

  return (
    <>
      <RecommendationMapFocus
        recommendations={recommendations}
        selectedId={isRecommendationFlow && canShowMarkers ? selectedRecommendationId : null}
        isMapReady={Boolean(map)}
        focusMap={focusMap}
        lastFocusRef={lastFocusRef}
      />
      {canShowMarkers &&
        visibleRecommendations.map((recommendation) => {
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
