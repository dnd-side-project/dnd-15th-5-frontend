import { useMap } from '@vis.gl/react-google-maps';

import { CurrentLocationIcon } from '@/shared/assets/icons';
import {
  getHomeBottomSheetSnapPoint,
  useHomeBottomSheetStore,
} from '@/shared/stores/homeBottomSheetStore';
import { BOTTOM_SHEET_HEIGHT_RATIO } from '@/shared/ui/bottom-sheet';

import type { MapPosition } from '../../types';

// NOTE: 바텀시트가 숨김 상태일 때는 BottomTabBar 높이(86px, h-15.5 + 상하 패딩 pt-3/pb-3)만
// 가리지 않으면 된다. BottomTabBar 높이가 바뀌면 이 값도 같이 조정해야 한다.
const HIDDEN_BOTTOM_OFFSET = '6.5rem';
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
 */
export default function CurrentLocationButton({
  position,
  isLoading,
  errorMessage,
  onRequestPosition,
}: CurrentLocationButtonProps) {
  const map = useMap();
  const isDisabled = !map || isLoading;
  const stepIndex = useHomeBottomSheetStore((state) => state.stepIndex);
  const bottomSheetSnapPoint = getHomeBottomSheetSnapPoint(stepIndex);
  // NOTE: 바텀시트가 열려 있으면(medium/full) 항상 핸들 바로 위에 떠 있도록, 바텀시트와
  // 같은 비율로 위치를 맞춘다.
  const bottomOffset =
    bottomSheetSnapPoint === 'hidden'
      ? HIDDEN_BOTTOM_OFFSET
      : `calc(${BOTTOM_SHEET_HEIGHT_RATIO[bottomSheetSnapPoint] * 100}dvh + ${HANDLE_GAP})`;

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
      className="fixed right-0 left-0 z-10 mx-auto flex max-w-120 justify-end pr-4 transition-[bottom] duration-300 ease-out"
      style={{ bottom: bottomOffset }}
    >
      <div className="flex flex-col items-end gap-2">
        {errorMessage && (
          <p
            role="status"
            className="max-w-52 rounded-lg bg-gray-900/85 px-3 py-2 text-xs text-white"
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
