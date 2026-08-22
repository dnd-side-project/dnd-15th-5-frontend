import { StartClient } from '@/features/auth/apis/dto';

import { prepareOAuthLogin } from './prepareOAuthLogin';
import { createSocialLoginStartUrl, startSocialLogin } from './startSocialLogin';

jest.mock('./prepareOAuthLogin', () => ({ prepareOAuthLogin: jest.fn() }));

const mockPrepareOAuthLogin = jest.mocked(prepareOAuthLogin);

describe('startSocialLogin', () => {
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
});
