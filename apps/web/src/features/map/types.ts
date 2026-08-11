export type MapPosition = {
  lat: number;
  lng: number;
};

export type CurrentPosition = MapPosition & {
  accuracy: number;
};
