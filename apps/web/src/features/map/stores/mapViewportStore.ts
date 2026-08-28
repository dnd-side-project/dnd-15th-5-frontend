import { create } from 'zustand';

import { MAP_DEFAULT_CENTER } from '@/features/map/constants';
import type { MapPosition } from '@/features/map/types';

type MapViewportStore = {
  center: MapPosition;
  setCenter: (center: MapPosition) => void;
};

/** 현재 지도 중심 좌표를 공유합니다. */
export const useMapViewportStore = create<MapViewportStore>((set) => ({
  center: MAP_DEFAULT_CENTER,
  setCenter: (center) =>
    set((state) =>
      state.center.lat === center.lat && state.center.lng === center.lng ? state : { center }
    ),
}));
