import { AdvancedMarker, useMap } from '@vis.gl/react-google-maps';
import { useEffect, useRef } from 'react';

import { useNearbyPlaceRecommendationsQuery } from '@/features/map/apis/hooks/useNearbyPlaceRecommendationsQuery';
import { useFocusMapOnPosition } from '@/features/map/hooks/useFocusMapOnPosition';
import { useHomeBottomSheetStore } from '@/features/map/stores/homeBottomSheetStore';
import { useShopRecommendationStore } from '@/features/map/stores/shopRecommendationStore';
import type { HomeCategory, ShopRecommendation } from '@/features/map/types';
import {
  CafePinActiveIcon,
  CafePinIcon,
  HobbyPinActiveIcon,
  HobbyPinIcon,
  LikePinActiveIcon,
  LikePinIcon,
  RestaurantPinActiveIcon,
  RestaurantPinIcon,
} from '@/shared/assets/icons';
import { cn } from '@/shared/lib/cn';

import type { ComponentType, SVGProps } from 'react';

import './recommendationMapMarkers.css';

const ACTIVE_RECOMMENDATION_ZOOM = 15;

type RecommendationMarkerIcons = {
  active: ComponentType<SVGProps<SVGSVGElement>>;
  default: ComponentType<SVGProps<SVGSVGElement>>;
};

const LIKE_MARKER_ICONS: RecommendationMarkerIcons = {
  active: LikePinActiveIcon,
  default: LikePinIcon,
};

const CATEGORY_MARKER_ICONS: Partial<Record<HomeCategory, RecommendationMarkerIcons>> = {
  카페: { active: CafePinActiveIcon, default: CafePinIcon },
  음식점: { active: RestaurantPinActiveIcon, default: RestaurantPinIcon },
  '취미/놀거리': { active: HobbyPinActiveIcon, default: HobbyPinIcon },
};

const getRecommendationMarkerIcons = ({ isLiked, place }: ShopRecommendation) => {
  if (isLiked) {
    return LIKE_MARKER_ICONS;
  }

  return CATEGORY_MARKER_ICONS[place.category];
};

/** 추천 가게를 좋아요·카테고리 핀으로 표시하고 선택 시 해당 위치와 시트를 동기화합니다. */
export default function RecommendationMapMarkers() {
  const map = useMap();
  const focusMap = useFocusMapOnPosition(map);
  const activeSheet = useHomeBottomSheetStore((state) => state.activeSheet);
  const showLikedRecommendation = useHomeBottomSheetStore((state) => state.showLikedRecommendation);
  const showRecommendation = useHomeBottomSheetStore((state) => state.showRecommendation);
  const activeRecommendationId = useShopRecommendationStore(
    (state) => state.activeRecommendationId
  );
  const setActiveRecommendation = useShopRecommendationStore(
    (state) => state.setActiveRecommendation
  );
  const isRecommendationOpen = activeSheet.type === 'recommendation';
  const isLikedRecommendationOpen = activeSheet.type === 'likedRecommendation';
  const areMarkersVisible = isRecommendationOpen || isLikedRecommendationOpen;
  const selectedRecommendationId = isLikedRecommendationOpen
    ? activeSheet.recommendationId
    : isRecommendationOpen
      ? activeRecommendationId
      : null;
  const visibleHeightPx = useHomeBottomSheetStore((state) => state.visibleHeightPx) || undefined;
  const { recommendations } = useNearbyPlaceRecommendationsQuery();
  const recommendationsRef = useRef(recommendations);
  const lastFocusedRecommendationIdRef = useRef<string | null>(null);
  const lastFocusedVisibleHeightPxRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    recommendationsRef.current = recommendations;
  }, [recommendations]);

  useEffect(() => {
    if (!isRecommendationOpen || !activeRecommendationId) {
      lastFocusedRecommendationIdRef.current = null;
      return;
    }

    // NOTE: id와 시트 실측 높이가 둘 다 이전과 같으면(= handleMarkerSelect가 이미 처리했거나
    // 직전 실행과 동일) 다시 포커스하지 않는다. 높이만 바뀐 경우(콘텐츠 리플로우 등)는
    // 같은 추천이라도 다시 포커스해서 핀이 바뀐 시트 높이에 가려지지 않게 한다.
    if (
      lastFocusedRecommendationIdRef.current === activeRecommendationId &&
      lastFocusedVisibleHeightPxRef.current === visibleHeightPx
    ) {
      return;
    }

    const activeRecommendation = recommendationsRef.current.find(
      ({ id }) => id === activeRecommendationId
    );
    if (!activeRecommendation) {
      return;
    }

    lastFocusedRecommendationIdRef.current = activeRecommendationId;
    lastFocusedVisibleHeightPxRef.current = visibleHeightPx;
    focusMap(activeRecommendation.position, ACTIVE_RECOMMENDATION_ZOOM, visibleHeightPx);
  }, [activeRecommendationId, focusMap, isRecommendationOpen, visibleHeightPx]);

  const handleMarkerSelect = (recommendation: ShopRecommendation) => {
    lastFocusedRecommendationIdRef.current = recommendation.id;
    lastFocusedVisibleHeightPxRef.current = visibleHeightPx;
    focusMap(recommendation.position, ACTIVE_RECOMMENDATION_ZOOM, visibleHeightPx);
    setActiveRecommendation(recommendation.id);
    if (recommendation.isLiked) {
      showLikedRecommendation(recommendation.id);
      return;
    }

    showRecommendation();
  };

  if (!areMarkersVisible) {
    return null;
  }

  return (
    <>
      {recommendations.map((recommendation) => {
        const markerIcons = getRecommendationMarkerIcons(recommendation);
        if (!markerIcons) {
          return null;
        }

        const isActive = recommendation.id === selectedRecommendationId;
        const MarkerIcon = isActive ? markerIcons.active : markerIcons.default;

        return (
          <AdvancedMarker
            key={recommendation.id}
            position={recommendation.position}
            anchorLeft="-50%"
            anchorTop="-50%"
            zIndex={isActive ? 2 : 1}
            title={`${recommendation.place.name} 추천 마커${isActive ? ', 선택됨' : ''}`}
            onClick={() => handleMarkerSelect(recommendation)}
          >
            <MarkerIcon
              key={isActive ? 'active' : 'default'}
              aria-hidden="true"
              data-state={isActive ? 'active' : 'default'}
              // NOTE: 좋아요 기본 아이콘은 SVG 캔버스에 그림자용 여백이 더 많이 포함돼 있어
              // 카테고리 기본 아이콘과 같은 박스 크기로는 배지가 더 작게 보인다. size-14로
              // 키워서 실제 보이는 배지 크기를 카테고리 아이콘과 맞춘다.
              className={cn(
                'recommendation-marker-icon',
                isActive ? 'h-18 w-14' : recommendation.isLiked ? 'size-14' : 'size-9'
              )}
            />
          </AdvancedMarker>
        );
      })}
    </>
  );
}
