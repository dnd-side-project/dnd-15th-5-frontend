import { useEffect, useState } from 'react';

type Position = {
  lat: number;
  lng: number;
};

type UseCurrentPositionResult = {
  position: Position | null;
  isLoading: boolean;
  error: GeolocationPositionError | null;
};

/**
 * 사용자의 현재 위치를 한 번 조회하는 훅.
 *
 * - 마운트 시점에 조회를 시작하며, 이때 브라우저의 위치 권한 팝업이 자동으로 뜬다.
 * - 권한이 거부되거나 조회에 실패하면 `position`은 `null`로 유지되고 `error`에 사유가 담긴다.
 * - 위치를 계속 추적하지 않으므로, 이동에 따라 값이 갱신되지 않는다.
 */
export const useCurrentPosition = (): UseCurrentPositionResult => {
  const [position, setPosition] = useState<Position | null>(null);
  const [error, setError] = useState<GeolocationPositionError | null>(null);
  const [isLoading, setIsLoading] = useState(() => Boolean(navigator.geolocation));

  useEffect(() => {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (result) => {
        setPosition({ lat: result.coords.latitude, lng: result.coords.longitude });
        setIsLoading(false);
      },
      (geolocationError) => {
        setError(geolocationError);
        setIsLoading(false);
      }
    );
  }, []);

  return { position, isLoading, error };
};
