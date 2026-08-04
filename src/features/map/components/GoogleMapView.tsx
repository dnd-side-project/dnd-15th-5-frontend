import { APIProvider, Map } from '@vis.gl/react-google-maps';
import { useMemo } from 'react';

import { GOOGLE_MAPS_API_KEY } from '@/shared/lib/env';

import { MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM, MARKER_COUNT } from '../constants';
import { generateMockMarkers } from '../utils/generateMockMarkers';

import CurrentLocationMarker from './CurrentLocationMarker';
import MapMarkers from './MapMarkers';

export default function GoogleMapView() {
  const markers = useMemo(() => generateMockMarkers(MARKER_COUNT), []);

  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
      {/* mapId는 지도 스타일 커스터마이징(Cloud-based styling)에 쓰이는 값. Google Cloud Console에서 발급받은 실제 ID로 교체 필요 */}
      <Map
        className="h-full w-full"
        mapId="google-map-view"
        defaultCenter={MAP_DEFAULT_CENTER}
        defaultZoom={MAP_DEFAULT_ZOOM}
        gestureHandling="greedy"
      >
        <MapMarkers markers={markers} />
        <CurrentLocationMarker />
      </Map>
    </APIProvider>
  );
}
