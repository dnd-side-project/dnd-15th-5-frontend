import { AdvancedMarker } from '@vis.gl/react-google-maps';

import type { MapMarker } from '../types';

type MapMarkersProps = {
  markers: MapMarker[];
};

export default function MapMarkers({ markers }: MapMarkersProps) {
  return (
    <>
      {markers.map((marker) => (
        <AdvancedMarker key={marker.id} position={{ lat: marker.lat, lng: marker.lng }} />
      ))}
    </>
  );
}
