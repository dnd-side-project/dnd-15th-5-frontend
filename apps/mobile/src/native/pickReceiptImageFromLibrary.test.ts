import { launchImageLibraryAsync, requestMediaLibraryPermissionsAsync } from 'expo-image-picker';

import { pickReceiptImageFromLibrary } from './pickReceiptImageFromLibrary';

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));

const mockRequestPermissions = jest.mocked(requestMediaLibraryPermissionsAsync);
const mockLaunchLibrary = jest.mocked(launchImageLibraryAsync);

describe('pickReceiptImageFromLibrary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('사진을 선택하면 선택한 이미지 정보를 반환한다', async () => {
    mockRequestPermissions.mockResolvedValue({ granted: true } as never);
    mockLaunchLibrary.mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file://picked.heic', width: 3000, height: 4000 }],
    } as never);

    await expect(pickReceiptImageFromLibrary()).resolves.toEqual({
      status: 'picked',
      uri: 'file://picked.heic',
      width: 3000,
      height: 4000,
    });
  });

  it('선택을 취소하면 실패가 아닌 취소 상태를 반환한다', async () => {
    mockRequestPermissions.mockResolvedValue({ granted: true } as never);
    mockLaunchLibrary.mockResolvedValue({ canceled: true, assets: null } as never);

    await expect(pickReceiptImageFromLibrary()).resolves.toEqual({ status: 'cancelled' });
  });

  it('사진 보관함 권한이 없으면 선택기를 열지 않고 실패한다', async () => {
    mockRequestPermissions.mockResolvedValue({ granted: false } as never);

    await expect(pickReceiptImageFromLibrary()).rejects.toThrow(
      '사진 보관함 접근 권한이 필요합니다'
    );
    expect(mockLaunchLibrary).not.toHaveBeenCalled();
  });
});
