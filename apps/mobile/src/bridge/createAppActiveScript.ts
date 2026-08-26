import { NATIVE_APP_ACTIVE_EVENT } from '@chapchap/shared/bridge';

/** 신뢰할 수 있는 WebView 문서에 앱 활성화 이벤트를 전달하는 스크립트를 만듭니다. */
export const createAppActiveScript = (trustedOrigin: string) => {
  const serializedEventName = JSON.stringify(NATIVE_APP_ACTIVE_EVENT);
  const serializedTrustedOrigin = JSON.stringify(trustedOrigin);

  return `if (window.location.origin === ${serializedTrustedOrigin}) { window.dispatchEvent(new Event(${serializedEventName})); } true;`;
};
