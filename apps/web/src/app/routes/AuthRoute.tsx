import { Navigate, Outlet } from 'react-router-dom';

import { ROUTE_PATHS } from '@/shared/constants/routePaths';
import { useAuthStore } from '@/shared/stores/authStore';

/** 로그인한 사용자가 로그인 화면에 다시 진입하지 않도록 홈으로 보냅니다. */
export function GuestOnlyRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const signupToken = useAuthStore((state) => state.signupToken);

  if (signupToken) return <Navigate replace to={ROUTE_PATHS.agreement} />;

  return isAuthenticated ? <Navigate replace to={ROUTE_PATHS.home} /> : <Outlet />;
}

/** Access Token이 필요한 화면을 미인증 사용자가 열면 로그인 화면으로 보냅니다. */
export function AuthenticatedRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return isAuthenticated ? <Outlet /> : <Navigate replace to={ROUTE_PATHS.login} />;
}

/** Signup Token이 있는 신규 회원만 약관 동의 화면에 진입하도록 제한합니다. */
export function TermsAgreementRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const signupToken = useAuthStore((state) => state.signupToken);

  if (signupToken) return <Outlet />;

  return <Navigate replace to={isAuthenticated ? ROUTE_PATHS.home : ROUTE_PATHS.login} />;
}
