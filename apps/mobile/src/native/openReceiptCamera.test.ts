import { Camera } from 'expo-camera';
import { router } from 'expo-router';

import { openReceiptCamera } from './openReceiptCamera';

jest.mock('expo-camera', () => ({ Camera: { requestCameraPermissionsAsync: jest.fn() } }));
jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));

const mockRequestPermissions = jest.mocked(Camera.requestCameraPermissionsAsync);
const mockPush = jest.mocked(router.push);

describe('openReceiptCamera', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('카메라 권한이 있으면 촬영 화면으로 이동한다', async () => {
    mockRequestPermissions.mockResolvedValue({ granted: true } as never);

    await expect(openReceiptCamera()).resolves.toEqual({ opened: true });
    expect(mockPush).toHaveBeenCalledWith('/camera');
  });

  it('카메라 권한이 없으면 화면으로 이동하지 않고 실패한다', async () => {
    mockRequestPermissions.mockResolvedValue({ granted: false } as never);

    await expect(openReceiptCamera()).rejects.toThrow('카메라 권한이 필요합니다');
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('권한 확인 중에 같은 요청이 또 오면 화면을 두 번 열지 않는다', async () => {
    mockRequestPermissions.mockResolvedValue({ granted: true } as never);

    const [first, second] = await Promise.all([openReceiptCamera(), openReceiptCamera()]);

    expect(first).toEqual({ opened: true });
    expect(second).toEqual({ opened: true });
    expect(mockRequestPermissions).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledTimes(1);
  });
});
