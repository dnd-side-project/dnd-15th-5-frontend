import { useMemo } from 'react';

import { useGetNearbyPlaces } from '@/features/map/apis/queries';
import { useMapViewportStore } from '@/features/map/stores/mapViewportStore';
import { toShopRecommendations } from '@/features/map/utils/placeAdapters';

const RECOMMENDATION_RADIUS_METERS = 1_000;

/** 현재 지도 중심을 기준으로 추천 가게를 조회해 캐러셀·마커 공통 모델로 제공합니다. */
export const useNearbyPlaceRecommendationsQuery = () => {
  const center = useMapViewportStore((state) => state.center);
  const query = useGetNearbyPlaces({
    lat: center.lat,
    lng: center.lng,
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
