import { Map } from '@vis.gl/react-google-maps';
import { useState } from 'react';

import CurrentLocationButton from '@/features/map/components/current-location/CurrentLocationButton';
import CurrentLocationCameraController from '@/features/map/components/current-location/CurrentLocationCameraController';
import CurrentLocationMarker from '@/features/map/components/current-location/CurrentLocationMarker';
import RecommendationMapMarkers from '@/features/map/components/RecommendationMapMarkers';
import MapStickers from '@/features/map/components/stickers/MapStickers';
import { MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM } from '@/features/map/constants';
import { useCurrentPosition } from '@/features/map/hooks/useCurrentPosition';
import { useHomeBottomSheetStore } from '@/features/map/stores/homeBottomSheetStore';
import { useMapViewportStore } from '@/features/map/stores/mapViewportStore';
import { GOOGLE_MAPS_MAP_ID } from '@/shared/lib/env';

import MapFocusController from './MapFocusController';

/**
 * 현재 위치를 표시하는 지도 화면.
 *
 * 지도 스크립트는 `GoogleMapsProvider`가 로드하므로, 이 컴포넌트는 해당 Provider 하위에서만 동작한다.
 * 높이가 정해진 부모가 필요하다(`h-full`을 사용하므로 부모에 명시적 높이가 없으면 지도가 보이지 않는다).
 */
export default function GoogleMapView() {
  const { position, isLoading, error, requestPosition } = useCurrentPosition();
  const [showLocationError, setShowLocationError] = useState(false);
  const activeSheetType = useHomeBottomSheetStore((state) => state.activeSheet.type);
  const showHome = useHomeBottomSheetStore((state) => state.showHome);
  const setMapCenter = useMapViewportStore((state) => state.setCenter);

  const handleMapClick = () => {
    setShowLocationError(false);
    if (activeSheetType === 'selectedPlace' || activeSheetType === 'likedRecommendation') {
      showHome();
    }
  };

  const handleCurrentPositionRequest = () => {
    setShowLocationError(true);
    void requestPosition();
  };

  const locationErrorMessage = error?.message ?? null;

  return (
    <Map
      className="h-full w-full"
      mapId={GOOGLE_MAPS_MAP_ID}
      defaultCenter={MAP_DEFAULT_CENTER}
      defaultZoom={MAP_DEFAULT_ZOOM}
      gestureHandling="greedy"
      disableDefaultUI
      clickableIcons={false}
      onClick={handleMapClick}
      onIdle={(event) => {
        const center = event.map.getCenter();
        if (center) setMapCenter({ lat: center.lat(), lng: center.lng() });
      }}
    >
      <CurrentLocationCameraController
        isAutomaticPanEnabled={activeSheetType === 'home'}
        position={position}
      />
      <CurrentLocationMarker position={position} />
      <MapFocusController />
      <MapStickers />
      <RecommendationMapMarkers />
      <CurrentLocationButton
        position={position}
        isLoading={isLoading}
        errorMessage={showLocationError ? locationErrorMessage : null}
        onRequestPosition={handleCurrentPositionRequest}
      />
    </Map>
  );
}
