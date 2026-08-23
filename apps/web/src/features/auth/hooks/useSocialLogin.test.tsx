import { act, renderHook } from '@testing-library/react';

import { AUTH_FLOW_ERROR_CODE, AuthFlowError } from '@/features/auth/errors';
import { startSocialLogin } from '@/features/auth/utils/startSocialLogin';

import { useSocialLogin } from './useSocialLogin';

const mockShowToast = jest.fn();

jest.mock('@/features/auth/utils/startSocialLogin', () => ({ startSocialLogin: jest.fn() }));
jest.mock('@/shared/ui/toast', () => ({
  useToast: () => ({ showToast: mockShowToast, closeToast: jest.fn() }),
}));

const mockStartSocialLogin = jest.mocked(startSocialLogin);

describe('useSocialLogin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each(['kakao', 'google'] as const)('%s 로그인을 시작한다', async (provider) => {
    mockStartSocialLogin.mockResolvedValue();
    const { result } = renderHook(() => useSocialLogin(provider));

    await act(() => result.current.login());

    expect(mockStartSocialLogin).toHaveBeenCalledWith(provider);
    expect(result.current.isLoading).toBe(true);
  });

  it('구글 로그인 시작에 실패하면 로딩을 해제하고 제공자별 오류를 안내한다', async () => {
    mockStartSocialLogin.mockRejectedValue(new Error('OAuth start failed'));
    const { result } = renderHook(() => useSocialLogin('google'));

    await act(() => result.current.login());

    expect(result.current.isLoading).toBe(false);
    expect(mockShowToast).toHaveBeenCalledWith({
      type: 'error',
      message: '구글 로그인을 시작하지 못했습니다. 다시 시도해 주세요.',
    });
  });

  it.each([
    [AUTH_FLOW_ERROR_CODE.OAUTH_CANCELLED, '소셜 로그인이 취소되었습니다.'],
    [AUTH_FLOW_ERROR_CODE.OAUTH_FAILED, '소셜 로그인을 완료하지 못했습니다. 다시 시도해 주세요.'],
  ] as const)('인증 흐름의 %s 오류를 안내한다', async (code, message) => {
    mockStartSocialLogin.mockRejectedValue(new AuthFlowError(code));
    const { result } = renderHook(() => useSocialLogin('google'));

    await act(() => result.current.login());

    expect(result.current.isLoading).toBe(false);
    expect(mockShowToast).toHaveBeenCalledWith({ type: 'error', message });
  });
});
