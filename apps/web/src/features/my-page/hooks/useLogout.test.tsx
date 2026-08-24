import { act, renderHook } from '@testing-library/react';
import { useNavigate } from 'react-router-dom';

import { logoutAuthentication } from '@/shared/apis';
import { useToast } from '@/shared/ui/toast';

import { useLogout } from './useLogout';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));
jest.mock('@/shared/apis', () => ({ logoutAuthentication: jest.fn() }));
jest.mock('@/shared/ui/toast', () => ({ useToast: jest.fn() }));

const mockNavigate = jest.fn();
const mockShowToast = jest.fn();
const mockLogoutAuthentication = jest.mocked(logoutAuthentication);
const mockUseNavigate = jest.mocked(useNavigate);
const mockUseToast = jest.mocked(useToast);

describe('useLogout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseNavigate.mockReturnValue(mockNavigate);
    mockUseToast.mockReturnValue({ showToast: mockShowToast, closeToast: jest.fn() });
  });

  it('로그아웃 완료 후 로그인 화면으로 이동한다', async () => {
    mockLogoutAuthentication.mockResolvedValue();
    const { result } = renderHook(() => useLogout());

    await act(() => result.current.logout());

    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
  });

  it('로그아웃에 실패하면 오류를 안내한다', async () => {
    mockLogoutAuthentication.mockRejectedValue(new Error('Logout failed'));
    const { result } = renderHook(() => useLogout());

    await act(() => result.current.logout());

    expect(mockShowToast).toHaveBeenCalledWith({
      type: 'error',
      message: '로그아웃하지 못했습니다. 다시 시도해 주세요.',
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
