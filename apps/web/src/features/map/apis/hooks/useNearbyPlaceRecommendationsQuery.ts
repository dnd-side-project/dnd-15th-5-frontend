import { useMemo } from 'react';

import { useGetNearbyPlaces } from '@/features/map/apis/queries';
import { toShopRecommendations } from '@/features/map/utils/placeAdapters';

const RECOMMENDATION_RADIUS_METERS = 1_000;
const TALK_HERE_RECOMMENDATION_CENTER = {
  lat: 37.4896386,
  lng: 126.9759403,
} as const;

/** 지도 위치와 무관하게 이수역 토크히어를 중심으로 추천 가게를 조회합니다. */
export const useNearbyPlaceRecommendationsQuery = () => {
  const query = useGetNearbyPlaces({
    lat: TALK_HERE_RECOMMENDATION_CENTER.lat,
    lng: TALK_HERE_RECOMMENDATION_CENTER.lng,
    radiusMeters: RECOMMENDATION_RADIUS_METERS,
  });
  const response = query.data?.data;
  const recommendations = useMemo(
    () =>
      toShopRecommendations({
        sameCategoryPlaces: response?.sameCategoryPlaces,
        myTownPlaces: response?.myTownPlaces,
      }),
    [response?.myTownPlaces, response?.sameCategoryPlaces]
  );

  return { ...query, recommendations };
};
