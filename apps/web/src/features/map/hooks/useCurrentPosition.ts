import { useCallback, useEffect, useRef, useState } from 'react';

import type { CurrentPosition } from '../types';

const CURRENT_POSITION_TIMEOUT_MS = 10_000;

type UseCurrentPositionResult = {
  position: CurrentPosition | null;
  isLoading: boolean;
  error: GeolocationPositionError | null;
  isGeolocationSupported: boolean;
  requestPosition: () => void;
};

/**
 * 사용자의 현재 위치를 조회하는 훅.
 *
 * - 마운트 시점에 조회를 시작한다. 권한을 아직 묻지 않은 상태라면 이때 브라우저의 위치 권한 팝업이 표시될 수 있다.
 *   (이미 허용·거부했거나 보안 컨텍스트·Permissions Policy에 막히면 팝업 없이 바로 결과가 온다.)
 * - 권한이 거부되거나 조회에 실패하면 `position`은 `null`로 유지되고 `error`에 사유가 담긴다.
 * - 최초 한 번 자동으로 조회하고, `requestPosition`을 호출하면 다시 조회한다.
 * - 위치를 계속 추적하지 않으므로, 이동에 따라 값이 자동 갱신되지는 않는다.
 */
export const useCurrentPosition = (): UseCurrentPositionResult => {
  const isGeolocationSupported = Boolean(navigator.geolocation);
  const [position, setPosition] = useState<CurrentPosition | null>(null);
  const [error, setError] = useState<GeolocationPositionError | null>(null);
  const [isLoading, setIsLoading] = useState(isGeolocationSupported);
  const hasRequestedPosition = useRef(false);

  const requestPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (result) => {
        setPosition({
          lat: result.coords.latitude,
          lng: result.coords.longitude,
          accuracy: result.coords.accuracy,
        });
        setIsLoading(false);
      },
      (geolocationError) => {
        setError(geolocationError);
        setIsLoading(false);
      },
      { timeout: CURRENT_POSITION_TIMEOUT_MS }
    );
  }, []);

  useEffect(() => {
    if (hasRequestedPosition.current) {
      return;
    }

    hasRequestedPosition.current = true;
    requestPosition();
  }, [requestPosition]);

  return { position, isLoading, error, isGeolocationSupported, requestPosition };
};
