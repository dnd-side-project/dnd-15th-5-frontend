import { refreshApp, refreshWeb } from '@/features/auth/apis/clients';
import {
  clearNativeRefreshToken,
  getNativeRefreshToken,
  setNativeRefreshToken,
} from '@/shared/apis/nativeAuthToken';
import { isNativeApp } from '@/shared/lib/bridge';
import { useAuthStore } from '@/shared/stores/authStore';

import { restoreNativeAuthentication } from './configureAxiosAuth';

jest.mock('@/features/auth/apis/clients', () => ({
  refreshApp: jest.fn(),
  refreshWeb: jest.fn(),
}));
jest.mock('@/shared/apis/nativeAuthToken', () => ({
  clearNativeRefreshToken: jest.fn(),
  getNativeRefreshToken: jest.fn(),
  setNativeRefreshToken: jest.fn(),
}));
jest.mock('@/shared/lib/bridge', () => ({ isNativeApp: jest.fn() }));

const mockRefreshApp = jest.mocked(refreshApp);
const mockRefreshWeb = jest.mocked(refreshWeb);
const mockClearNativeRefreshToken = jest.mocked(clearNativeRefreshToken);
const mockGetNativeRefreshToken = jest.mocked(getNativeRefreshToken);
const mockSetNativeRefreshToken = jest.mocked(setNativeRefreshToken);
const mockIsNativeApp = jest.mocked(isNativeApp);

describe('restoreNativeAuthentication', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.history.replaceState(null, '', '/record');
    mockIsNativeApp.mockReturnValue(true);
    mockGetNativeRefreshToken.mockResolvedValue('refresh-token');
    mockSetNativeRefreshToken.mockResolvedValue();
    mockClearNativeRefreshToken.mockResolvedValue();
    useAuthStore.setState({
      accessToken: 'expired-access-token',
      signupToken: null,
      isInitialized: false,
      isAuthenticated: true,
    });
  });

  it('앱 인증 복원에 실패하면 SecureStore와 웹 인증 상태를 정리한다', async () => {
    mockRefreshApp.mockRejectedValue(new Error('Unauthorized'));

    await expect(restoreNativeAuthentication()).rejects.toThrow('Unauthorized');

    expect(mockClearNativeRefreshToken).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState()).toMatchObject({
      accessToken: null,
      signupToken: null,
      isAuthenticated: false,
    });
    expect(window.location.pathname).toBe('/record');
    expect(mockRefreshWeb).not.toHaveBeenCalled();
  });
});
