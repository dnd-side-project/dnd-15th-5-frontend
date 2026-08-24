import { useMap } from '@vis.gl/react-google-maps';

import { CurrentLocationIcon } from '@/shared/assets/icons';

import { useHomeBottomSheetStore } from '../../stores/homeBottomSheetStore';

import type { MapPosition } from '../../types';

// TODO: BottomTabBar의 실제 높이를 CSS 변수나 공통 레이아웃 상태로 공유해
// 숨김 오프셋의 수동 동기화를 제거한다.
const HIDDEN_BOTTOM_OFFSET = 'calc(6.5rem + env(safe-area-inset-bottom))';
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
 * Google Maps의 `MapControl` 대신 직접 `fixed` 포지션을 써서 바텀시트 핸들 바로 위에 맞춰
 * 띄웁니다. `MapControl`을 그대로 쓰면 바텀시트가 `full` 단계일 때처럼 버튼을 화면 위쪽까지
 * 밀어 올려야 하는 경우, Google Maps가 내부적으로 관리하는 컨트롤 pane의 쌓임 순서 때문에
 * 지도 자체 레이어에 버튼이 가려 클릭이 안 되는 문제가 있었습니다.
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
  // NOTE: 스냅 포인트 비율이 아닌 실제 렌더링 높이를 사용해야 콘텐츠 맞춤 시트에서도
  // 핸들과 버튼 사이 간격이 동일하게 유지된다.
  const bottomOffset = `max(calc(${bottomSheetHeightPx}px + ${HANDLE_GAP}), ${HIDDEN_BOTTOM_OFFSET})`;

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
