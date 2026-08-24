import { AUTH_FLOW_ERROR_CODE } from '@/features/auth/errors';

import { resolveAuthenticationResult } from './resolveAuthenticationResult';

describe('resolveAuthenticationResult', () => {
  it('Access Token이 있으면 인증 완료 결과를 반환한다', () => {
    expect(resolveAuthenticationResult({ accessToken: 'access-token' })).toEqual({
      type: 'authenticated',
      accessToken: 'access-token',
    });
  });

  it('약관 동의가 필요하면 Signup Token을 반환한다', () => {
    expect(
      resolveAuthenticationResult({
        requiresTermsAgreement: true,
        signupToken: 'signup-token',
      })
    ).toEqual({
      type: 'termsAgreementRequired',
      signupToken: 'signup-token',
    });
  });

  it('필요한 토큰이 없으면 잘못된 인증 응답 오류를 던진다', () => {
    expect(() => resolveAuthenticationResult({})).toThrow(
      expect.objectContaining({
        code: AUTH_FLOW_ERROR_CODE.INVALID_AUTH_RESPONSE,
      })
    );
  });
});
