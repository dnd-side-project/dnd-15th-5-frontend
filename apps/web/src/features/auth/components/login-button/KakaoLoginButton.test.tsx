import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useKakaoLogin } from '../../hooks/useKakaoLogin';

import KakaoLoginButton from './KakaoLoginButton';

jest.mock('../../hooks/useKakaoLogin', () => ({ useKakaoLogin: jest.fn() }));

const mockUseKakaoLogin = jest.mocked(useKakaoLogin);

describe('<KakaoLoginButton />', () => {
  it('버튼을 누르면 카카오 로그인 훅을 실행한다', async () => {
    const user = userEvent.setup();
    const login = jest.fn();
    mockUseKakaoLogin.mockReturnValue({ login, isLoading: false });

    render(<KakaoLoginButton />);
    await user.click(screen.getByRole('button', { name: 'Kakao 로그인' }));

    expect(login).toHaveBeenCalledTimes(1);
  });

  it('로그인 시작 중에는 로딩 상태를 표시한다', () => {
    mockUseKakaoLogin.mockReturnValue({ login: jest.fn(), isLoading: true });

    render(<KakaoLoginButton />);

    expect(screen.getByRole('button', { name: 'Kakao 로그인' })).toHaveAttribute(
      'aria-busy',
      'true'
    );
  });
});
