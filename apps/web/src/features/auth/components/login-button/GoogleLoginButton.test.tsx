import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useSocialLogin } from '@/features/auth/hooks/useSocialLogin';

import GoogleLoginButton from './GoogleLoginButton';

jest.mock('@/features/auth/hooks/useSocialLogin', () => ({ useSocialLogin: jest.fn() }));

const mockUseSocialLogin = jest.mocked(useSocialLogin);

describe('<GoogleLoginButton />', () => {
  it('버튼을 누르면 구글 로그인을 시작한다', async () => {
    const user = userEvent.setup();
    const login = jest.fn();
    mockUseSocialLogin.mockReturnValue({ login, isLoading: false });

    render(<GoogleLoginButton />);
    await user.click(screen.getByRole('button', { name: 'Google 로그인' }));

    expect(login).toHaveBeenCalledTimes(1);
    expect(mockUseSocialLogin).toHaveBeenCalledWith('google');
  });
});
