import { waitFor } from '@testing-library/react-native';
import * as Location from 'expo-location';

import { getCurrentPosition } from './getCurrentPosition';

const mockGetForegroundPermissionsAsync = jest.fn();
const mockRequestForegroundPermissionsAsync = jest.fn();
const mockGetCurrentPositionAsync = jest.fn();
const mockHasServicesEnabledAsync = jest.fn();
const POSITION_REQUEST_SHARE_TIMEOUT_MS = 30_000;

jest.mock('expo-location', () => ({
  Accuracy: { Balanced: 3 },
  PermissionStatus: {
    DENIED: 'denied',
    GRANTED: 'granted',
    UNDETERMINED: 'undetermined',
  },
  getCurrentPositionAsync: (options: unknown) => mockGetCurrentPositionAsync(options),
  getForegroundPermissionsAsync: () => mockGetForegroundPermissionsAsync(),
  hasServicesEnabledAsync: () => mockHasServicesEnabledAsync(),
  requestForegroundPermissionsAsync: () => mockRequestForegroundPermissionsAsync(),
}));

describe('getCurrentPosition', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHasServicesEnabledAsync.mockResolvedValue(true);
    mockGetForegroundPermissionsAsync.mockResolvedValue({
      granted: true,
      status: Location.PermissionStatus.GRANTED,
    });
    mockRequestForegroundPermissionsAsync.mockResolvedValue({
      granted: true,
      status: Location.PermissionStatus.GRANTED,
    });
    mockGetCurrentPositionAsync.mockResolvedValue({
      coords: { latitude: 37.5665, longitude: 126.978, accuracy: 25 },
    });
  });

  it('권한이 있으면 현재 좌표와 정확도를 반환한다', async () => {
    await expect(getCurrentPosition()).resolves.toEqual({
      status: 'success',
      position: { lat: 37.5665, lng: 126.978, accuracy: 25 },
    });
    expect(mockGetCurrentPositionAsync).toHaveBeenCalledWith({
      accuracy: Location.Accuracy.Balanced,
    });
  });

  it('권한을 아직 선택하지 않았다면 요청한 뒤 위치를 조회한다', async () => {
    mockGetForegroundPermissionsAsync.mockResolvedValue({
      granted: false,
      status: Location.PermissionStatus.UNDETERMINED,
    });

    await getCurrentPosition();

    expect(mockRequestForegroundPermissionsAsync).toHaveBeenCalledTimes(1);
    expect(mockGetCurrentPositionAsync).toHaveBeenCalledTimes(1);
  });

  it('위치 권한이 거부되면 위치를 조회하지 않고 권한 거부 상태를 반환한다', async () => {
    mockGetForegroundPermissionsAsync.mockResolvedValue({
      granted: false,
      status: Location.PermissionStatus.DENIED,
    });

    await expect(getCurrentPosition()).resolves.toEqual({ status: 'permissionDenied' });
    expect(mockGetCurrentPositionAsync).not.toHaveBeenCalled();
  });

  it('기기 위치 서비스가 꺼져 있으면 권한과 위치를 조회하지 않는다', async () => {
    mockHasServicesEnabledAsync.mockResolvedValue(false);

    await expect(getCurrentPosition()).resolves.toEqual({ status: 'servicesDisabled' });
    expect(mockGetForegroundPermissionsAsync).not.toHaveBeenCalled();
    expect(mockGetCurrentPositionAsync).not.toHaveBeenCalled();
  });

  it('위치 조회 중 다시 호출하면 진행 중인 요청을 공유한다', async () => {
    let resolvePosition: ((value: unknown) => void) | undefined;
    mockGetCurrentPositionAsync.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePosition = resolve;
        })
    );

    const firstRequest = getCurrentPosition();
    const secondRequest = getCurrentPosition();

    expect(firstRequest).toBe(secondRequest);
    await waitFor(() => {
      expect(mockGetCurrentPositionAsync).toHaveBeenCalledTimes(1);
    });

    resolvePosition?.({
      coords: { latitude: 37.5665, longitude: 126.978, accuracy: 25 },
    });

    await expect(firstRequest).resolves.toEqual({
      status: 'success',
      position: { lat: 37.5665, lng: 126.978, accuracy: 25 },
    });
  });

  it('공유 시간이 만료되면 새 위치 요청을 시작하고 이전 요청 완료가 새 pending을 해제하지 않는다', async () => {
    jest.useFakeTimers();
    let resolveFirstPosition: ((value: unknown) => void) | undefined;
    let resolveSecondPosition: ((value: unknown) => void) | undefined;

    mockGetCurrentPositionAsync
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveFirstPosition = resolve;
          })
      )
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveSecondPosition = resolve;
          })
      );

    const firstRequest = getCurrentPosition();

    await waitFor(() => {
      expect(mockGetCurrentPositionAsync).toHaveBeenCalledTimes(1);
    });

    jest.advanceTimersByTime(POSITION_REQUEST_SHARE_TIMEOUT_MS);

    const secondRequest = getCurrentPosition();

    expect(secondRequest).not.toBe(firstRequest);
    await waitFor(() => {
      expect(mockGetCurrentPositionAsync).toHaveBeenCalledTimes(2);
    });

    resolveFirstPosition?.({
      coords: { latitude: 37.5665, longitude: 126.978, accuracy: 25 },
    });
    await firstRequest;

    // 첫 요청의 늦은 finally가 두 번째 pending 상태를 지우지 않아야 한다.
    expect(getCurrentPosition()).toBe(secondRequest);

    resolveSecondPosition?.({
      coords: { latitude: 37.567, longitude: 126.979, accuracy: 20 },
    });
    await secondRequest;
    jest.useRealTimers();
  });
});
