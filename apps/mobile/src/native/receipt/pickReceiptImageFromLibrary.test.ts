import { launchImageLibraryAsync } from 'expo-image-picker';

import { pickReceiptImageFromLibrary } from './pickReceiptImageFromLibrary';

jest.mock('expo-image-picker', () => ({ launchImageLibraryAsync: jest.fn() }));

const mockLaunchLibrary = jest.mocked(launchImageLibraryAsync);

describe('pickReceiptImageFromLibrary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('권한을 별도로 요청하지 않고 선택기를 바로 연다', async () => {
    mockLaunchLibrary.mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file://picked.heic', width: 3000, height: 4000 }],
    } as never);

    await pickReceiptImageFromLibrary();

    expect(mockLaunchLibrary).toHaveBeenCalledWith({ mediaTypes: ['images'] });
  });

  it('사진을 선택하면 선택한 이미지 정보를 반환한다', async () => {
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
    mockLaunchLibrary.mockResolvedValue({ canceled: true, assets: null } as never);

    await expect(pickReceiptImageFromLibrary()).resolves.toEqual({ status: 'cancelled' });
  });
});
