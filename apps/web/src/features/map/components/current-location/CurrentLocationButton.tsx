import { ControlPosition, MapControl, useMap } from '@vis.gl/react-google-maps';

import type { MapPosition } from '../../types';

type CurrentLocationButtonProps = {
  position: MapPosition | null;
  isLoading: boolean;
  errorMessage: string | null;
  onRequestPosition: () => void;
};

export default function CurrentLocationButton({
  position,
  isLoading,
  errorMessage,
  onRequestPosition,
}: CurrentLocationButtonProps) {
  const map = useMap();
  const isDisabled = !map || isLoading;

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
