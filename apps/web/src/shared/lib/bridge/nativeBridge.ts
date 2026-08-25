import { BRIDGE_MESSAGE_KIND, isBridgeResponse, parseBridgeMessage } from '@chapchap/shared/bridge';

import { BRIDGE_REQUEST_TIMEOUT_MS } from './constants';

import type {
  BridgeEvent,
  BridgeEventPayload,
  BridgeEventType,
  BridgeMessageType,
  BridgePayload,
  BridgeRequest,
  BridgeResult,
} from '@chapchap/shared/bridge';

/** RN WebView가 웹 페이지에 주입하는 객체. 이 값이 있으면 앱의 WebView 안에서 실행 중이라는 뜻이다. */
type NativeWebView = {
  postMessage: (message: string) => void;
};

/**
 * 주입된 객체를 꺼낸다.
 * 전역 `Window` 타입을 확장하면 선언 병합 때문에 `interface`를 써야 하므로, 이 파일 안에서만 좁혀서 사용한다.
 */
const getNativeWebView = () =>
  typeof window === 'undefined'
    ? undefined
    : (window as unknown as { ReactNativeWebView?: NativeWebView }).ReactNativeWebView;

type PendingRequest = {
  resolve: (result: unknown) => void;
  reject: (error: Error) => void;
  timeoutId: ReturnType<typeof setTimeout>;
};

export class NativeBridgeRequestError extends Error {
  readonly reason: 'timeout';

  constructor(reason: 'timeout', message: string) {
    super(message);
    this.name = 'NativeBridgeRequestError';
    this.reason = reason;
  }
}

/** 응답을 기다리는 요청들. 응답이 도착하거나 제한 시간이 지나면 제거된다. */
const pendingRequests = new Map<string, PendingRequest>();

/** 응답 수신 리스너는 첫 요청 때 한 번만 등록한다. */
let isListening = false;

/**
 * 앱의 WebView 안에서 실행 중인지 확인한다.
 * 일반 브라우저에서는 `false`이므로 네이티브 기능을 호출하면 안 된다.
 */
export const isNativeApp = () => Boolean(getNativeWebView());

/**
 * 응답이 필요 없는 웹 상태 변경 이벤트를 네이티브에 전달한다.
 * 현재는 `MobileLayout`이 라우트 변경을 알릴 때 사용한다.
 */
export const notifyNative = <TType extends BridgeEventType>(
  type: TType,
  payload: BridgeEventPayload<TType>
) => {
  const nativeWebView = getNativeWebView();

  if (!nativeWebView) {
    return false;
  }

  const event: BridgeEvent<TType> = {
    kind: BRIDGE_MESSAGE_KIND.EVENT,
    type,
    payload,
  } as BridgeEvent<TType>;

  try {
    nativeWebView.postMessage(JSON.stringify(event));
    return true;
  } catch {
    // INFO: 상태 동기화 실패가 웹 화면 렌더링까지 중단시키지 않도록 한다.
    return false;
  }
};

/**
 * 요청 식별자를 만든다.
 * `crypto.randomUUID`는 보안 컨텍스트에서만 제공되므로, http로 여는 개발 환경을 위해 대체 방식을 둔다.
 */
const createRequestId = () =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const handleNativeMessage = (event: MessageEvent) => {
  if (typeof event.data !== 'string') {
    return;
  }

  const message = parseBridgeMessage(event.data);

  if (!isBridgeResponse(message)) {
    return;
  }

  const pendingRequest = pendingRequests.get(message.id);

  if (!pendingRequest) {
    return;
  }

  clearTimeout(pendingRequest.timeoutId);
  pendingRequests.delete(message.id);

  if (message.ok) {
    pendingRequest.resolve(message.result);
    return;
  }

  pendingRequest.reject(new Error(message.error.message));
};

const startListening = () => {
  if (isListening) {
    return;
  }

  // INFO: 네이티브가 보낸 메시지가 플랫폼에 따라 window 또는 document로 전달되므로 둘 다 듣는다.
  // INFO: 같은 응답이 두 번 와도 첫 처리에서 대기 목록에서 지워지므로 중복 처리되지 않는다.
  window.addEventListener('message', handleNativeMessage);
  document.addEventListener('message', handleNativeMessage as EventListener);
  isListening = true;
};

/**
 * 네이티브에 요청을 보내고 응답을 기다린다.
 *
 * - 요청마다 식별자를 붙여 응답과 짝지으므로, 여러 요청이 동시에 진행돼도 섞이지 않는다.
 * - WebView 환경이 아니거나 응답이 제한 시간 안에 오지 않으면 reject된다.
 * - 호출 전에 `isNativeApp()`으로 환경을 확인하는 것을 권장한다.
 */
export const requestToNative = <TType extends BridgeMessageType>(
  type: TType,
  payload: BridgePayload<TType>
): Promise<BridgeResult<TType>> => {
  const nativeWebView = getNativeWebView();

  if (!nativeWebView) {
    return Promise.reject(
      new Error('앱의 WebView 환경이 아니어서 네이티브 기능을 사용할 수 없습니다')
    );
  }

  startListening();

  const id = createRequestId();
  const request: BridgeRequest<TType> = {
    kind: BRIDGE_MESSAGE_KIND.REQUEST,
    id,
    type,
    payload,
  };

  return new Promise<BridgeResult<TType>>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      pendingRequests.delete(id);
      reject(
        new NativeBridgeRequestError(
          'timeout',
          `네이티브 응답이 오지 않아 요청이 만료되었습니다: ${type}`
        )
      );
    }, BRIDGE_REQUEST_TIMEOUT_MS[type]);

    pendingRequests.set(id, {
      resolve: resolve as (result: unknown) => void,
      reject,
      timeoutId,
    });

    try {
      nativeWebView.postMessage(JSON.stringify(request));
    } catch (error) {
      // INFO: 전송에 실패하면 응답이 올 수 없으므로 대기 요청과 타이머를 즉시 정리한다
      clearTimeout(timeoutId);
      pendingRequests.delete(id);
      reject(error instanceof Error ? error : new Error('네이티브로 요청을 보내지 못했습니다'));
    }
  });
};
