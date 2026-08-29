import { AUTH_FLOW_ERROR_CODE, AuthFlowError } from '@/features/auth/errors';

import { clearOAuthSession, consumeOAuthCallback } from './oauthSession';

export type AuthCallbackResult =
  | {
      type: 'tokenExchange';
      credentials: ReturnType<typeof consumeOAuthCallback>;
    }
  | { type: 'oauthCancelled' }
  | { type: 'withdrawalSuccess' }
  | { type: 'withdrawalCancelled' };

/** 로그인과 회원 탈퇴가 공유하는 OAuth 콜백 query를 후속 동작으로 변환합니다. */
export const resolveAuthCallback = (searchParams: URLSearchParams): AuthCallbackResult => {
  if (searchParams.get('withdrawal') === 'success') {
    clearOAuthSession();
    return { type: 'withdrawalSuccess' };
  }

  const callbackError = searchParams.get('error');

  if (callbackError === 'oauth_cancelled') {
    clearOAuthSession();
    return { type: 'oauthCancelled' };
  }

  if (callbackError === 'withdrawal_cancelled') {
    clearOAuthSession();
    return { type: 'withdrawalCancelled' };
  }

  if (callbackError === 'account_withdrawn') {
    clearOAuthSession();
    throw new AuthFlowError(AUTH_FLOW_ERROR_CODE.ACCOUNT_WITHDRAWN);
  }

  if (callbackError === 'withdrawal_failed') {
    clearOAuthSession();
    throw new AuthFlowError(AUTH_FLOW_ERROR_CODE.WITHDRAWAL_FAILED);
  }

  return {
    type: 'tokenExchange',
    credentials: consumeOAuthCallback(searchParams),
  };
};
