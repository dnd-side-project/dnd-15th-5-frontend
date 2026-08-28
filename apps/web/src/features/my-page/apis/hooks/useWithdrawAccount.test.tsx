import { useQueryClient } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { useNavigate } from 'react-router-dom';

import {
  redirectToAccountWithdrawal,
  requestAccountWithdrawal,
} from '@/features/my-page/apis/withdrawAccount';
import { clearAuthenticationTokens } from '@/shared/apis/authTokenLifecycle';
import { useToast } from '@/shared/ui/toast';

import { useWithdrawAccount } from './useWithdrawAccount';

jest.mock('@tanstack/react-query', () => ({ useQueryClient: jest.fn() }));
jest.mock('react-router-dom', () => ({ useNavigate: jest.fn() }));
jest.mock('@/features/my-page/apis/withdrawAccount', () => ({
  redirectToAccountWithdrawal: jest.fn(),
  requestAccountWithdrawal: jest.fn(),
}));
jest.mock('@/shared/apis/authTokenLifecycle', () => ({ clearAuthenticationTokens: jest.fn() }));
jest.mock('@/shared/ui/toast', () => ({ useToast: jest.fn() }));

const mockClearQueries = jest.fn();
const mockNavigate = jest.fn();
const mockShowToast = jest.fn();
const mockRequestAccountWithdrawal = jest.mocked(requestAccountWithdrawal);
const mockRedirectToAccountWithdrawal = jest.mocked(redirectToAccountWithdrawal);
const mockClearAuthenticationTokens = jest.mocked(clearAuthenticationTokens);

describe('useWithdrawAccount', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useQueryClient).mockReturnValue({ clear: mockClearQueries } as never);
    jest.mocked(useNavigate).mockReturnValue(mockNavigate);
    jest.mocked(useToast).mockReturnValue({ showToast: mockShowToast, closeToast: jest.fn() });
    mockClearAuthenticationTokens.mockResolvedValue();
  });

  it('즉시 탈퇴가 완료되면 인증과 캐시를 정리하고 로그인 화면으로 이동한다', async () => {
    mockRequestAccountWithdrawal.mockResolvedValue({ type: 'completed' });
    const { result } = renderHook(() => useWithdrawAccount());

    await act(() => result.current.withdraw());

    expect(mockClearAuthenticationTokens).toHaveBeenCalledTimes(1);
    expect(mockClearQueries).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
  });

  it('재인증이 필요하면 토큰을 지우지 않고 Location 주소로 이동한다', async () => {
    mockRequestAccountWithdrawal.mockResolvedValue({
      type: 'reauthentication-required',
      location: 'https://accounts.google.com/reauthenticate',
    });
    const { result } = renderHook(() => useWithdrawAccount());

    await act(() => result.current.withdraw());

    expect(mockRedirectToAccountWithdrawal).toHaveBeenCalledWith(
      'https://accounts.google.com/reauthenticate'
    );
    expect(mockClearAuthenticationTokens).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('탈퇴 요청에 실패하면 오류를 안내한다', async () => {
    mockRequestAccountWithdrawal.mockRejectedValue(new Error('Withdrawal failed'));
    const { result } = renderHook(() => useWithdrawAccount());

    await act(() => result.current.withdraw());

    expect(mockShowToast).toHaveBeenCalledWith({
      type: 'error',
      message: '회원탈퇴를 완료하지 못했습니다. 다시 시도해 주세요.',
    });
    expect(mockClearAuthenticationTokens).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
