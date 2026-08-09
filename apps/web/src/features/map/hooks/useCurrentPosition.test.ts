import { renderHook, waitFor } from '@testing-library/react';

import { useCurrentPosition } from './useCurrentPosition';

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
        onSuccess({ coords: { latitude: 37.5665, longitude: 126.978 } } as GeolocationPosition),
    });

    const { result } = renderHook(() => useCurrentPosition());

    await waitFor(() => {
      expect(result.current.position).toEqual({ lat: 37.5665, lng: 126.978 });
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
  });
});
