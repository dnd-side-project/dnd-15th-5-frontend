import { Map } from '@vis.gl/react-google-maps';
import { useState } from 'react';

import { GOOGLE_MAPS_MAP_ID } from '@/shared/lib/env';

import { useCurrentPosition } from '../../hooks/useCurrentPosition';
import CurrentLocationButton from '../current-location/CurrentLocationButton';
import CurrentLocationCameraController from '../current-location/CurrentLocationCameraController';
import CurrentLocationMarker from '../current-location/CurrentLocationMarker';

const MAP_DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 };
const MAP_DEFAULT_ZOOM = 13;

/**
 * 현재 위치를 표시하는 지도 화면.
 *
 * 지도 스크립트는 `GoogleMapsProvider`가 로드하므로, 이 컴포넌트는 해당 Provider 하위에서만 동작한다.
 * 높이가 정해진 부모가 필요하다(`h-full`을 사용하므로 부모에 명시적 높이가 없으면 지도가 보이지 않는다).
 */
export default function GoogleMapView() {
  const { position, isLoading, error, isGeolocationSupported, requestPosition } =
    useCurrentPosition();
  const [showLocationError, setShowLocationError] = useState(false);

  const handleMapClick = () => {
    setShowLocationError(false);
  };

  const handleCurrentPositionRequest = () => {
    setShowLocationError(true);
    requestPosition();
  };

  return (
    <Map
      className="h-full w-full"
      mapId={GOOGLE_MAPS_MAP_ID}
      defaultCenter={MAP_DEFAULT_CENTER}
      defaultZoom={MAP_DEFAULT_ZOOM}
      gestureHandling="greedy"
      onClick={handleMapClick}
    >
      <CurrentLocationCameraController position={position} />
      <CurrentLocationMarker position={position} />
      <CurrentLocationButton
        position={position}
        isLoading={isLoading}
        error={error}
        isGeolocationSupported={isGeolocationSupported}
        showError={showLocationError}
        onRequestPosition={handleCurrentPositionRequest}
      />
    </Map>
  );
}
