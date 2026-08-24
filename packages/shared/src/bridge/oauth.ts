const OAUTH_CANCELLATION_ERRORS = new Set(['access_denied', 'cancelled', 'canceled']);

/** OAuth 제공자 오류가 사용자 취소를 의미하는지 확인합니다. */
export const isOAuthCancellationError = (oauthError: string) =>
  OAUTH_CANCELLATION_ERRORS.has(oauthError);
