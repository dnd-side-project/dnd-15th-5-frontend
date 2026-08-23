import * as Linking from 'expo-linking';

export const AUTH_CALLBACK_PATH = '/auth/callback';

/** 현재 앱 빌드의 scheme을 사용하는 OAuth callback URL을 생성합니다. */
export const createOAuthCallbackUrl = () => Linking.createURL(AUTH_CALLBACK_PATH);

/** 전달된 URL이 현재 앱의 OAuth callback URL과 같은 scheme·host·path인지 확인합니다. */
export const isOAuthCallbackUrl = (
  candidateUrl: string,
  expectedUrl = createOAuthCallbackUrl()
) => {
  try {
    const candidate = new URL(candidateUrl);
    const expected = new URL(expectedUrl);

    return (
      candidate.protocol === expected.protocol &&
      candidate.host === expected.host &&
      candidate.pathname === expected.pathname
    );
  } catch {
    return false;
  }
};
