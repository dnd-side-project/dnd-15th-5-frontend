import { webcrypto } from 'node:crypto';

import { createCodeChallenge, createCodeVerifier, encodeBase64Url } from './pkce';

describe('PKCE', () => {
  const originalCrypto = globalThis.crypto;

  beforeAll(() => {
    Object.defineProperty(globalThis, 'crypto', {
      configurable: true,
      value: webcrypto,
    });
  });

  afterAll(() => {
    Object.defineProperty(globalThis, 'crypto', {
      configurable: true,
      value: originalCrypto,
    });
  });

  it('바이트 배열을 패딩 없는 Base64 URL-safe 문자열로 변환한다', () => {
    expect(encodeBase64Url(new Uint8Array([251, 255, 254]))).toBe('-__-');
  });

  it('허용된 문자로 구성된 43자 codeVerifier를 생성한다', () => {
    const codeVerifier = createCodeVerifier();

    expect(codeVerifier).toHaveLength(43);
    expect(codeVerifier).toMatch(/^[A-Za-z0-9_-]{43}$/u);
  });

  it('RFC 7636의 S256 예시와 같은 codeChallenge를 생성한다', async () => {
    const codeVerifier = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';

    await expect(createCodeChallenge(codeVerifier)).resolves.toBe(
      'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM'
    );
  });
});
