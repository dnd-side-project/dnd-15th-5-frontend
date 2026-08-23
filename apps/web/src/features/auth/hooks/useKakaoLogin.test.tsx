import { act, renderHook } from '@testing-library/react';

import { AUTH_FLOW_ERROR_CODE, AuthFlowError } from '@/features/auth/errors';
import { startSocialLogin } from '@/features/auth/utils/startSocialLogin';

import { useKakaoLogin } from './useKakaoLogin';

const mockShowToast = jest.fn();

jest.mock('@/features/auth/utils/startSocialLogin', () => ({ startSocialLogin: jest.fn() }));
jest.mock('@/shared/ui/toast', () => ({
  useToast: () => ({ showToast: mockShowToast, closeToast: jest.fn() }),
}));

const mockStartSocialLogin = jest.mocked(startSocialLogin);

describe('useKakaoLogin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('카카오 로그인을 시작한다', async () => {
    mockStartSocialLogin.mockResolvedValue();
    const { result } = renderHook(() => useKakaoLogin());

    await act(() => result.current.login());

    expect(mockStartSocialLogin).toHaveBeenCalledWith('kakao');
    expect(result.current.isLoading).toBe(true);
  });

  it('로그인 시작에 실패하면 로딩을 해제하고 오류를 안내한다', async () => {
    mockStartSocialLogin.mockRejectedValue(new Error('OAuth start failed'));
    const { result } = renderHook(() => useKakaoLogin());

    await act(() => result.current.login());

    expect(result.current.isLoading).toBe(false);
    expect(mockShowToast).toHaveBeenCalledWith({
      type: 'error',
      message: '카카오 로그인을 시작하지 못했습니다. 다시 시도해 주세요.',
    });
  });

  it('외부 인증을 취소하면 인증 흐름의 취소 메시지를 안내한다', async () => {
    mockStartSocialLogin.mockRejectedValue(new AuthFlowError(AUTH_FLOW_ERROR_CODE.OAUTH_CANCELLED));
    const { result } = renderHook(() => useKakaoLogin());

    await act(() => result.current.login());

    expect(result.current.isLoading).toBe(false);
    expect(mockShowToast).toHaveBeenCalledWith({
      type: 'error',
      message: '소셜 로그인이 취소되었습니다.',
    });
  });

  it('OAuth 처리 실패 시 사용자용 오류 메시지를 안내한다', async () => {
    mockStartSocialLogin.mockRejectedValue(new AuthFlowError(AUTH_FLOW_ERROR_CODE.OAUTH_FAILED));
    const { result } = renderHook(() => useKakaoLogin());

    await act(() => result.current.login());

    expect(mockShowToast).toHaveBeenCalledWith({
      type: 'error',
      message: '소셜 로그인을 완료하지 못했습니다. 다시 시도해 주세요.',
    });
  });
});
