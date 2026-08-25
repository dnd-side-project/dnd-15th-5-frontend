import type { CurrentPosition } from '../location/types';
import type { ShopSearchResult } from '../shop/types';

export type SocialLoginProvider = 'kakao' | 'google';

export type SocialLoginResult =
  | { status: 'success'; loginCode: string }
  | { status: 'cancelled' }
  | { status: 'error'; error: string };

/**
 * 웹과 네이티브가 주고받는 메시지의 종류.
 * 요청과 이벤트는 웹 → 네이티브, 응답은 네이티브 → 웹 방향이다.
 */
export const BRIDGE_MESSAGE_KIND = {
  REQUEST: 'request',
  RESPONSE: 'response',
  EVENT: 'event',
} as const;

/** 웹 장소 검색이 네이티브 영수증 기록에서 열렸음을 구분하는 query 값. */
export const RECEIPT_SHOP_SEARCH_SOURCE = 'receipt-native';

/** 웹이 응답을 기다리지 않고 네이티브에 알리는 이벤트와 payload 타입. */
export type BridgeEventMap = {
  // 모바일이 /home의 WebView만 edge-to-edge로 표시할 수 있도록 현재 웹 경로를 전달한다.
  routeChanged: {
    pathname: string;
  };
  // 영수증 리뷰에서 연 웹 검색 화면이 선택한 가게를 네이티브 폼에 전달한다.
  receiptShopSelected: {
    shop: ShopSearchResult;
  };
  receiptShopSearchCancelled: Record<string, never>;
  // 영수증 기록 중인 네이티브 화면을 모두 닫고 메인 WebView의 홈으로 이동하도록 요청한다.
  receiptRecordCloseRequested: Record<string, never>;
};

export type BridgeEventType = keyof BridgeEventMap;

export type BridgeEventPayload<TType extends BridgeEventType> = BridgeEventMap[TType];

export type BridgeEvent<TType extends BridgeEventType = BridgeEventType> = {
  [Type in TType]: {
    kind: typeof BRIDGE_MESSAGE_KIND.EVENT;
    type: Type;
    payload: BridgeEventPayload<Type>;
  };
}[TType];

/**
 * 웹이 네이티브에 요청할 수 있는 동작과 각각의 요청·응답 타입.
 * 여기에 항목을 추가하면 웹과 네이티브 양쪽에서 타입 검사가 함께 이뤄진다.
 *
 * NOTE: ping은 브릿지 동작 확인용이며 실제 기능에서 사용하지 않는다.
 */
export type BridgeMessageMap = {
  startSocialLogin: {
    payload: {
      provider: SocialLoginProvider;
      codeChallenge: string;
    };
    result: SocialLoginResult;
  };
  getCurrentPosition: {
    payload: Record<string, never>;
    result:
      | {
          status: 'success';
          position: CurrentPosition;
        }
      | { status: 'permissionDenied' }
      | { status: 'servicesDisabled' };
  };
  ping: {
    payload: { sentAt: number };
    result: { platform: string; receivedAt: number };
  };
  saveImage: {
    payload: { base64: string; fileName: string };
    result: { saved: true };
  };
  // NOTE: 영수증 촬영·검토는 앱에서만 제공하는 기능이라, 이 요청은 네이티브 카메라
  // 화면을 여는 데까지만 관여한다. 촬영 결과는 웹으로 돌아오지 않고 네이티브 화면 안에서 이어진다.
  captureReceipt: {
    payload: Record<string, never>;
    result: { opened: true };
  };
  getRefreshToken: {
    payload: Record<string, never>;
    result: { refreshToken: string | null };
  };
  saveRefreshToken: {
    payload: { refreshToken: string };
    result: { saved: true };
  };
  clearRefreshToken: {
    payload: Record<string, never>;
    result: { cleared: true };
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
