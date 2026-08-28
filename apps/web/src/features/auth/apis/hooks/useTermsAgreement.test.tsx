import { act, renderHook } from '@testing-library/react';
import { useNavigate } from 'react-router-dom';

import type { ApiResponseAuthenticationResponse } from '@/features/auth/apis/dto';
import { useAgree } from '@/features/auth/apis/mutations';
import { clearNativeRefreshToken, setNativeRefreshToken } from '@/shared/apis/nativeAuthToken';
import { isNativeApp } from '@/shared/lib/bridge';
import { useAuthStore } from '@/shared/stores/authStore';
import { useToast } from '@/shared/ui/toast';

import { useTermsAgreement } from './useTermsAgreement';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));
jest.mock('@/features/auth/apis/mutations', () => ({ useAgree: jest.fn() }));
jest.mock('@/shared/apis/nativeAuthToken', () => ({
  clearNativeRefreshToken: jest.fn(),
  setNativeRefreshToken: jest.fn(),
}));
jest.mock('@/shared/lib/bridge', () => ({ isNativeApp: jest.fn() }));
jest.mock('@/shared/ui/toast', () => ({ useToast: jest.fn() }));

const mockUseAgree = jest.mocked(useAgree);
const mockUseNavigate = jest.mocked(useNavigate);
const mockClearNativeRefreshToken = jest.mocked(clearNativeRefreshToken);
const mockSetNativeRefreshToken = jest.mocked(setNativeRefreshToken);
const mockIsNativeApp = jest.mocked(isNativeApp);
const mockUseToast = jest.mocked(useToast);
const mockMutate = jest.fn();
const mockNavigate = jest.fn();
const mockShowToast = jest.fn();
let handleSuccess:
  ((response: ApiResponseAuthenticationResponse) => void | Promise<void>) | undefined;

describe('useTermsAgreement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    handleSuccess = undefined;
    mockUseNavigate.mockReturnValue(mockNavigate);
    mockUseToast.mockReturnValue({ showToast: mockShowToast, closeToast: jest.fn() });
    mockIsNativeApp.mockReturnValue(false);
    mockClearNativeRefreshToken.mockResolvedValue();
    mockSetNativeRefreshToken.mockResolvedValue();
    useAuthStore.setState({
      accessToken: null,
      signupToken: 'signup-token',
      isInitialized: true,
      isAuthenticated: false,
    });
    mockUseAgree.mockImplementation((options) => {
      handleSuccess = options?.mutation?.onSuccess as typeof handleSuccess;

      return { mutate: mockMutate, isPending: false } as never;
    });
  });

  it('Signup Token과 필수 약관 동의 값을 전송한다', () => {
    const { result } = renderHook(() => useTermsAgreement());
    const agreement = { ageConfirmed: true, serviceTermsAgreed: true };

    act(() => result.current.submitTermsAgreement(agreement));

    expect(mockUseAgree).toHaveBeenCalledWith(
      expect.not.objectContaining({ request: expect.anything() })
    );
    expect(mockMutate).toHaveBeenCalledWith({ data: agreement });
  });

  it('웹 약관 동의가 완료되면 Access Token을 저장하고 온보딩으로 이동한다', async () => {
    renderHook(() => useTermsAgreement());

    await act(() => handleSuccess?.({ data: { accessToken: 'access-token' } }));

    expect(useAuthStore.getState()).toMatchObject({
      accessToken: 'access-token',
      signupToken: null,
      isAuthenticated: true,
    });
    expect(mockNavigate).toHaveBeenCalledWith('/onboarding', { replace: true });
  });

  it('앱 회원가입 완료 후 Refresh Token 저장에 실패하면 인증을 정리하고 로그인으로 이동한다', async () => {
    mockIsNativeApp.mockReturnValue(true);
    mockSetNativeRefreshToken.mockRejectedValue(new Error('SecureStore failed'));
    renderHook(() => useTermsAgreement());

    await act(() =>
      handleSuccess?.({
        data: { accessToken: 'access-token', refreshToken: 'refresh-token' },
      })
    );

    expect(mockClearNativeRefreshToken).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState()).toMatchObject({
      accessToken: null,
      signupToken: null,
      isAuthenticated: false,
    });
    expect(mockShowToast).toHaveBeenCalledWith({
      type: 'error',
      message: '로그인 정보를 저장하지 못했습니다. 다시 로그인해 주세요.',
    });
    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
  });

  it('Signup Token이 없으면 로그인 화면으로 이동하고 요청하지 않는다', () => {
    useAuthStore.setState({ signupToken: null });
    const { result } = renderHook(() => useTermsAgreement());

    act(() =>
      result.current.submitTermsAgreement({
        ageConfirmed: true,
        serviceTermsAgreed: true,
      })
    );

    expect(mockMutate).not.toHaveBeenCalled();
    expect(mockShowToast).toHaveBeenCalledWith({
      type: 'error',
      message: '가입 인증 정보가 만료되었습니다. 다시 로그인해 주세요.',
    });
    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
  });
});
