import { getAuthClient } from './authClient';
import { saveCodeVerifier } from './oauthSession';
import { createCodeChallenge, createCodeVerifier } from './pkce';

/** OAuth 로그인 시작에 필요한 PKCE 값과 클라이언트 환경을 준비합니다. */
export const prepareOAuthLogin = async () => {
  const codeVerifier = createCodeVerifier();
  const codeChallenge = await createCodeChallenge(codeVerifier);

  saveCodeVerifier(codeVerifier);

  return {
    client: getAuthClient(),
    codeChallenge,
  };
};
