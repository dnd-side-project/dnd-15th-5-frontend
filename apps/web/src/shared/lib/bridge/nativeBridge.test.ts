import { BRIDGE_MESSAGE_KIND } from '@chapchap/shared/bridge';

import { BRIDGE_REQUEST_TIMEOUT_MS } from './constants';
import { isNativeApp, requestToNative } from './nativeBridge';

import type { BridgeRequest } from '@chapchap/shared/bridge';

const postMessage = jest.fn();

const nativeWindow = window as unknown as {
  ReactNativeWebView?: { postMessage: (message: string) => void };
};

const setNativeWebView = (isAvailable: boolean) => {
  if (isAvailable) {
    nativeWindow.ReactNativeWebView = { postMessage };
    return;
  }

  delete nativeWindow.ReactNativeWebView;
};

const getSentRequest = (): BridgeRequest => JSON.parse(postMessage.mock.calls[0][0]);

const respondFromNative = (response: unknown) => {
  window.dispatchEvent(new MessageEvent('message', { data: JSON.stringify(response) }));
};

describe('nativeBridge', () => {
  beforeEach(() => {
    postMessage.mockReset();
    setNativeWebView(true);
  });

  describe('isNativeApp', () => {
    it('WebView 환경이면 true를 반환한다', () => {
      expect(isNativeApp()).toBe(true);
    });

    it('일반 브라우저면 false를 반환한다', () => {
      setNativeWebView(false);

      expect(isNativeApp()).toBe(false);
    });
  });

  it('요청을 네이티브로 보내고 응답을 반환한다', async () => {
    const resultPromise = requestToNative('ping', { sentAt: 0 });
    const sentRequest = getSentRequest();

    respondFromNative({
      kind: BRIDGE_MESSAGE_KIND.RESPONSE,
      id: sentRequest.id,
      type: 'ping',
      ok: true,
      result: { platform: 'ios', receivedAt: 1 },
    });

    await expect(resultPromise).resolves.toEqual({ platform: 'ios', receivedAt: 1 });
  });

  it('실패 응답을 받으면 사유와 함께 거부한다', async () => {
    const resultPromise = requestToNative('ping', { sentAt: 0 });
    const sentRequest = getSentRequest();

    respondFromNative({
      kind: BRIDGE_MESSAGE_KIND.RESPONSE,
      id: sentRequest.id,
      type: 'ping',
      ok: false,
      error: { message: '카메라 권한이 없습니다' },
    });

    await expect(resultPromise).rejects.toThrow('카메라 권한이 없습니다');
  });

  it('식별자가 다른 응답은 무시한다', async () => {
    jest.useFakeTimers();
    const resultPromise = requestToNative('ping', { sentAt: 0 });

    respondFromNative({
      kind: BRIDGE_MESSAGE_KIND.RESPONSE,
      id: 'other-request-id',
      type: 'ping',
      ok: true,
      result: { platform: 'ios', receivedAt: 1 },
    });
    jest.advanceTimersByTime(BRIDGE_REQUEST_TIMEOUT_MS);

    await expect(resultPromise).rejects.toThrow('만료');
    jest.useRealTimers();
  });

  it('WebView 환경이 아니면 요청하지 않고 거부한다', async () => {
    setNativeWebView(false);

    await expect(requestToNative('ping', { sentAt: 0 })).rejects.toThrow('WebView 환경이 아니');
    expect(postMessage).not.toHaveBeenCalled();
  });
});
