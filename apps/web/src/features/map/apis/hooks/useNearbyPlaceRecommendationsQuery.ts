import { useMemo } from 'react';

import { useGetNearbyPlaces } from '@/features/map/apis/queries';
import { useLocationSelectionStore } from '@/features/map/stores/locationSelectionStore';
import { toShopRecommendations } from '@/features/map/utils/placeAdapters';

const RECOMMENDATION_RADIUS_METERS = 1_000;
const TALK_HERE_RECOMMENDATION_CENTER = {
  lat: 37.4896386,
  lng: 126.9759403,
} as const;

/** 확정한 위치를 중심으로 추천 가게를 조회하고, 선택 전에는 PoC 기본 좌표를 사용합니다. */
export const useNearbyPlaceRecommendationsQuery = () => {
  const confirmedPosition = useLocationSelectionStore((state) => state.confirmedPosition);
  const center = confirmedPosition ?? TALK_HERE_RECOMMENDATION_CENTER;
  const query = useGetNearbyPlaces({
    lat: center.lat,
    lng: center.lng,
    radiusMeters: RECOMMENDATION_RADIUS_METERS,
  });
  const response = query.data?.data;
  const recommendations = useMemo(() => {
    const allPlaces = response?.allPlaces ?? [];
    const categoryPlaces = response?.categoryPlaces?.flatMap(({ places }) => places ?? []) ?? [];

    return toShopRecommendations(allPlaces.length > 0 ? allPlaces : categoryPlaces);
  }, [response?.allPlaces, response?.categoryPlaces]);

  return { ...query, recommendations };
};
