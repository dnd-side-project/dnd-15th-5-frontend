/** URL에서 브릿지 허용 여부를 비교할 origin을 추출한다. */
export const getUrlOrigin = (url: string) => {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
};

/** WebView 메시지가 설정된 웹 주소와 같은 origin에서 전송됐는지 확인한다. */
export const isTrustedBridgeUrl = (requestUrl: string, trustedOrigin: string) =>
  getUrlOrigin(requestUrl) === trustedOrigin;

/** 설정된 origin 안에서만 WebView 내부 이동에 사용할 절대 URL을 만든다. */
export const getTrustedInternalUrl = (path: string, trustedOrigin: string) => {
  try {
    const targetUrl = new URL(path, trustedOrigin);

    return targetUrl.origin === trustedOrigin ? targetUrl.toString() : null;
  } catch {
    return null;
  }
};
