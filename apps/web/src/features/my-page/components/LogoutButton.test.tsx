import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useLogout } from '../hooks/useLogout';

import LogoutButton from './LogoutButton';

jest.mock('../hooks/useLogout', () => ({ useLogout: jest.fn() }));

const mockUseLogout = jest.mocked(useLogout);

describe('<LogoutButton />', () => {
  it('버튼을 누르면 로그아웃을 실행한다', async () => {
    const user = userEvent.setup();
    const logout = jest.fn();
    mockUseLogout.mockReturnValue({ isLoading: false, logout });

    render(<LogoutButton />);
    await user.click(screen.getByRole('button', { name: '로그아웃' }));

    expect(logout).toHaveBeenCalledTimes(1);
  });
});
