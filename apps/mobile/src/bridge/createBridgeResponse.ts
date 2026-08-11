import { BRIDGE_MESSAGE_KIND } from '@chapchap/shared/bridge';

import { BRIDGE_HANDLERS } from './handlers';

import type { BridgeRequest, BridgeResponse } from '@chapchap/shared/bridge';

/**
 * 웹에서 온 요청을 처리해 응답 메시지를 만든다.
 *
 * 처리 중 오류가 나거나 알 수 없는 요청 타입이면 실패 응답을 돌려주므로,
 * 웹 쪽 요청이 타임아웃까지 대기하지 않는다.
 */
export const createBridgeResponse = async (request: BridgeRequest): Promise<BridgeResponse> => {
  const handler = BRIDGE_HANDLERS[request.type];

  if (!handler) {
    return {
      kind: BRIDGE_MESSAGE_KIND.RESPONSE,
      id: request.id,
      type: request.type,
      ok: false,
      error: { message: `처리할 수 없는 요청입니다: ${request.type}` },
    };
  }

  try {
    switch (request.type) {
      case 'ping':
        return {
          kind: BRIDGE_MESSAGE_KIND.RESPONSE,
          id: request.id,
          type: request.type,
          ok: true,
          result: await BRIDGE_HANDLERS.ping(request.payload),
        };
      case 'saveImage':
        return {
          kind: BRIDGE_MESSAGE_KIND.RESPONSE,
          id: request.id,
          type: request.type,
          ok: true,
          result: await BRIDGE_HANDLERS.saveImage(request.payload),
        };
    }
  } catch (error) {
    return {
      kind: BRIDGE_MESSAGE_KIND.RESPONSE,
      id: request.id,
      type: request.type,
      ok: false,
      error: { message: error instanceof Error ? error.message : '알 수 없는 오류입니다' },
    };
  }
};
