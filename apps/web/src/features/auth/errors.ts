export const AUTH_FLOW_ERROR_CODE = {
  MISSING_CODE_VERIFIER: 'missingCodeVerifier',
  DUPLICATE_CALLBACK: 'duplicateCallback',
  OAUTH_CANCELLED: 'oauthCancelled',
  MISSING_LOGIN_CODE: 'missingLoginCode',
} as const;

export type AuthFlowErrorCode = (typeof AUTH_FLOW_ERROR_CODE)[keyof typeof AUTH_FLOW_ERROR_CODE];

const AUTH_FLOW_ERROR_MESSAGE: Record<AuthFlowErrorCode, string> = {
  [AUTH_FLOW_ERROR_CODE.MISSING_CODE_VERIFIER]:
    '로그인 인증 정보가 만료되었습니다. 다시 로그인해 주세요.',
  [AUTH_FLOW_ERROR_CODE.DUPLICATE_CALLBACK]: '이미 처리된 로그인 요청입니다.',
  [AUTH_FLOW_ERROR_CODE.OAUTH_CANCELLED]: '소셜 로그인이 취소되었습니다.',
  [AUTH_FLOW_ERROR_CODE.MISSING_LOGIN_CODE]: '로그인 코드를 확인할 수 없습니다.',
};

/** OAuth 진행 중 사용자에게 안내할 수 있는 인증 흐름 오류입니다. */
export class AuthFlowError extends Error {
  readonly code: AuthFlowErrorCode;
  readonly oauthError?: string;

  constructor(code: AuthFlowErrorCode, options?: { oauthError?: string }) {
    super(AUTH_FLOW_ERROR_MESSAGE[code]);
    this.name = 'AuthFlowError';
    this.code = code;
    this.oauthError = options?.oauthError;
  }
}
