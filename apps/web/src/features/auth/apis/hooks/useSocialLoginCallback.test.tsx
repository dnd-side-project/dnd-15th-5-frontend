import { act, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import type { ApiResponseAuthenticationResponse } from '@/features/auth/apis/dto';
import { useExchangeSocialLoginCode } from '@/features/auth/apis/mutations';
import { saveCodeVerifier } from '@/features/auth/utils/oauthSession';
import { setNativeRefreshToken } from '@/shared/apis/nativeAuthToken';
import { isNativeApp } from '@/shared/lib/bridge';
import { useAuthStore } from '@/shared/stores/authStore';

import { useSocialLoginCallback } from './useSocialLoginCallback';

jest.mock('@/features/auth/apis/mutations', () => ({
  useExchangeSocialLoginCode: jest.fn(),
}));
jest.mock('@/shared/apis/nativeAuthToken', () => ({ setNativeRefreshToken: jest.fn() }));
jest.mock('@/shared/lib/bridge', () => ({ isNativeApp: jest.fn() }));

const mockUseExchangeSocialLoginCode = jest.mocked(useExchangeSocialLoginCode);
const mockSetNativeRefreshToken = jest.mocked(setNativeRefreshToken);
const mockIsNativeApp = jest.mocked(isNativeApp);
const mockMutate = jest.fn();
let handleSuccess:
  ((response: ApiResponseAuthenticationResponse) => void | Promise<void>) | undefined;

function CallbackHarness() {
  const { error, isLoading } = useSocialLoginCallback();

  if (error) return <p>{error.message}</p>;

  return <p>{isLoading ? '로그인 처리 중' : '로그인 처리 완료'}</p>;
}

const renderCallback = (initialEntry: string) =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/auth/callback" element={<CallbackHarness />} />
        <Route path="/agreement" element={<p>약관 동의 화면</p>} />
        <Route path="/home" element={<p>홈 화면</p>} />
      </Routes>
    </MemoryRouter>
  );

describe('useSocialLoginCallback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
    handleSuccess = undefined;
    mockIsNativeApp.mockReturnValue(false);
    mockSetNativeRefreshToken.mockResolvedValue();
    useAuthStore.setState({
      accessToken: null,
      signupToken: null,
      isInitialized: false,
      isAuthenticated: false,
    });
    mockUseExchangeSocialLoginCode.mockImplementation((options) => {
      handleSuccess = options?.mutation?.onSuccess as typeof handleSuccess;

      return {
        mutate: mockMutate,
        isIdle: true,
        isPending: false,
      } as never;
    });
  });

  it('loginCode와 저장된 verifier를 한 번만 교환한다', async () => {
    saveCodeVerifier('code-verifier');

    renderCallback('/auth/callback?loginCode=login-code');

    await waitFor(() =>
      expect(mockMutate).toHaveBeenCalledWith({
        data: {
          loginCode: 'login-code',
          codeVerifier: 'code-verifier',
        },
      })
    );
    expect(mockMutate).toHaveBeenCalledTimes(1);
  });

  it('기존 회원은 Access Token을 저장하고 홈으로 이동한다', async () => {
    saveCodeVerifier('code-verifier');
    renderCallback('/auth/callback?loginCode=login-code');
    await waitFor(() => expect(mockMutate).toHaveBeenCalled());

    await act(() => handleSuccess?.({ data: { accessToken: 'access-token' } }));

    expect(await screen.findByText('홈 화면')).toBeInTheDocument();
    expect(useAuthStore.getState()).toMatchObject({
      accessToken: 'access-token',
      signupToken: null,
      isAuthenticated: true,
      isInitialized: true,
    });
  });

  it('앱 기존 회원은 Access Token 적용 전에 Refresh Token을 네이티브에 저장한다', async () => {
    mockIsNativeApp.mockReturnValue(true);
    saveCodeVerifier('code-verifier');
    renderCallback('/auth/callback?loginCode=login-code');
    await waitFor(() => expect(mockMutate).toHaveBeenCalled());

    await act(() =>
      handleSuccess?.({
        data: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
        },
      })
    );

    expect(mockSetNativeRefreshToken).toHaveBeenCalledWith('refresh-token');
    expect(await screen.findByText('홈 화면')).toBeInTheDocument();
    expect(useAuthStore.getState().accessToken).toBe('access-token');
  });

  it('앱 인증 완료 응답에 Refresh Token이 없으면 로그인 상태를 적용하지 않는다', async () => {
    mockIsNativeApp.mockReturnValue(true);
    saveCodeVerifier('code-verifier');
    renderCallback('/auth/callback?loginCode=login-code');
    await waitFor(() => expect(mockMutate).toHaveBeenCalled());

    await act(() => handleSuccess?.({ data: { accessToken: 'access-token' } }));

    expect(
      await screen.findByText('로그인 결과를 확인할 수 없습니다. 다시 로그인해 주세요.')
    ).toBeInTheDocument();
    expect(mockSetNativeRefreshToken).not.toHaveBeenCalled();
    expect(useAuthStore.getState().accessToken).toBeNull();
  });

  it('신규 회원은 Signup Token을 저장하고 약관 동의로 이동한다', async () => {
    saveCodeVerifier('code-verifier');
    renderCallback('/auth/callback?loginCode=login-code');
    await waitFor(() => expect(mockMutate).toHaveBeenCalled());

    await act(() =>
      handleSuccess?.({
        data: {
          requiresTermsAgreement: true,
          signupToken: 'signup-token',
        },
      })
    );

    expect(await screen.findByText('약관 동의 화면')).toBeInTheDocument();
    expect(useAuthStore.getState()).toMatchObject({
      accessToken: null,
      signupToken: 'signup-token',
      isAuthenticated: false,
      isInitialized: true,
    });
  });

  it('OAuth 취소 query가 전달되면 교환하지 않고 오류를 표시한다', async () => {
    saveCodeVerifier('code-verifier');

    renderCallback('/auth/callback?error=access_denied');

    expect(await screen.findByText('소셜 로그인이 취소되었습니다.')).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled();
  });
});
