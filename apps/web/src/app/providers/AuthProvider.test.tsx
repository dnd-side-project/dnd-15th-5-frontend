import { render, screen, waitFor } from '@testing-library/react';

import { restoreNativeAuthentication } from '@/app/configureAxiosAuth';
import { refreshWeb } from '@/features/auth/apis/clients';
import { isNativeApp } from '@/shared/lib/bridge';
import { useAuthStore } from '@/shared/stores/authStore';

import AuthProvider from './AuthProvider';

jest.mock('@/features/auth/apis/clients', () => ({ refreshWeb: jest.fn() }));
jest.mock('@/app/configureAxiosAuth', () => ({ restoreNativeAuthentication: jest.fn() }));
jest.mock('@/shared/lib/bridge', () => ({ isNativeApp: jest.fn() }));

const mockRefreshWeb = jest.mocked(refreshWeb);
const mockRestoreNativeAuthentication = jest.mocked(restoreNativeAuthentication);
const mockIsNativeApp = jest.mocked(isNativeApp);

describe('<AuthProvider />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.history.replaceState(null, '', '/');
    mockIsNativeApp.mockReturnValue(false);
    mockRestoreNativeAuthentication.mockResolvedValue('app-access-token');
    useAuthStore.setState({
      accessToken: null,
      signupToken: null,
      isInitialized: false,
      isAuthenticated: false,
    });
  });

  it('웹 Refresh Token으로 Access Token을 복원한다', async () => {
    mockRefreshWeb.mockResolvedValue({ data: { accessToken: 'access-token' } });

    render(
      <AuthProvider>
        <p>앱 화면</p>
      </AuthProvider>
    );

    expect(screen.getByRole('status', { name: '로그인 상태 확인 중' })).toBeInTheDocument();
    expect(await screen.findByText('앱 화면')).toBeInTheDocument();
    expect(useAuthStore.getState()).toMatchObject({
      accessToken: 'access-token',
      isAuthenticated: true,
      isInitialized: true,
    });
  });

  it('재발급에 실패해도 미인증 상태로 초기화를 완료한다', async () => {
    mockRefreshWeb.mockRejectedValue(new Error('Unauthorized'));

    render(
      <AuthProvider>
        <p>앱 화면</p>
      </AuthProvider>
    );

    expect(await screen.findByText('앱 화면')).toBeInTheDocument();
    expect(useAuthStore.getState()).toMatchObject({
      accessToken: null,
      isAuthenticated: false,
      isInitialized: true,
    });
  });

  it('OAuth callback에서는 코드 교환 전에 웹 토큰 재발급을 요청하지 않는다', async () => {
    window.history.replaceState(null, '', '/auth/callback?loginCode=login-code');

    render(
      <AuthProvider>
        <p>콜백 화면</p>
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByText('콜백 화면')).toBeInTheDocument());
    expect(mockRefreshWeb).not.toHaveBeenCalled();
  });

  it('앱 시작 시 네이티브 Refresh Token으로 인증 상태를 복원한다', async () => {
    mockIsNativeApp.mockReturnValue(true);

    render(
      <AuthProvider>
        <p>앱 화면</p>
      </AuthProvider>
    );

    expect(screen.getByRole('status', { name: '로그인 상태 확인 중' })).toBeInTheDocument();
    expect(await screen.findByText('앱 화면')).toBeInTheDocument();
    expect(mockRestoreNativeAuthentication).toHaveBeenCalledTimes(1);
    expect(mockRefreshWeb).not.toHaveBeenCalled();
    expect(useAuthStore.getState().isInitialized).toBe(true);
  });
});
