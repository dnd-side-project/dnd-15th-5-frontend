import { useCallback, useMemo } from 'react';

import { useGetVisitedPlaceMarkers } from '@/features/map/apis/queries';
import { toMapStickers } from '@/features/map/utils/placeAdapters';

/** 방문 장소 조회 결과를 지도 스티커 모델과 월간 장소 수로 제공합니다. */
export const useVisitedPlaceStickersQuery = () => {
  const query = useGetVisitedPlaceMarkers();
  const places = query.data?.data?.places;
  const stickers = useMemo(() => toMapStickers(places), [places]);
  const refetch = query.refetch;
  const refetchStickers = useCallback(async () => {
    const result = await refetch();
    return toMapStickers(result.data?.data?.places);
  }, [refetch]);

  return {
    ...query,
    stickers,
    month: query.data?.data?.month,
    monthlyPlaceCount:
      query.data?.data === undefined ? undefined : (query.data.data.monthlyPlaceCount ?? 0),
    refetchStickers,
  };
};
