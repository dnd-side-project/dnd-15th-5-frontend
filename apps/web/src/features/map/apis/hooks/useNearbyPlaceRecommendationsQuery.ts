import { useMemo } from 'react';

import { useGetNearbyPlaces } from '@/features/map/apis/queries';
import { useLocationSelectionStore } from '@/features/map/stores/locationSelectionStore';
import { useMapViewportStore } from '@/features/map/stores/mapViewportStore';
import { toShopRecommendations } from '@/features/map/utils/placeAdapters';

const RECOMMENDATION_RADIUS_METERS = 1_500;

/** 확정 위치가 있으면 그 좌표를, 없으면 현재 지도 중심을 기준으로 추천 가게를 조회합니다. */
export const useNearbyPlaceRecommendationsQuery = (enabled?: boolean) => {
  const confirmedPosition = useLocationSelectionStore((state) => state.confirmedPosition);
  const mapCenter = useMapViewportStore((state) => state.center);
  const center = confirmedPosition ?? mapCenter;
  const params = {
    lat: center.lat,
    lng: center.lng,
    radiusMeters: RECOMMENDATION_RADIUS_METERS,
  };
  const query = useGetNearbyPlaces(
    params,
    enabled === undefined ? undefined : { query: { enabled } }
  );
  const response = query.data?.data;
  const recommendations = useMemo(() => toShopRecommendations(response), [response]);

  return { ...query, recommendations };
};
