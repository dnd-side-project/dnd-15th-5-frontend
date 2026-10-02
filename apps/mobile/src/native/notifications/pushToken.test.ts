import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';

import { getPushToken } from './pushToken';

let mockIsDevice = true;

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    easConfig: { projectId: 'expo-project-id' },
    expoConfig: { extra: {} },
  },
}));
jest.mock('expo-device', () => ({
  get isDevice() {
    return mockIsDevice;
  },
}));
jest.mock('expo-notifications', () => ({
  AndroidImportance: { HIGH: 4 },
  getExpoPushTokenAsync: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
}));

const mockGetExpoPushToken = jest.mocked(Notifications.getExpoPushTokenAsync);
const mockGetPermissions = jest.mocked(Notifications.getPermissionsAsync);
const mockRequestPermissions = jest.mocked(Notifications.requestPermissionsAsync);

describe('getPushToken', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsDevice = true;
    mockGetPermissions.mockResolvedValue({ granted: true } as never);
    mockRequestPermissions.mockResolvedValue({ granted: true } as never);
    mockGetExpoPushToken.mockResolvedValue({
      type: 'expo',
      data: 'ExponentPushToken[test-token]',
    });
  });

  it('권한이 있으면 Expo 프로젝트 ID로 Push Token을 발급한다', async () => {
    await expect(getPushToken()).resolves.toEqual({
      status: 'success',
      pushToken: 'ExponentPushToken[test-token]',
    });

    expect(mockRequestPermissions).not.toHaveBeenCalled();
    expect(mockGetExpoPushToken).toHaveBeenCalledWith({ projectId: 'expo-project-id' });
  });

  it('권한을 다시 요청할 수 없으면 요청 팝업을 반복하지 않는다', async () => {
    mockGetPermissions.mockResolvedValue({ granted: false, canAskAgain: false } as never);

    await expect(getPushToken()).resolves.toEqual({ status: 'permissionDenied' });
    expect(mockRequestPermissions).not.toHaveBeenCalled();
  });

  it('시뮬레이터에서는 푸시 토큰을 요청하지 않는다', async () => {
    mockIsDevice = false;

    await expect(getPushToken()).resolves.toEqual({ status: 'unsupportedDevice' });
    expect(mockGetExpoPushToken).not.toHaveBeenCalled();
  });

  it.each([
    ['ERR_NOTIFICATIONS_NETWORK_ERROR', 'network'],
    ['ERR_NOTIFICATIONS_SERVER_ERROR', 'server'],
  ] as const)('%s 오류를 %s 유형으로 구분한다', async (code, reason) => {
    mockGetExpoPushToken.mockRejectedValue(Object.assign(new Error('temporary failed'), { code }));

    await expect(getPushToken()).resolves.toEqual({
      status: 'error',
      reason,
      message: 'temporary failed',
    });
  });

  it('권한 요청이 거절되면 토큰을 발급하지 않는다', async () => {
    mockGetPermissions.mockResolvedValue({ granted: false, canAskAgain: true } as never);
    mockRequestPermissions.mockResolvedValue({ granted: false } as never);

    await expect(getPushToken()).resolves.toEqual({ status: 'permissionDenied' });
    expect(mockGetExpoPushToken).not.toHaveBeenCalled();
  });

  it('Expo 프로젝트 ID가 없으면 설정 오류를 반환한다', async () => {
    const originalEasConfig = Constants.easConfig;
    Object.defineProperty(Constants, 'easConfig', { configurable: true, value: null });

    await expect(getPushToken()).resolves.toEqual({
      status: 'error',
      reason: 'configuration',
      message: expect.stringContaining('Expo 프로젝트 ID'),
    });

    Object.defineProperty(Constants, 'easConfig', {
      configurable: true,
      value: originalEasConfig,
    });
  });
});
