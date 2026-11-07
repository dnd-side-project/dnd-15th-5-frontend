import { geocodeMapLocation } from '@/features/map/apis/services/googleMapsGeocoding';
import { useLocationSelectionStore } from '@/features/map/stores/locationSelectionStore';
import type { MapPosition } from '@/features/map/types';

/** 지도 이동이 끝난 좌표를 저장하고 중앙 핀의 주소를 조회합니다. */
export const useMapSelectionAddress = () => {
  const startDraftSelection = useLocationSelectionStore((state) => state.startDraftSelection);
  const resolveDraftAddress = useLocationSelectionStore((state) => state.resolveDraftAddress);

  return (center: MapPosition) => {
    const previous = useLocationSelectionStore.getState().draftSelection?.position;
    if (previous?.lat === center.lat && previous.lng === center.lng) return;

    startDraftSelection(center);
    void geocodeMapLocation({ location: center })
      .then(({ results }) =>
        resolveDraftAddress(center, results[0]?.formatted_address ?? '선택한 위치')
      )
      .catch(() => resolveDraftAddress(center, '선택한 위치'));
  };
};
