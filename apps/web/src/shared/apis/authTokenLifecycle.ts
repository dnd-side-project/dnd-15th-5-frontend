import { clearNativeRefreshToken, setNativeRefreshToken } from '@/shared/apis/nativeAuthToken';
import { isNativeApp } from '@/shared/lib/bridge';
import { useAuthStore } from '@/shared/stores/authStore';

type IssuedAuthenticationTokens = {
  accessToken: string;
  refreshToken?: string | null;
};

export type AuthenticationTokenStorageDependencies = {
  isNativeApp: () => boolean;
  setNativeRefreshToken: (refreshToken: string) => Promise<void>;
  clearNativeRefreshToken: () => Promise<void>;
};

const DEFAULT_STORAGE_DEPENDENCIES: AuthenticationTokenStorageDependencies = {
  isNativeApp,
  setNativeRefreshToken,
  clearNativeRefreshToken,
};

const INVALID_AUTHENTICATION_TOKENS_MESSAGE =
  '로그인 결과를 확인할 수 없습니다. 다시 로그인해 주세요.';

/** 발급된 토큰을 현재 환경에 맞는 저장소에 반영합니다. */
export const persistAuthenticationTokens = async (
  { accessToken, refreshToken }: IssuedAuthenticationTokens,
  dependencies = DEFAULT_STORAGE_DEPENDENCIES
) => {
  if (dependencies.isNativeApp()) {
    if (!refreshToken) {
      throw new Error(INVALID_AUTHENTICATION_TOKENS_MESSAGE);
    }

    await dependencies.setNativeRefreshToken(refreshToken);
  }

  useAuthStore.getState().setAccessToken(accessToken);
};

/** 인증 토큰을 메모리와 네이티브 보안 저장소에서 정리합니다. */
export const clearAuthenticationTokens = async (dependencies = DEFAULT_STORAGE_DEPENDENCIES) => {
  useAuthStore.getState().clearAuth();

  if (!dependencies.isNativeApp()) return;

  try {
    await dependencies.clearNativeRefreshToken();
  } catch {
    // INFO: 네이티브 저장소 정리 실패와 관계없이 웹 인증 상태 정리는 완료한다.
  }
};
