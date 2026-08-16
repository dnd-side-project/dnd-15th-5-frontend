import { useCallback, useEffect, useRef, useState } from 'react';

import { isNativeApp, NativeBridgeRequestError, requestToNative } from '@/shared/lib/bridge';

import type { CurrentPositionError } from '../types';
import type { CurrentPosition } from '@chapchap/shared/location';

const CURRENT_POSITION_TIMEOUT_MS = 10_000;
const CURRENT_POSITION_ERROR_MESSAGE = {
  browserPermissionDenied: '브라우저 설정에서 위치 권한을 허용해주세요.',
  nativePermissionDenied: '기기 설정에서 위치 권한을 허용해주세요.',
  positionUnavailable: '위치를 불러오지 못했습니다. 다시 시도해주세요.',
  servicesDisabled: '기기 설정에서 위치 서비스를 켜주세요.',
  timeout: '위치 조회 시간이 초과되었습니다. 다시 시도해주세요.',
  unsupported: '현재 위치를 사용할 수 없는 환경입니다.',
} as const;

type UseCurrentPositionResult = {
  position: CurrentPosition | null;
  isLoading: boolean;
  error: CurrentPositionError | null;
  isCurrentPositionSupported: boolean;
  requestPosition: () => Promise<void>;
};

class CurrentPositionRequestError extends Error {
  readonly reason: CurrentPositionError['reason'];

  constructor(reason: CurrentPositionError['reason'], message: string) {
    super(message);
    this.name = 'CurrentPositionRequestError';
    this.reason = reason;
  }
}

const requestNativePosition = async (): Promise<CurrentPosition> => {
  const result = await requestToNative('getCurrentPosition', {});

  if (result.status === 'permissionDenied') {
    throw new CurrentPositionRequestError(
      'permissionDenied',
      CURRENT_POSITION_ERROR_MESSAGE.nativePermissionDenied
    );
  }

  if (result.status === 'servicesDisabled') {
    throw new CurrentPositionRequestError(
      'servicesDisabled',
      CURRENT_POSITION_ERROR_MESSAGE.servicesDisabled
    );
  }

  return result.position;
};

const requestBrowserPosition = (): Promise<CurrentPosition> =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(
        new CurrentPositionRequestError(
          'positionUnavailable',
          CURRENT_POSITION_ERROR_MESSAGE.unsupported
        )
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (result) => {
        resolve({
          lat: result.coords.latitude,
          lng: result.coords.longitude,
          accuracy: result.coords.accuracy,
        });
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          reject(
            new CurrentPositionRequestError(
              'permissionDenied',
              CURRENT_POSITION_ERROR_MESSAGE.browserPermissionDenied
            )
          );
          return;
        }

        if (error.code === error.TIMEOUT) {
          reject(
            new CurrentPositionRequestError('timeout', CURRENT_POSITION_ERROR_MESSAGE.timeout)
          );
          return;
        }

        reject(
          new CurrentPositionRequestError(
            'positionUnavailable',
            CURRENT_POSITION_ERROR_MESSAGE.positionUnavailable
          )
        );
      },
      { timeout: CURRENT_POSITION_TIMEOUT_MS }
    );
  });

const normalizePositionError = (error: unknown): CurrentPositionError => {
  if (error instanceof NativeBridgeRequestError && error.reason === 'timeout') {
    return {
      reason: 'timeout',
      message: CURRENT_POSITION_ERROR_MESSAGE.timeout,
    };
  }

  if (error instanceof CurrentPositionRequestError) {
    return { reason: error.reason, message: error.message };
  }

  return {
    reason: 'positionUnavailable',
    message: CURRENT_POSITION_ERROR_MESSAGE.positionUnavailable,
  };
};

/**
 * 사용자의 현재 위치를 조회하는 훅.
 *
 * - 앱 WebView에서는 브릿지를 통해 `expo-location`으로 조회하고, 일반 웹에서는 Geolocation API를 사용한다.
 * - 마운트 시점에 한 번 조회하며, 일반 웹에서 권한을 아직 묻지 않았다면 브라우저 권한 팝업이 표시될 수 있다.
 * - 권한이 거부되거나 조회에 실패하면 `position`은 `null`로 유지되고 `error`에 사유가 담긴다.
 * - 최초 한 번 자동으로 조회하고, `requestPosition`을 호출하면 다시 조회한다.
 * - 위치를 계속 추적하지 않으므로, 이동에 따라 값이 자동 갱신되지는 않는다.
 */
export const useCurrentPosition = (): UseCurrentPositionResult => {
  const isNativeEnvironment = isNativeApp();
  const isCurrentPositionSupported = isNativeEnvironment || Boolean(navigator.geolocation);
  const [position, setPosition] = useState<CurrentPosition | null>(null);
  const [error, setError] = useState<CurrentPositionError | null>(
    isCurrentPositionSupported
      ? null
      : {
          reason: 'positionUnavailable',
          message: CURRENT_POSITION_ERROR_MESSAGE.unsupported,
        }
  );
  const [isLoading, setIsLoading] = useState(isCurrentPositionSupported);
  const hasRequestedPosition = useRef(false);
  const pendingRequest = useRef<Promise<void> | null>(null);

  const requestPosition = useCallback((): Promise<void> => {
    if (!isCurrentPositionSupported) {
      return Promise.resolve();
    }

    if (pendingRequest.current) {
      return pendingRequest.current;
    }

    setIsLoading(true);
    setError(null);

    const nextRequest = (async () => {
      try {
        const nextPosition = isNativeEnvironment
          ? await requestNativePosition()
          : await requestBrowserPosition();

        setPosition(nextPosition);
      } catch (positionError) {
        setError(normalizePositionError(positionError));
      } finally {
        setIsLoading(false);
        pendingRequest.current = null;
      }
    })();

    pendingRequest.current = nextRequest;

    return nextRequest;
  }, [isCurrentPositionSupported, isNativeEnvironment]);

  useEffect(() => {
    if (hasRequestedPosition.current) {
      return;
    }

    hasRequestedPosition.current = true;
    void requestPosition();
  }, [requestPosition]);

  return { position, isLoading, error, isCurrentPositionSupported, requestPosition };
};
