import { useAuthStore } from './authStore';

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      accessToken: null,
      signupToken: null,
      isInitialized: false,
      isAuthenticated: false,
    });
  });

  it('Access Token을 저장하면 로그인 상태가 된다', () => {
    useAuthStore.getState().setSignupToken('signup-token');
    useAuthStore.getState().setAccessToken('access-token');

    expect(useAuthStore.getState()).toMatchObject({
      accessToken: 'access-token',
      signupToken: null,
      isAuthenticated: true,
    });
  });

  it('Signup Token을 저장하면 약관 동의 전 상태가 된다', () => {
    useAuthStore.getState().setAccessToken('access-token');
    useAuthStore.getState().setSignupToken('signup-token');

    expect(useAuthStore.getState()).toMatchObject({
      accessToken: null,
      signupToken: 'signup-token',
      isAuthenticated: false,
    });
  });

  it('로그아웃 시 초기화 완료 상태는 유지하고 토큰만 제거한다', () => {
    useAuthStore.getState().setAccessToken('access-token');
    useAuthStore.getState().setInitialized(true);

    expect(useAuthStore.getState().isInitialized).toBe(true);

    useAuthStore.getState().clearAuth();

    expect(useAuthStore.getState()).toMatchObject({
      accessToken: null,
      signupToken: null,
      isInitialized: true,
      isAuthenticated: false,
    });
  });
});
