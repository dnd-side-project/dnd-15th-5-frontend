import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { useAuthStore } from '@/shared/stores/authStore';

import { AuthenticatedRoute, GuestOnlyRoute, TermsAgreementRoute } from './AuthRoute';

import type { ReactNode } from 'react';

const renderRoute = (guard: ReactNode, initialPath: string) =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route element={guard}>
          <Route path={initialPath} element={<p>대상 화면</p>} />
        </Route>
        <Route path="/" element={<p>로그인 화면</p>} />
        <Route path="/agreement" element={<p>약관 동의 화면</p>} />
        <Route path="/home" element={<p>홈 화면</p>} />
      </Routes>
    </MemoryRouter>
  );

describe('인증 라우트 가드', () => {
  beforeEach(() => {
    useAuthStore.setState({
      accessToken: null,
      signupToken: null,
      isInitialized: true,
      isAuthenticated: false,
    });
  });

  it('로그인한 사용자가 로그인 화면에 진입하면 홈으로 이동한다', () => {
    useAuthStore.getState().setAccessToken('access-token');

    renderRoute(<GuestOnlyRoute />, '/');

    expect(screen.getByText('홈 화면')).toBeInTheDocument();
  });

  it('Signup Token이 있는 사용자가 로그인 화면에 진입하면 약관 동의로 이동한다', () => {
    useAuthStore.getState().setSignupToken('signup-token');

    renderRoute(<GuestOnlyRoute />, '/');

    expect(screen.getByText('약관 동의 화면')).toBeInTheDocument();
  });

  it('미인증 사용자가 인증 필요 화면에 진입하면 로그인으로 이동한다', () => {
    renderRoute(<AuthenticatedRoute />, '/record');

    expect(screen.getByText('로그인 화면')).toBeInTheDocument();
  });

  it('Signup Token이 있으면 약관 동의 화면 진입을 허용한다', () => {
    useAuthStore.getState().setSignupToken('signup-token');

    renderRoute(<TermsAgreementRoute />, '/agreement');

    expect(screen.getByText('대상 화면')).toBeInTheDocument();
  });
});
