import { StartClient } from '@/features/auth/apis/dto';
import { AUTH_FLOW_ERROR_CODE, AuthFlowError } from '@/features/auth/errors';
import { API_BASE_URL } from '@/shared/constants/api';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';
import { requestToNative } from '@/shared/lib/bridge';

import { clearOAuthSession } from './oauthSession';
import { prepareOAuthLogin } from './prepareOAuthLogin';

import type { SocialLoginProvider } from '@chapchap/shared/bridge';

type Redirect = (url: string) => void;

/** 백엔드 소셜 로그인 시작 엔드포인트 URL을 생성합니다. */
export const createSocialLoginStartUrl = (
  provider: SocialLoginProvider,
  params: Awaited<ReturnType<typeof prepareOAuthLogin>>
) => {
  const searchParams = new URLSearchParams({
    client: params.client,
    codeChallenge: params.codeChallenge,
  });

  return `${API_BASE_URL}/oauth/${provider}/start?${searchParams.toString()}`;
};

/** PKCE 값을 준비한 뒤 브라우저를 소셜 로그인 화면으로 이동합니다. */
export const startSocialLogin = async (
  provider: SocialLoginProvider,
  redirect: Redirect = (url) => window.location.assign(url)
) => {
  const params = await prepareOAuthLogin();

  if (params.client === StartClient.APP) {
    try {
      const result = await requestToNative('startSocialLogin', {
        provider,
        codeChallenge: params.codeChallenge,
      });

      if (result.status === 'success') {
        const callbackSearchParams = new URLSearchParams({ loginCode: result.loginCode });

        redirect(`${ROUTE_PATHS.authCallback}?${callbackSearchParams.toString()}`);
        return;
      }

      if (result.status === 'cancelled') {
        throw new AuthFlowError(AUTH_FLOW_ERROR_CODE.OAUTH_CANCELLED);
      }

      throw new AuthFlowError(AUTH_FLOW_ERROR_CODE.OAUTH_FAILED);
    } catch (error) {
      clearOAuthSession();
      throw error;
    }
  }

  redirect(createSocialLoginStartUrl(provider, params));
};
