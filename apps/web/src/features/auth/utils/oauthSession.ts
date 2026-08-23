import { isOAuthCancellationError } from '@chapchap/shared/bridge';

import { AUTH_FLOW_ERROR_CODE, AuthFlowError } from '@/features/auth/errors';

const CODE_VERIFIER_STORAGE_KEY = 'chapchap.oauth.codeVerifier';
const CALLBACK_CONSUMED_STORAGE_KEY = 'chapchap.oauth.callbackConsumed';
type OAuthCallbackCredentials = {
  loginCode: string;
  codeVerifier: string;
};

/** 새 OAuth 시도의 verifier를 현재 탭 세션에 저장합니다. */
export const saveCodeVerifier = (codeVerifier: string) => {
  sessionStorage.setItem(CODE_VERIFIER_STORAGE_KEY, codeVerifier);
  sessionStorage.removeItem(CALLBACK_CONSUMED_STORAGE_KEY);
};

/** OAuth 임시 정보를 제거합니다. */
export const clearOAuthSession = () => {
  sessionStorage.removeItem(CODE_VERIFIER_STORAGE_KEY);
  sessionStorage.removeItem(CALLBACK_CONSUMED_STORAGE_KEY);
};

/** 저장된 verifier를 한 번만 꺼내며, 같은 콜백의 중복 처리를 차단합니다. */
export const consumeCodeVerifier = () => {
  if (sessionStorage.getItem(CALLBACK_CONSUMED_STORAGE_KEY)) {
    throw new AuthFlowError(AUTH_FLOW_ERROR_CODE.DUPLICATE_CALLBACK);
  }

  const codeVerifier = sessionStorage.getItem(CODE_VERIFIER_STORAGE_KEY);

  if (!codeVerifier) {
    throw new AuthFlowError(AUTH_FLOW_ERROR_CODE.MISSING_CODE_VERIFIER);
  }

  sessionStorage.removeItem(CODE_VERIFIER_STORAGE_KEY);
  sessionStorage.setItem(CALLBACK_CONSUMED_STORAGE_KEY, 'true');

  return codeVerifier;
};

/** OAuth 콜백 query를 검증하고 토큰 교환에 필요한 값을 반환합니다. */
export const consumeOAuthCallback = (searchParams: URLSearchParams): OAuthCallbackCredentials => {
  const oauthError = searchParams.get('error');

  if (oauthError) {
    clearOAuthSession();
    const errorCode = isOAuthCancellationError(oauthError)
      ? AUTH_FLOW_ERROR_CODE.OAUTH_CANCELLED
      : AUTH_FLOW_ERROR_CODE.OAUTH_FAILED;

    throw new AuthFlowError(errorCode);
  }

  const loginCode = searchParams.get('loginCode');

  if (!loginCode) {
    throw new AuthFlowError(AUTH_FLOW_ERROR_CODE.MISSING_LOGIN_CODE);
  }

  return {
    loginCode,
    codeVerifier: consumeCodeVerifier(),
  };
};
