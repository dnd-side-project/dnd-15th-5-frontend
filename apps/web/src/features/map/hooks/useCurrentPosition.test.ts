import { act, renderHook, waitFor } from '@testing-library/react';
import { createElement, StrictMode } from 'react';

import { useCurrentPosition } from './useCurrentPosition';

import type { PropsWithChildren } from 'react';

const setGeolocation = (geolocation: unknown) => {
  Object.defineProperty(globalThis.navigator, 'geolocation', {
    value: geolocation,
    configurable: true,
  });
};

describe('useCurrentPosition', () => {
  it('위치 조회에 성공하면 좌표를 반환한다', async () => {
    setGeolocation({
      getCurrentPosition: (onSuccess: PositionCallback) =>
        onSuccess({
          coords: { latitude: 37.5665, longitude: 126.978, accuracy: 25 },
        } as GeolocationPosition),
    });

    const { result } = renderHook(() => useCurrentPosition());

    await waitFor(() => {
      expect(result.current.position).toEqual({ lat: 37.5665, lng: 126.978, accuracy: 25 });
    });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('권한이 거부되면 위치 없이 에러를 반환한다', async () => {
    const permissionDenied = { code: 1, message: '권한 거부' } as GeolocationPositionError;
    setGeolocation({
      getCurrentPosition: (_onSuccess: PositionCallback, onError: PositionErrorCallback) =>
        onError(permissionDenied),
    });

    const { result } = renderHook(() => useCurrentPosition());

    await waitFor(() => {
      expect(result.current.error).toBe(permissionDenied);
    });
    expect(result.current.position).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('브라우저가 위치 조회를 지원하지 않으면 로딩 상태로 두지 않는다', () => {
    setGeolocation(undefined);

    const { result } = renderHook(() => useCurrentPosition());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.position).toBeNull();
    expect(result.current.isGeolocationSupported).toBe(false);
  });

  it('요청에 실패한 뒤 위치를 다시 요청할 수 있다', async () => {
    const positionUnavailable = { code: 2, message: '위치 확인 실패' } as GeolocationPositionError;
    const getCurrentPosition = jest.fn(
      (_onSuccess: PositionCallback, onError: PositionErrorCallback) => onError(positionUnavailable)
    );
    setGeolocation({ getCurrentPosition });

    const { result } = renderHook(() => useCurrentPosition());

    await waitFor(() => {
      expect(result.current.error).toBe(positionUnavailable);
    });

    act(() => result.current.requestPosition());

    expect(getCurrentPosition).toHaveBeenCalledTimes(2);
  });

  it('StrictMode에서도 최초 위치를 한 번만 요청한다', () => {
    const getCurrentPosition = jest.fn();
    setGeolocation({ getCurrentPosition });

    function Wrapper({ children }: PropsWithChildren) {
      return createElement(StrictMode, null, children);
    }

    renderHook(() => useCurrentPosition(), { wrapper: Wrapper });

    expect(getCurrentPosition).toHaveBeenCalledTimes(1);
  });

  it('위치 응답을 무제한 기다리지 않도록 제한 시간을 설정한다', () => {
    const getCurrentPosition = jest.fn();
    setGeolocation({ getCurrentPosition });

    renderHook(() => useCurrentPosition());

    expect(getCurrentPosition).toHaveBeenCalledWith(expect.any(Function), expect.any(Function), {
      timeout: 10_000,
    });
  });
});
