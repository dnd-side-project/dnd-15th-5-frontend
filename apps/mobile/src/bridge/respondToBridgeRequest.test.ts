import { BRIDGE_MESSAGE_KIND } from '@chapchap/shared/bridge';

import { respondToBridgeRequest } from './respondToBridgeRequest';

const TRUSTED_ORIGIN = 'https://chapchap.example.com';

describe('respondToBridgeRequest', () => {
  it('웹 요청을 처리하고 응답 스크립트를 WebView에 주입한다', async () => {
    const responseTarget = { injectJavaScript: jest.fn() };
    const request = {
      kind: BRIDGE_MESSAGE_KIND.REQUEST,
      id: 'request-01',
      type: 'ping',
      payload: { sentAt: 1 },
    } as const;

    const isHandled = await respondToBridgeRequest(request, TRUSTED_ORIGIN, responseTarget);

    expect(isHandled).toBe(true);
    expect(responseTarget.injectJavaScript).toHaveBeenCalledWith(
      expect.stringContaining('request-01')
    );
    expect(responseTarget.injectJavaScript).toHaveBeenCalledWith(
      expect.stringContaining(TRUSTED_ORIGIN)
    );
  });

  it('브릿지 요청이 아닌 메시지는 처리하지 않는다', async () => {
    const responseTarget = { injectJavaScript: jest.fn() };

    const isHandled = await respondToBridgeRequest(
      {
        kind: BRIDGE_MESSAGE_KIND.EVENT,
        type: 'routeChanged',
        payload: { pathname: '/home' },
      },
      TRUSTED_ORIGIN,
      responseTarget
    );

    expect(isHandled).toBe(false);
    expect(responseTarget.injectJavaScript).not.toHaveBeenCalled();
  });
});
