import { AUTH_FLOW_ERROR_CODE } from '@/features/auth/errors';

import { consumeCodeVerifier, consumeOAuthCallback, saveCodeVerifier } from './oauthSession';

describe('OAuth session', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('저장한 codeVerifier를 한 번만 소비한다', () => {
    saveCodeVerifier('code-verifier');

    expect(consumeCodeVerifier()).toBe('code-verifier');
    expect(() => consumeCodeVerifier()).toThrow(
      expect.objectContaining({
        code: AUTH_FLOW_ERROR_CODE.DUPLICATE_CALLBACK,
      })
    );
  });

  it('저장된 codeVerifier가 없으면 유실 오류를 던진다', () => {
    expect(() => consumeCodeVerifier()).toThrow(
      expect.objectContaining({
        code: AUTH_FLOW_ERROR_CODE.MISSING_CODE_VERIFIER,
      })
    );
  });

  it('OAuth error가 전달되면 취소 오류와 제공자 오류를 보존한다', () => {
    saveCodeVerifier('code-verifier');

    expect(() => consumeOAuthCallback(new URLSearchParams({ error: 'access_denied' }))).toThrow(
      expect.objectContaining({
        code: AUTH_FLOW_ERROR_CODE.OAUTH_CANCELLED,
        oauthError: 'access_denied',
      })
    );
    expect(() => consumeCodeVerifier()).toThrow(
      expect.objectContaining({
        code: AUTH_FLOW_ERROR_CODE.MISSING_CODE_VERIFIER,
      })
    );
  });

  it('사용자 취소가 아닌 OAuth error는 처리 실패로 구분한다', () => {
    saveCodeVerifier('code-verifier');

    expect(() => consumeOAuthCallback(new URLSearchParams({ error: 'invalid_state' }))).toThrow(
      expect.objectContaining({
        code: AUTH_FLOW_ERROR_CODE.OAUTH_FAILED,
        oauthError: 'invalid_state',
      })
    );
  });

  it('loginCode와 저장된 codeVerifier를 토큰 교환 값으로 반환한다', () => {
    saveCodeVerifier('code-verifier');

    expect(consumeOAuthCallback(new URLSearchParams({ loginCode: 'login-code' }))).toEqual({
      loginCode: 'login-code',
      codeVerifier: 'code-verifier',
    });
  });
});
