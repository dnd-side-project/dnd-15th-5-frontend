import * as WebBrowser from 'expo-web-browser';

import { createOAuthCallbackUrl, isOAuthCallbackUrl } from './oauthCallbackUrl';

import type { SocialLoginProvider, SocialLoginResult } from '@chapchap/shared/bridge';

const OAUTH_CANCELLATION_ERRORS = new Set(['access_denied', 'cancelled', 'canceled']);

const createSocialLoginStartUrl = (
  apiBaseUrl: string,
  provider: SocialLoginProvider,
  codeChallenge: string
) => {
  const normalizedApiBaseUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl : `${apiBaseUrl}/`;
  const url = new URL(`oauth/${provider}/start`, normalizedApiBaseUrl);

  url.searchParams.set('client', 'APP');
  url.searchParams.set('codeChallenge', codeChallenge);

  return url.toString();
};

const parseOAuthRedirect = (
  redirectUrl: string,
  expectedRedirectUrl: string
): SocialLoginResult => {
  if (!isOAuthCallbackUrl(redirectUrl, expectedRedirectUrl)) {
    return { status: 'error', error: 'invalid_callback_url' };
  }

  const searchParams = new URL(redirectUrl).searchParams;
  const oauthError = searchParams.get('error');

  if (oauthError) {
    return OAUTH_CANCELLATION_ERRORS.has(oauthError)
      ? { status: 'cancelled' }
      : { status: 'error', error: oauthError };
  }

  const loginCode = searchParams.get('loginCode');

  return loginCode
    ? { status: 'success', loginCode }
    : { status: 'error', error: 'missing_login_code' };
};

/** 외부 브라우저에서 APP OAuth를 진행하고 딥링크 callback 결과를 반환합니다. */
export const startSocialLogin = async (
  provider: SocialLoginProvider,
  codeChallenge: string
): Promise<SocialLoginResult> => {
  const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

  if (!apiBaseUrl) {
    throw new Error('OAuth 시작에 필요한 API 주소가 설정되지 않았습니다.');
  }

  const redirectUrl = createOAuthCallbackUrl();
  const startUrl = createSocialLoginStartUrl(apiBaseUrl, provider, codeChallenge);
  const result = await WebBrowser.openAuthSessionAsync(startUrl, redirectUrl);

  if (result.type === 'success') {
    return parseOAuthRedirect(result.url, redirectUrl);
  }

  if (result.type === WebBrowser.WebBrowserResultType.CANCEL || result.type === 'dismiss') {
    return { status: 'cancelled' };
  }

  return { status: 'error', error: result.type };
};
