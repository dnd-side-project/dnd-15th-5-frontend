import { AdvancedMarker, useMap } from '@vis.gl/react-google-maps';
import { useEffect } from 'react';

import { LikePinActiveIcon, LikePinIcon } from '@/shared/assets/icons';

import { MOCK_SHOP_RECOMMENDATIONS } from '../mockData';
import { useHomeBottomSheetStore } from '../stores/homeBottomSheetStore';
import { useShopRecommendationStore } from '../stores/shopRecommendationStore';
import { focusMapOnPosition } from '../utils/focusMapOnPosition';

import type { ShopRecommendation } from '../types';

const ACTIVE_RECOMMENDATION_ZOOM = 15;

/** 좋아요한 추천 가게를 지도 마커로 표시하고 선택 시 해당 위치와 시트를 동기화합니다. */
export default function RecommendationMapMarkers() {
  const map = useMap();
  const activeSheet = useHomeBottomSheetStore((state) => state.activeSheet);
  const showLikedRecommendation = useHomeBottomSheetStore((state) => state.showLikedRecommendation);
  const activeRecommendationId = useShopRecommendationStore(
    (state) => state.activeRecommendationId
  );
  const likedRecommendationIds = useShopRecommendationStore(
    (state) => state.likedRecommendationIds
  );
  const setActiveRecommendation = useShopRecommendationStore(
    (state) => state.setActiveRecommendation
  );
  const selectedLikedRecommendationId =
    activeSheet.type === 'likedRecommendation' ? activeSheet.recommendationId : null;
  const isRecommendationOpen = activeSheet.type === 'recommendation';
  const likedRecommendations = MOCK_SHOP_RECOMMENDATIONS.filter(({ id }) =>
    likedRecommendationIds.includes(id)
  );

  useEffect(() => {
    if (!isRecommendationOpen || !map) {
      return;
    }

    const activeRecommendation = MOCK_SHOP_RECOMMENDATIONS.find(
      ({ id }) => id === activeRecommendationId
    );
    if (activeRecommendation) {
      focusMapOnPosition(map, activeRecommendation.position, ACTIVE_RECOMMENDATION_ZOOM);
    }
  }, [activeRecommendationId, isRecommendationOpen, map]);

  const handleMarkerSelect = (recommendation: ShopRecommendation) => {
    if (map) {
      focusMapOnPosition(map, recommendation.position, ACTIVE_RECOMMENDATION_ZOOM);
    }
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
              aria-hidden="true"
              data-state={isActive ? 'active' : 'default'}
              className={isActive ? 'size-11' : 'size-10'}
            />
          </AdvancedMarker>
        );
      })}
    </>
  );
}
