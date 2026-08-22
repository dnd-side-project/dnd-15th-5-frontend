import { prepareOAuthLogin } from './prepareOAuthLogin';

type SocialLoginProvider = 'kakao' | 'google';

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

  return `/api/oauth/${provider}/start?${searchParams.toString()}`;
};

/** PKCE 값을 준비한 뒤 브라우저를 소셜 로그인 화면으로 이동합니다. */
export const startSocialLogin = async (
  provider: SocialLoginProvider,
  redirect: Redirect = (url) => window.location.assign(url)
) => {
  const params = await prepareOAuthLogin();

  redirect(createSocialLoginStartUrl(provider, params));
};
