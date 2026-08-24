import { clearNativeRefreshToken, setNativeRefreshToken } from '@/shared/apis/nativeAuthToken';
import { isNativeApp } from '@/shared/lib/bridge';
import { useAuthStore } from '@/shared/stores/authStore';

import { clearAuthenticationTokens, persistAuthenticationTokens } from './authTokenLifecycle';

jest.mock('@/shared/apis/nativeAuthToken', () => ({
  clearNativeRefreshToken: jest.fn(),
  setNativeRefreshToken: jest.fn(),
}));
jest.mock('@/shared/lib/bridge', () => ({ isNativeApp: jest.fn() }));

const mockClearNativeRefreshToken = jest.mocked(clearNativeRefreshToken);
const mockSetNativeRefreshToken = jest.mocked(setNativeRefreshToken);
const mockIsNativeApp = jest.mocked(isNativeApp);

describe('authTokenLifecycle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsNativeApp.mockReturnValue(false);
    mockClearNativeRefreshToken.mockResolvedValue();
    mockSetNativeRefreshToken.mockResolvedValue();
    useAuthStore.setState({
      accessToken: null,
      signupToken: null,
      isInitialized: true,
      isAuthenticated: false,
    });
  });

  it('웹에서는 Access Token만 메모리에 저장한다', async () => {
    await persistAuthenticationTokens({ accessToken: 'access-token' });

    expect(useAuthStore.getState().accessToken).toBe('access-token');
    expect(mockSetNativeRefreshToken).not.toHaveBeenCalled();
  });

  it('앱에서는 Refresh Token을 먼저 저장한 뒤 Access Token을 적용한다', async () => {
    mockIsNativeApp.mockReturnValue(true);

    await persistAuthenticationTokens({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });

    expect(mockSetNativeRefreshToken).toHaveBeenCalledWith('refresh-token');
    expect(useAuthStore.getState().accessToken).toBe('access-token');
  });

  it('앱 응답에 Refresh Token이 없으면 Access Token을 적용하지 않는다', async () => {
    mockIsNativeApp.mockReturnValue(true);

    await expect(persistAuthenticationTokens({ accessToken: 'access-token' })).rejects.toThrow(
      '로그인 결과를 확인할 수 없습니다. 다시 로그인해 주세요.'
    );
    expect(useAuthStore.getState().accessToken).toBeNull();
  });

  it('네이티브 저장소 정리에 실패해도 메모리 인증 상태는 정리한다', async () => {
    mockIsNativeApp.mockReturnValue(true);
    mockClearNativeRefreshToken.mockRejectedValue(new Error('SecureStore failed'));
    useAuthStore.getState().setAccessToken('access-token');

    await clearAuthenticationTokens();

    expect(useAuthStore.getState().accessToken).toBeNull();
  });
});
