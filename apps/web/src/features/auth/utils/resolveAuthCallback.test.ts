import { AUTH_FLOW_ERROR_CODE } from '@/features/auth/errors';
import { saveCodeVerifier } from '@/features/auth/utils/oauthSession';

import { resolveAuthCallback } from './resolveAuthCallback';

describe('resolveAuthCallback', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('loginCode는 토큰 교환 정보로 변환한다', () => {
    saveCodeVerifier('code-verifier');

    expect(resolveAuthCallback(new URLSearchParams({ loginCode: 'login-code' }))).toEqual({
      type: 'tokenExchange',
      credentials: { loginCode: 'login-code', codeVerifier: 'code-verifier' },
    });
  });

  it.each([
    ['oauth_cancelled', 'oauthCancelled'],
    ['withdrawal_cancelled', 'withdrawalCancelled'],
  ] as const)('%s는 별도 오류 화면 없이 복귀 동작으로 변환한다', (error, type) => {
    expect(resolveAuthCallback(new URLSearchParams({ error }))).toEqual({ type });
  });

  it('탈퇴 성공 query를 완료 동작으로 변환한다', () => {
    expect(resolveAuthCallback(new URLSearchParams({ withdrawal: 'success' }))).toEqual({
      type: 'withdrawalSuccess',
    });
  });

  it.each([
    ['account_withdrawn', AUTH_FLOW_ERROR_CODE.ACCOUNT_WITHDRAWN],
    ['oauth_failed', AUTH_FLOW_ERROR_CODE.OAUTH_FAILED],
    ['withdrawal_failed', AUTH_FLOW_ERROR_CODE.WITHDRAWAL_FAILED],
  ] as const)('%s를 사용자 안내 오류로 변환한다', (error, code) => {
    expect(() => resolveAuthCallback(new URLSearchParams({ error }))).toThrow(
      expect.objectContaining({ code })
    );
  });
});
