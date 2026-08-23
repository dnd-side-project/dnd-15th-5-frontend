import { StartClient } from '@/features/auth/apis/dto';
import { AUTH_FLOW_ERROR_CODE } from '@/features/auth/errors';
import { requestToNative } from '@/shared/lib/bridge';

import { clearOAuthSession } from './oauthSession';
import { prepareOAuthLogin } from './prepareOAuthLogin';
import { createSocialLoginStartUrl, startSocialLogin } from './startSocialLogin';

jest.mock('./prepareOAuthLogin', () => ({ prepareOAuthLogin: jest.fn() }));
jest.mock('./oauthSession', () => ({ clearOAuthSession: jest.fn() }));
jest.mock('@/shared/lib/bridge', () => ({ requestToNative: jest.fn() }));

const mockPrepareOAuthLogin = jest.mocked(prepareOAuthLogin);
const mockRequestToNative = jest.mocked(requestToNative);
const mockClearOAuthSession = jest.mocked(clearOAuthSession);

describe('startSocialLogin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('백엔드 카카오 로그인 시작 URL을 생성한다', () => {
    expect(
      createSocialLoginStartUrl('kakao', {
        client: StartClient.WEB,
        codeChallenge: 'code-challenge',
      })
    ).toBe('/api/oauth/kakao/start?client=WEB&codeChallenge=code-challenge');
  });

  it('PKCE 값을 준비한 뒤 생성된 URL로 이동한다', async () => {
    const redirect = jest.fn();
    mockPrepareOAuthLogin.mockResolvedValue({
      client: StartClient.WEB,
      codeChallenge: 'code-challenge',
    });

    await startSocialLogin('kakao', redirect);

    expect(redirect).toHaveBeenCalledWith(
      '/api/oauth/kakao/start?client=WEB&codeChallenge=code-challenge'
    );
  });

  it('앱에서는 네이티브 OAuth 결과의 loginCode로 웹 callback에 이동한다', async () => {
    const redirect = jest.fn();
    mockPrepareOAuthLogin.mockResolvedValue({
      client: StartClient.APP,
      codeChallenge: 'code-challenge',
    });
    mockRequestToNative.mockResolvedValue({ status: 'success', loginCode: 'login-code' });

    await startSocialLogin('kakao', redirect);

    expect(mockRequestToNative).toHaveBeenCalledWith('startSocialLogin', {
      provider: 'kakao',
      codeChallenge: 'code-challenge',
    });
    expect(redirect).toHaveBeenCalledWith('/auth/callback?loginCode=login-code');
  });

  it('앱 외부 인증을 취소하면 OAuth 임시 정보를 정리하고 취소 오류를 반환한다', async () => {
    mockPrepareOAuthLogin.mockResolvedValue({
      client: StartClient.APP,
      codeChallenge: 'code-challenge',
    });
    mockRequestToNative.mockResolvedValue({ status: 'cancelled' });

    await expect(startSocialLogin('kakao')).rejects.toMatchObject({
      code: AUTH_FLOW_ERROR_CODE.OAUTH_CANCELLED,
    });
    expect(mockClearOAuthSession).toHaveBeenCalledTimes(1);
  });

  it('앱 OAuth 제공자 오류를 인증 흐름 오류로 보존한다', async () => {
    mockPrepareOAuthLogin.mockResolvedValue({
      client: StartClient.APP,
      codeChallenge: 'code-challenge',
    });
    mockRequestToNative.mockResolvedValue({ status: 'error', error: 'invalid_state' });

    await expect(startSocialLogin('google')).rejects.toMatchObject({
      code: AUTH_FLOW_ERROR_CODE.OAUTH_FAILED,
      oauthError: 'invalid_state',
    });
    expect(mockClearOAuthSession).toHaveBeenCalledTimes(1);
  });
});
