import { act, renderHook } from '@testing-library/react';
import { useNavigate } from 'react-router-dom';

import { logoutAuthentication } from '@/shared/apis';

import { useLogout } from './useLogout';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));
jest.mock('@/shared/apis', () => ({ logoutAuthentication: jest.fn() }));

const mockNavigate = jest.fn();
const mockLogoutAuthentication = jest.mocked(logoutAuthentication);
const mockUseNavigate = jest.mocked(useNavigate);

describe('useLogout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseNavigate.mockReturnValue(mockNavigate);
  });

  it('로그아웃 완료 후 로그인 화면으로 이동한다', async () => {
    mockLogoutAuthentication.mockResolvedValue();
    const { result } = renderHook(() => useLogout());

    await act(() => result.current.logout());

    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    expect(mockLogoutAuthentication).toHaveBeenCalledWith();
  });
});
