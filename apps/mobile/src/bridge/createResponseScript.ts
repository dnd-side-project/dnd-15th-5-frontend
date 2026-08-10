import type { BridgeResponse } from '@chapchap/shared/bridge';

/**
 * 응답을 웹으로 전달하기 위해 WebView 안에서 실행할 스크립트를 만든다.
 *
 * `WebView.postMessage`는 플랫폼과 버전에 따라 메시지가 `window`가 아닌 `document`로 전달되는 등
 * 동작이 일정하지 않아, 웹이 기대하는 형태의 이벤트를 직접 발생시킨다.
 * 마지막 `true;`는 iOS에서 반환값 관련 경고가 나지 않도록 하기 위한 것이다.
 */
export const createResponseScript = (response: BridgeResponse) => {
  const serializedResponse = JSON.stringify(JSON.stringify(response));

  return `window.dispatchEvent(new MessageEvent('message', { data: ${serializedResponse} })); true;`;
};
