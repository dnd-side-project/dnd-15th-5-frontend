import type { AuthenticationResponse } from '@/features/auth/apis/dto';
import { AUTH_FLOW_ERROR_CODE, AuthFlowError } from '@/features/auth/errors';

export type AuthenticationResult =
  | { type: 'authenticated'; accessToken: string }
  | { type: 'termsAgreementRequired'; signupToken: string };

/** 인증 API 응답을 기존 회원 또는 약관 동의 필요 상태로 구분합니다. */
export const resolveAuthenticationResult = (
  response: AuthenticationResponse | undefined
): AuthenticationResult => {
  if (response?.requiresTermsAgreement && response.signupToken) {
    return {
      type: 'termsAgreementRequired',
      signupToken: response.signupToken,
    };
  }

  if (response?.accessToken) {
    return {
      type: 'authenticated',
      accessToken: response.accessToken,
    };
  }

  throw new AuthFlowError(AUTH_FLOW_ERROR_CODE.INVALID_AUTH_RESPONSE);
};
