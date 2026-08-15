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
