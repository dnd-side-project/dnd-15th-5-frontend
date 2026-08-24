import * as Linking from 'expo-linking';

export const AUTH_CALLBACK_PATH = '/oauth/callback';

/** 현재 앱 빌드의 scheme을 사용하는 OAuth callback URL을 생성합니다. */
export const createOAuthCallbackUrl = () => Linking.createURL(AUTH_CALLBACK_PATH);

const getDeepLinkRoute = (url: URL) =>
  `/${[url.host, ...url.pathname.split('/')].filter(Boolean).join('/')}`;

/** 두·세 슬래시 표현 차이를 정규화해 같은 scheme과 callback 경로인지 확인합니다. */
export const isOAuthCallbackUrl = (
  candidateUrl: string,
  expectedUrl = createOAuthCallbackUrl()
) => {
  try {
    const candidate = new URL(candidateUrl);
    const expected = new URL(expectedUrl);

    return (
      candidate.protocol === expected.protocol &&
      getDeepLinkRoute(candidate) === getDeepLinkRoute(expected)
    );
  } catch {
    return false;
  }
};
