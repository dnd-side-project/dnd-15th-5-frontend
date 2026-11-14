import { useQueryClient } from '@tanstack/react-query';

import { useSaveTown } from '@/features/map/apis/mutations';
import { getGetRecentTownsQueryKey } from '@/features/map/apis/queryKeys';
import { RECOMMENDATION_MAP_ZOOM } from '@/features/map/constants';
import { useHomeBottomSheetStore } from '@/features/map/stores/homeBottomSheetStore';
import { useLocationSelectionStore } from '@/features/map/stores/locationSelectionStore';
import { useMapFocusStore } from '@/features/map/stores/mapFocusStore';
import { useShopRecommendationStore } from '@/features/map/stores/shopRecommendationStore';
import type { MapPosition } from '@/features/map/types';

/** 두 위치 선택 방식에서 같은 좌표로 추천을 열고 지도를 이동합니다. */
export const useRecommendationLocationActions = () => {
  const setConfirmedPosition = useLocationSelectionStore((state) => state.setConfirmedPosition);
  const setFocusPosition = useMapFocusStore((state) => state.setFocusPosition);
  const showRecommendation = useHomeBottomSheetStore((state) => state.showRecommendation);
  const setActiveRecommendation = useShopRecommendationStore(
    (state) => state.setActiveRecommendation
  );

  const queryClient = useQueryClient();
  const saveTown = useSaveTown({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: getGetRecentTownsQueryKey() });
      },
    },
  });

  const confirmLocation = (
    {
      position,
      address,
      administrativeDongCode,
    }: {
      position: MapPosition;
      address: string;
      administrativeDongCode?: string;
    },
    onConfirm: () => void
  ) => {
    saveTown.mutate(
      {
        data: {
          administrativeDongName: address,
          administrativeDongCode,
          latitude: position.lat,
          longitude: position.lng,
        },
      },
      {
        onSuccess: () => {
          setActiveRecommendation(null);
          setConfirmedPosition(position);
          setFocusPosition(position, RECOMMENDATION_MAP_ZOOM);
          showRecommendation();
          onConfirm();
        },
      }
    );
  };

  return {
    confirmLocation,
    isSaving: saveTown.isPending,
    hasSaveError: saveTown.isError,
  };
};
