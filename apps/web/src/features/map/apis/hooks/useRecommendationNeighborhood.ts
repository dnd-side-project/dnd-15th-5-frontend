import { useEffect } from 'react';

import { useRecentNeighborhoods } from '@/features/map/apis/hooks/useRecentNeighborhoods';
import { RECOMMENDATION_MAP_ZOOM } from '@/features/map/constants';
import { useLocationSelectionStore } from '@/features/map/stores/locationSelectionStore';
import { useMapFocusStore } from '@/features/map/stores/mapFocusStore';

/** 추천 진입 시 서버의 최신 동네를 복원하며 사용자가 고른 위치는 유지합니다. */
export const useRecommendationNeighborhood = ({ enabled = true }: { enabled?: boolean } = {}) => {
  const recent = useRecentNeighborhoods({ enabled });
  const confirmedPosition = useLocationSelectionStore((state) => state.confirmedPosition);
  const confirmedAddress = useLocationSelectionStore((state) => state.confirmedAddress);
  const draftSelection = useLocationSelectionStore((state) => state.draftSelection);
  const confirmedNeighborhoodId = useLocationSelectionStore(
    (state) => state.confirmedNeighborhoodId
  );

  useEffect(() => {
    if (!enabled || !recent.isSuccess || recent.isFetching || !recent.latestNeighborhood) return;
    const state = useLocationSelectionStore.getState();
    // 응답 대기 중 확정하거나 지도에서 선택하기 시작한 위치를 덮어쓰지 않습니다.
    if (state.confirmedPosition || state.draftSelection) return;
    state.setConfirmedNeighborhood(recent.latestNeighborhood);
    useMapFocusStore
      .getState()
      .setFocusPosition(recent.latestNeighborhood.position, RECOMMENDATION_MAP_ZOOM);
  }, [enabled, recent.isSuccess, recent.isFetching, recent.latestNeighborhood, draftSelection]);

  const isPendingRestore =
    recent.isSuccess && recent.latestNeighborhood !== null && !draftSelection;
  const isError = enabled && !confirmedPosition && recent.hasLoadError;

  return {
    confirmedPosition,
    confirmedAddress,
    confirmedNeighborhoodId,
    isLoading:
      enabled && !confirmedPosition && (recent.isLoading || recent.isFetching || isPendingRestore),
    hasError: isError,
    isError,
    hasNeighborhood: confirmedPosition !== null,
    error: recent.error,
    isEmpty:
      enabled &&
      recent.isSuccess &&
      !recent.isFetching &&
      !confirmedPosition &&
      recent.recentNeighborhoods.length === 0,
    retry: recent.retry,
    refetch: recent.retry,
  };
};
