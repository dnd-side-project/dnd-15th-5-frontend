import { create } from 'zustand';

type AuthStore = {
  accessToken: string | null;
  signupToken: string | null;
  isInitialized: boolean;
  isAuthenticated: boolean;
  setAccessToken: (accessToken: string | null) => void;
  setSignupToken: (signupToken: string | null) => void;
  setInitialized: (isInitialized: boolean) => void;
  clearAuth: () => void;
};

const INITIAL_AUTH_STATE = {
  accessToken: null,
  signupToken: null,
  isInitialized: false,
  isAuthenticated: false,
} as const;

/** 로그인 토큰과 인증 초기화 상태를 메모리에서 관리합니다. */
export const useAuthStore = create<AuthStore>((set) => ({
  ...INITIAL_AUTH_STATE,
  setAccessToken: (accessToken) =>
    set({
      accessToken,
      signupToken: null,
      isAuthenticated: Boolean(accessToken),
    }),
  setSignupToken: (signupToken) =>
    set({
      accessToken: null,
      signupToken,
      isAuthenticated: false,
    }),
  setInitialized: (isInitialized) => set({ isInitialized }),
  clearAuth: () =>
    set({
      accessToken: null,
      signupToken: null,
      isAuthenticated: false,
    }),
}));
