import { AdvancedMarker, useMap } from '@vis.gl/react-google-maps';
import { useEffect } from 'react';

import { useNearbyPlaceRecommendationsQuery } from '@/features/map/apis/hooks/useNearbyPlaceRecommendationsQuery';
import { useFocusMapOnPosition } from '@/features/map/hooks/useFocusMapOnPosition';
import { useHomeBottomSheetStore } from '@/features/map/stores/homeBottomSheetStore';
import { useShopRecommendationStore } from '@/features/map/stores/shopRecommendationStore';
import type { ShopRecommendation } from '@/features/map/types';
import { LikePinActiveIcon, LikePinIcon } from '@/shared/assets/icons';

import './recommendationMapMarkers.css';

const ACTIVE_RECOMMENDATION_ZOOM = 15;

/** 좋아요한 추천 가게를 지도 마커로 표시하고 선택 시 해당 위치와 시트를 동기화합니다. */
export default function RecommendationMapMarkers() {
  const map = useMap();
  const focusMap = useFocusMapOnPosition(map);
  const activeSheet = useHomeBottomSheetStore((state) => state.activeSheet);
  const showLikedRecommendation = useHomeBottomSheetStore((state) => state.showLikedRecommendation);
  const activeRecommendationId = useShopRecommendationStore(
    (state) => state.activeRecommendationId
  );
  const setActiveRecommendation = useShopRecommendationStore(
    (state) => state.setActiveRecommendation
  );
  const selectedLikedRecommendationId =
    activeSheet.type === 'likedRecommendation' ? activeSheet.recommendationId : null;
  const isRecommendationOpen = activeSheet.type === 'recommendation';
  const { recommendations } = useNearbyPlaceRecommendationsQuery();
  const likedRecommendations = recommendations.filter(({ isLiked }) => isLiked);

  useEffect(() => {
    if (!isRecommendationOpen) {
      return;
    }

    const activeRecommendation = recommendations.find(({ id }) => id === activeRecommendationId);
    if (!activeRecommendation) {
      return;
    }

    focusMap(activeRecommendation.position, ACTIVE_RECOMMENDATION_ZOOM);
  }, [activeRecommendationId, focusMap, isRecommendationOpen, recommendations]);

  const handleMarkerSelect = (recommendation: ShopRecommendation) => {
    focusMap(recommendation.position, ACTIVE_RECOMMENDATION_ZOOM);
    setActiveRecommendation(recommendation.id);
    showLikedRecommendation(recommendation.id);
  };

  return (
    <>
      {likedRecommendations.map((recommendation) => {
        const isActive = recommendation.id === selectedLikedRecommendationId;
        const MarkerIcon = isActive ? LikePinActiveIcon : LikePinIcon;

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
              className={`recommendation-marker-icon ${isActive ? 'size-11' : 'size-10'}`}
            />
          </AdvancedMarker>
        );
      })}
    </>
  );
}
