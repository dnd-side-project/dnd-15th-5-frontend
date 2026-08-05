import { APIProvider, Map } from '@vis.gl/react-google-maps';
import { useMemo } from 'react';

import { GOOGLE_MAPS_API_KEY, GOOGLE_MAPS_MAP_ID } from '@/shared/lib/env';

import { MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM, MARKER_COUNT } from '../constants';
import { generateMockMarkers } from '../utils/generateMockMarkers';

import CurrentLocationMarker from './CurrentLocationMarker';
import MapMarkers from './MapMarkers';

export default function GoogleMapView() {
  const markers = useMemo(() => generateMockMarkers(MARKER_COUNT), []);

  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
      <Map
        className="h-full w-full"
        mapId={GOOGLE_MAPS_MAP_ID}
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
