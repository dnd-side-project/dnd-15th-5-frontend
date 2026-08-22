const PKCE_RANDOM_BYTE_LENGTH = 32;

/** 바이트 배열을 패딩 없는 Base64 URL-safe 문자열로 변환합니다. */
export const encodeBase64Url = (bytes: Uint8Array) => {
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');

  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/u, '');
};

/** PKCE 규격의 43자 codeVerifier를 생성합니다. */
export const createCodeVerifier = () => {
  const randomBytes = crypto.getRandomValues(new Uint8Array(PKCE_RANDOM_BYTE_LENGTH));

  return encodeBase64Url(randomBytes);
};

/** codeVerifier를 SHA-256으로 해싱해 PKCE S256 codeChallenge를 생성합니다. */
export const createCodeChallenge = async (codeVerifier: string) => {
  const encodedVerifier = new TextEncoder().encode(codeVerifier);
  const digest = await crypto.subtle.digest('SHA-256', encodedVerifier);

  return encodeBase64Url(new Uint8Array(digest));
};
