import * as SecureStore from 'expo-secure-store';

import { clearRefreshToken, getRefreshToken, setRefreshToken } from './authTokenStorage';

jest.mock('expo-secure-store', () => ({
  deleteItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
}));

const mockDeleteItemAsync = jest.mocked(SecureStore.deleteItemAsync);
const mockGetItemAsync = jest.mocked(SecureStore.getItemAsync);
const mockSetItemAsync = jest.mocked(SecureStore.setItemAsync);

describe('authTokenStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('OS 보안 저장소에서 Refresh Token을 조회한다', async () => {
    mockGetItemAsync.mockResolvedValue('refresh-token');

    await expect(getRefreshToken()).resolves.toBe('refresh-token');
    expect(mockGetItemAsync).toHaveBeenCalledWith('chapchap.auth.refreshToken');
  });

  it('OS 보안 저장소에 Refresh Token을 저장한다', async () => {
    mockSetItemAsync.mockResolvedValue();

    await setRefreshToken('refresh-token');

    expect(mockSetItemAsync).toHaveBeenCalledWith('chapchap.auth.refreshToken', 'refresh-token');
  });

  it('OS 보안 저장소에서 Refresh Token을 제거한다', async () => {
    mockDeleteItemAsync.mockResolvedValue();

    await clearRefreshToken();

    expect(mockDeleteItemAsync).toHaveBeenCalledWith('chapchap.auth.refreshToken');
  });
});
