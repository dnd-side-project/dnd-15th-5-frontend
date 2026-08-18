export type MapPosition = {
  lat: number;
  lng: number;
};

export type CurrentPositionError =
  | { reason: 'permissionDenied'; message: string }
  | { reason: 'positionUnavailable'; message: string }
  | { reason: 'timeout'; message: string }
  | { reason: 'servicesDisabled'; message: string };
