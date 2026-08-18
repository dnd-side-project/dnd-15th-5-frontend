import { getUrlOrigin, isTrustedBridgeUrl } from './trustedOrigin';

describe('trustedOrigin', () => {
  it('URL에서 origin만 추출한다', () => {
    expect(getUrlOrigin('https://chapchap.example.com/map?tab=home')).toBe(
      'https://chapchap.example.com'
    );
  });

  it('설정된 웹 주소와 같은 origin만 허용한다', () => {
    expect(
      isTrustedBridgeUrl('https://chapchap.example.com/report', 'https://chapchap.example.com')
    ).toBe(true);
    expect(isTrustedBridgeUrl('https://evil.example.com', 'https://chapchap.example.com')).toBe(
      false
    );
  });

  it('올바르지 않은 URL은 허용하지 않는다', () => {
    expect(isTrustedBridgeUrl('not-a-url', 'https://chapchap.example.com')).toBe(false);
  });
});
