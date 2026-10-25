import { AdvancedMarker } from '@vis.gl/react-google-maps';
import { useEffect } from 'react';

import { useLocationSelectionStore } from '@/features/map/stores/locationSelectionStore';
import { BlueLocationPinIcon } from '@/shared/assets/icons';

/** 위치 선택 화면에서 사용자가 지도를 누른 좌표에 핀을 표시합니다. */
export default function LocationSelectionMarker() {
  const selectedPosition = useLocationSelectionStore((state) => state.selectedPosition);
  const clearSelectedPosition = useLocationSelectionStore((state) => state.clearSelectedPosition);

  useEffect(() => clearSelectedPosition, [clearSelectedPosition]);

  if (!selectedPosition) {
    return null;
  }

  return (
    <AdvancedMarker
      position={selectedPosition}
      anchorLeft="-50%"
      anchorTop="-100%"
      title="선택한 위치"
    >
      <BlueLocationPinIcon aria-hidden="true" className="size-10 drop-shadow-md" />
    </AdvancedMarker>
  );
}
