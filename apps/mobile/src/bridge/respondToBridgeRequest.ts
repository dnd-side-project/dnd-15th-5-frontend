import { isBridgeRequest } from '@chapchap/shared/bridge';

import { createBridgeResponse } from './createBridgeResponse';
import { createResponseScript } from './createResponseScript';

type BridgeResponseTarget = {
  injectJavaScript: (script: string) => void;
};

/**
 * WebView가 보낸 브릿지 요청을 처리하고 같은 WebView에 응답을 주입합니다.
 *
 * 인증 복원처럼 별도 WebView에서도 필요한 네이티브 요청이 누락되지 않도록 화면 간 공통으로
 * 사용합니다. 호출 전에 메시지를 보낸 URL이 신뢰하는 origin인지 검증해야 합니다.
 * 요청이 아닌 메시지는 처리하지 않고 `false`를 반환합니다.
 */
export const respondToBridgeRequest = async (
  message: unknown,
  trustedOrigin: string,
  responseTarget: BridgeResponseTarget | null
) => {
  if (!isBridgeRequest(message)) {
    return false;
  }

  const response = await createBridgeResponse(message);

  responseTarget?.injectJavaScript(createResponseScript(response, trustedOrigin));

  return true;
};
