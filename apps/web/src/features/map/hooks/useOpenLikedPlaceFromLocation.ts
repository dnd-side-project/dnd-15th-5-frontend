import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useHomeBottomSheetStore } from '../stores/homeBottomSheetStore';
import { useMapCategoryFilterStore } from '../stores/mapCategoryFilterStore';
import { useMapFocusStore } from '../stores/mapFocusStore';

import type { LikedPlaceMapNavigation } from '../types';

type HomeLocationState = Record<string, unknown> & {
  openLikedPlace?: LikedPlaceMapNavigation;
};

/**
 * 좋아요 장소로 지도와 시트를 열고, 카테고리는 지도 API 응답으로 설정하도록 필터를 초기화합니다.
 * 처리한 일회성 이동 정보만 경로 state에서 제거합니다.
 */
export function useOpenLikedPlaceFromLocation() {
  const location = useLocation();
  const navigate = useNavigate();
  const homeLocationState = location.state as HomeLocationState | null;
  const likedPlaceNavigation = homeLocationState?.openLikedPlace;
  const setSelectedCategory = useMapCategoryFilterStore((state) => state.setSelectedCategory);
  const setSelectedPlaceFocus = useMapFocusStore((state) => state.setSelectedPlaceFocus);
  const showLikedRecommendation = useHomeBottomSheetStore((state) => state.showLikedRecommendation);

  useEffect(() => {
    if (!likedPlaceNavigation) return;

    setSelectedCategory(null);
    setSelectedPlaceFocus(likedPlaceNavigation.position);
    showLikedRecommendation(likedPlaceNavigation.placeId);

    const { openLikedPlace: _openLikedPlace, ...remainingState } = homeLocationState;
    navigate(`${location.pathname}${location.search}${location.hash}`, {
      replace: true,
      state: Object.keys(remainingState).length > 0 ? remainingState : null,
    });
  }, [
    homeLocationState,
    likedPlaceNavigation,
    location.hash,
    location.pathname,
    location.search,
    navigate,
    setSelectedCategory,
    setSelectedPlaceFocus,
    showLikedRecommendation,
  ]);
}
