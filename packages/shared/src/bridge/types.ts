/**
 * 웹과 네이티브가 주고받는 메시지의 종류.
 * 요청은 웹 → 네이티브, 응답은 네이티브 → 웹 방향이다.
 */
export const BRIDGE_MESSAGE_KIND = {
  REQUEST: 'request',
  RESPONSE: 'response',
} as const;

/**
 * 웹이 네이티브에 요청할 수 있는 동작과 각각의 요청·응답 타입.
 * 여기에 항목을 추가하면 웹과 네이티브 양쪽에서 타입 검사가 함께 이뤄진다.
 *
 * TODO: ping은 브릿지 동작 확인용이며 실제 기능에서 사용하지 않는다.
 * 카메라 등 실제 요청 타입이 추가되면 계속 둘지 결정한다.
 */
export type BridgeMessageMap = {
  ping: {
    payload: { sentAt: number };
    result: { platform: string; receivedAt: number };
  };
};

export type BridgeMessageType = keyof BridgeMessageMap;

export type BridgePayload<TType extends BridgeMessageType> = BridgeMessageMap[TType]['payload'];

export type BridgeResult<TType extends BridgeMessageType> = BridgeMessageMap[TType]['result'];

/**
 * 웹이 네이티브로 보내는 요청.
 * `id`는 응답과 짝짓기 위한 값으로, 같은 종류의 요청이 동시에 진행돼도 섞이지 않게 한다.
 */
export type BridgeRequest<TType extends BridgeMessageType = BridgeMessageType> = {
  [Type in TType]: {
    kind: typeof BRIDGE_MESSAGE_KIND.REQUEST;
    id: string;
    type: Type;
    payload: BridgePayload<Type>;
  };
}[TType];

/**
 * 네이티브가 웹으로 보내는 응답. 요청의 `id`를 그대로 담아 어떤 요청에 대한 응답인지 알린다.
 * `ok`로 성공과 실패를 구분하며, 성공이면 `result`, 실패면 `error`를 가진다.
 */
export type BridgeResponse<TType extends BridgeMessageType = BridgeMessageType> = {
  [Type in TType]:
    | {
        kind: typeof BRIDGE_MESSAGE_KIND.RESPONSE;
        id: string;
        type: Type;
        ok: true;
        result: BridgeResult<Type>;
      }
    | {
        kind: typeof BRIDGE_MESSAGE_KIND.RESPONSE;
        id: string;
        type: Type;
        ok: false;
        error: { message: string };
      };
}[TType];
