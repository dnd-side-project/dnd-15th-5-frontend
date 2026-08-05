import { MAP_DEFAULT_CENTER, MARKER_SPREAD_DEGREE } from '../constants';

import type { MapMarker } from '../types';

export const generateMockMarkers = (count: number): MapMarker[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `mock-marker-${index}`,
    lat: MAP_DEFAULT_CENTER.lat + (Math.random() - 0.5) * MARKER_SPREAD_DEGREE,
    lng: MAP_DEFAULT_CENTER.lng + (Math.random() - 0.5) * MARKER_SPREAD_DEGREE,
  }));
