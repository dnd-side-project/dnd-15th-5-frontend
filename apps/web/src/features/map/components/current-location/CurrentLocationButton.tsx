import { ControlPosition, MapControl, useMap } from '@vis.gl/react-google-maps';

import { isNativeApp } from '@/shared/lib/bridge';

import type { MapPosition } from '../../types';

const GEOLOCATION_PERMISSION_DENIED_CODE = 1;

type CurrentLocationButtonProps = {
  position: MapPosition | null;
  isLoading: boolean;
  error: GeolocationPositionError | null;
  isGeolocationSupported: boolean;
  showError: boolean;
  onRequestPosition: () => void;
};

const getLocationStatusMessage = (
  isGeolocationSupported: boolean,
  error: GeolocationPositionError | null,
  isNativeEnvironment: boolean
) => {
  if (!isGeolocationSupported) {
    return '현재 위치를 사용할 수 없는 환경입니다.';
  }

  if (error?.code === GEOLOCATION_PERMISSION_DENIED_CODE) {
    return isNativeEnvironment
      ? '기기 설정에서 위치 권한을 허용해주세요.'
      : '브라우저 설정에서 위치 권한을 허용해주세요.';
  }

  if (error) {
    return '위치를 불러오지 못했습니다. 다시 시도해주세요.';
  }

  return null;
};

export default function CurrentLocationButton({
  position,
  isLoading,
  error,
  isGeolocationSupported,
  showError,
  onRequestPosition,
}: CurrentLocationButtonProps) {
  const map = useMap();
  const isDisabled = !map || isLoading;
  const errorMessage = showError
    ? getLocationStatusMessage(isGeolocationSupported, error, isNativeApp())
    : null;

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
    <MapControl position={ControlPosition.RIGHT_BOTTOM}>
      <div className="m-3 flex flex-col items-end gap-2">
        {errorMessage && (
          <p
            role="status"
            className="max-w-52 rounded-lg bg-gray-900/85 px-3 py-2 text-xs text-white"
          >
            {errorMessage}
          </p>
        )}
        {/* TODO: 지도 화면 디자인 확정 후 버튼 스타일 교체 */}
        <button
          type="button"
          aria-label="현재 위치로 이동"
          title="현재 위치로 이동"
          disabled={isDisabled}
          aria-busy={isLoading}
          onClick={handleCurrentLocationClick}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-blue-500 shadow-[0_2px_8px_rgba(15,23,42,0.18)] transition-[background-color,box-shadow,transform] hover:bg-blue-50 hover:shadow-md active:scale-95 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-300 disabled:shadow-sm"
        >
          {/* TODO: 디자인 확정 후 shared/assets의 SVG 아이콘으로 교체 */}
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="4.5" />
            <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
            <path d="M12 3v2M12 19v2M3 12h2M19 12h2" />
          </svg>
        </button>
      </div>
    </MapControl>
  );
}
