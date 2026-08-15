import { waitFor } from '@testing-library/react-native';
import * as Location from 'expo-location';

import { getCurrentPosition } from './getCurrentPosition';

const mockGetForegroundPermissionsAsync = jest.fn();
const mockRequestForegroundPermissionsAsync = jest.fn();
const mockGetCurrentPositionAsync = jest.fn();
const mockHasServicesEnabledAsync = jest.fn();

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
});
