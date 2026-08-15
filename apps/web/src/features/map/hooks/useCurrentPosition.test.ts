import { act, renderHook, waitFor } from '@testing-library/react';
import { createElement, StrictMode } from 'react';

import { isNativeApp, NativeBridgeRequestError, requestToNative } from '@/shared/lib/bridge';

import { useCurrentPosition } from './useCurrentPosition';

import type { PropsWithChildren } from 'react';

jest.mock('@/shared/lib/bridge', () => ({
  isNativeApp: jest.fn(),
  NativeBridgeRequestError: class extends Error {
    readonly reason: string;

    constructor(reason: string, message: string) {
      super(message);
      this.name = 'NativeBridgeRequestError';
      this.reason = reason;
    }
  },
  requestToNative: jest.fn(),
}));

const mockIsNativeApp = jest.mocked(isNativeApp);
const mockRequestToNative = jest.mocked(requestToNative);

const setGeolocation = (geolocation: unknown) => {
  Object.defineProperty(globalThis.navigator, 'geolocation', {
    value: geolocation,
    configurable: true,
  });
};

const createGeolocationError = (
  code: GeolocationPositionError['code'],
  message: string
): GeolocationPositionError => ({
  code,
  message,
  PERMISSION_DENIED: 1,
  POSITION_UNAVAILABLE: 2,
  TIMEOUT: 3,
});

describe('useCurrentPosition', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsNativeApp.mockReturnValue(false);
  });

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
    const permissionDenied = createGeolocationError(1, '권한 거부');
    setGeolocation({
      getCurrentPosition: (_onSuccess: PositionCallback, onError: PositionErrorCallback) =>
        onError(permissionDenied),
    });

    const { result } = renderHook(() => useCurrentPosition());

    await waitFor(() => {
      expect(result.current.error).toEqual({
        reason: 'permissionDenied',
        message: '브라우저 설정에서 위치 권한을 허용해주세요.',
      });
    });
    expect(result.current.position).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('브라우저가 위치 조회를 지원하지 않으면 로딩 상태로 두지 않는다', () => {
    setGeolocation(undefined);

    const { result } = renderHook(() => useCurrentPosition());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.position).toBeNull();
    expect(result.current.isCurrentPositionSupported).toBe(false);
  });

  it('앱 WebView에서는 브라우저 대신 네이티브 현재 위치를 조회한다', async () => {
    const getCurrentPosition = jest.fn();
    setGeolocation({ getCurrentPosition });
    mockIsNativeApp.mockReturnValue(true);
    mockRequestToNative.mockResolvedValue({
      status: 'success',
      position: { lat: 37.5665, lng: 126.978, accuracy: 25 },
    });

    const { result } = renderHook(() => useCurrentPosition());

    await waitFor(() => {
      expect(result.current.position).toEqual({ lat: 37.5665, lng: 126.978, accuracy: 25 });
    });
    expect(mockRequestToNative).toHaveBeenCalledWith('getCurrentPosition', {});
    expect(getCurrentPosition).not.toHaveBeenCalled();
  });

  it('진행 중인 위치 요청이 있으면 같은 요청을 공유한다', async () => {
    let resolvePosition: PositionCallback | undefined;
    const getCurrentPosition = jest.fn((onSuccess: PositionCallback) => {
      resolvePosition = onSuccess;
    });
    setGeolocation({ getCurrentPosition });

    const { result } = renderHook(() => useCurrentPosition());
    let firstRepeatedRequest: Promise<void> | undefined;
    let secondRepeatedRequest: Promise<void> | undefined;

    act(() => {
      firstRepeatedRequest = result.current.requestPosition();
      secondRepeatedRequest = result.current.requestPosition();
    });

    expect(firstRepeatedRequest).toBe(secondRepeatedRequest);
    expect(getCurrentPosition).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolvePosition?.({
        coords: { latitude: 37.5665, longitude: 126.978, accuracy: 25 },
      } as GeolocationPosition);
      await firstRepeatedRequest;
    });
  });

  it('네이티브 위치 권한이 거부되면 권한 거부 오류를 반환한다', async () => {
    setGeolocation(undefined);
    mockIsNativeApp.mockReturnValue(true);
    mockRequestToNative.mockResolvedValue({ status: 'permissionDenied' });

    const { result } = renderHook(() => useCurrentPosition());

    await waitFor(() => {
      expect(result.current.error).toEqual({
        reason: 'permissionDenied',
        message: '기기 설정에서 위치 권한을 허용해주세요.',
      });
    });
    expect(result.current.isCurrentPositionSupported).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('기기 위치 서비스가 꺼져 있으면 설정 안내용 오류를 반환한다', async () => {
    setGeolocation(undefined);
    mockIsNativeApp.mockReturnValue(true);
    mockRequestToNative.mockResolvedValue({ status: 'servicesDisabled' });

    const { result } = renderHook(() => useCurrentPosition());

    await waitFor(() => {
      expect(result.current.error).toEqual({
        reason: 'servicesDisabled',
        message: '기기 설정에서 위치 서비스를 켜주세요.',
      });
    });
  });

  it('네이티브 브릿지 요청이 만료되면 timeout 오류로 정규화한다', async () => {
    setGeolocation(undefined);
    mockIsNativeApp.mockReturnValue(true);
    mockRequestToNative.mockRejectedValue(
      new NativeBridgeRequestError('timeout', '네이티브 응답 만료')
    );

    const { result } = renderHook(() => useCurrentPosition());

    await waitFor(() => {
      expect(result.current.error).toEqual({
        reason: 'timeout',
        message: '위치 조회 시간이 초과되었습니다. 다시 시도해주세요.',
      });
    });
  });

  it('요청에 실패한 뒤 위치를 다시 요청할 수 있다', async () => {
    const positionUnavailable = createGeolocationError(2, '위치 확인 실패');
    const getCurrentPosition = jest.fn(
      (_onSuccess: PositionCallback, onError: PositionErrorCallback) => onError(positionUnavailable)
    );
    setGeolocation({ getCurrentPosition });

    const { result } = renderHook(() => useCurrentPosition());

    await waitFor(() => {
      expect(result.current.error).toEqual({
        reason: 'positionUnavailable',
        message: '위치를 불러오지 못했습니다. 다시 시도해주세요.',
      });
    });

    await act(async () => {
      await result.current.requestPosition();
    });

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
