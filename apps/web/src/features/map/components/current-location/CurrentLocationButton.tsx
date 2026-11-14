import { useMap } from '@vis.gl/react-google-maps';

import {
  selectIsHomeSheetFullyExpanded,
  useHomeBottomSheetStore,
} from '@/features/map/stores/homeBottomSheetStore';
import type { MapPosition } from '@/features/map/types';
import { CurrentLocationIcon } from '@/shared/assets/icons';
import { BOTTOM_TAB_BAR_HEIGHT_CSS } from '@/shared/layout/bottom-tab-bar';

// 핸들과 버튼 사이 여백.
const HANDLE_GAP = '0.75rem';

type CurrentLocationButtonProps = {
  position: MapPosition | null;
  isLoading: boolean;
  errorMessage: string | null;
  onRequestPosition: () => void;
};

/**
 * 지도 우측 하단에 뜨는 현재 위치 이동 버튼입니다.
 *
 * `fixed` 포지션으로 바텀시트 핸들 바로 위에 맞춰 띄웁니다. 홈 시트가 최대 확장되면
 * 상단 UI와 겹치지 않도록 숨기며, 시트를 내리거나 모달형 시트로 전환하면 다시 표시합니다.
 * 열린 시트에서는 스토어에 보고된 실제 높이를 사용하고, 숨김 상태에서는 하단 탭바 높이를
 * 반영한 기본 오프셋을 사용합니다.
 */
export default function CurrentLocationButton({
  position,
  isLoading,
  errorMessage,
  onRequestPosition,
}: CurrentLocationButtonProps) {
  const map = useMap();
  const isDisabled = !map || isLoading;
  const bottomSheetHeightPx = useHomeBottomSheetStore((state) => state.visibleHeightPx);
  const isHomeSheetFullyExpanded = useHomeBottomSheetStore(selectIsHomeSheetFullyExpanded);
  // NOTE: 스냅 포인트 비율이 아닌 실제 렌더링 높이를 사용해야 콘텐츠 맞춤 시트에서도
  // 핸들과 버튼 사이 간격이 동일하게 유지된다.
  const bottomOffset = `max(calc(${bottomSheetHeightPx}px + ${HANDLE_GAP}), ${BOTTOM_TAB_BAR_HEIGHT_CSS})`;

  const handleCurrentLocationClick = () => {
    if (!map) {
      return;
    }

    if (position) {
      map.panTo(position);
      return;
    }

    onRequestPosition();
  };

  if (isHomeSheetFullyExpanded) return null;

  return (
    <div
      className="mobile-frame fixed right-0 left-0 z-map-control flex justify-end pr-4"
      style={{ bottom: bottomOffset }}
    >
      <div className="flex flex-col items-end gap-2">
        {errorMessage && (
          <p
            role="status"
            className="max-w-52 rounded-08 bg-neutral-700/85 px-3 py-2 text-caption-01-medium text-neutral-00"
          >
            {errorMessage}
          </p>
        )}
        <button
          type="button"
          aria-label="현재 위치로 이동"
          title="현재 위치로 이동"
          disabled={isDisabled}
          aria-busy={isLoading}
          onClick={handleCurrentLocationClick}
          className="flex size-8 items-center justify-center rounded-full bg-neutral-00 text-primary-500 shadow-current-location-button transition-[background-color,box-shadow,transform,opacity] hover:bg-neutral-50 active:scale-95 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-50"
        >
          <CurrentLocationIcon aria-hidden="true" className="size-4" />
        </button>
      </div>
    </div>
  );
}
