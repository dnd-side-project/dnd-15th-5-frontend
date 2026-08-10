import { BRIDGE_MESSAGE_KIND } from '@chapchap/shared/bridge';

import { createResponseScript } from './createResponseScript';

import type { BridgeResponse } from '@chapchap/shared/bridge';

const response: BridgeResponse = {
  kind: BRIDGE_MESSAGE_KIND.RESPONSE,
  id: 'request-01',
  type: 'ping',
  ok: true,
  result: { platform: 'android', receivedAt: 1 },
};

/** 스크립트에 삽입된 문자열 리터럴을 꺼내 원래 응답으로 되돌린다 */
const extractResponse = (script: string) => {
  const literal = script.slice(script.indexOf('data: ') + 'data: '.length, script.indexOf(' }));'));

  return JSON.parse(JSON.parse(literal));
};

describe('createResponseScript', () => {
  it('웹이 듣고 있는 message 이벤트를 발생시키는 스크립트를 만든다', () => {
    const script = createResponseScript(response);

    expect(script).toContain("window.dispatchEvent(new MessageEvent('message'");
    expect(script.trimEnd().endsWith('true;')).toBe(true);
  });

  it('응답 내용이 그대로 전달된다', () => {
    const script = createResponseScript(response);

    expect(extractResponse(script)).toEqual(response);
  });

  it('따옴표가 포함된 응답도 깨지지 않는다', () => {
    const errorResponse = {
      ...response,
      ok: false,
      error: { message: `'따옴표'와 "쌍따옴표"가 포함된 오류` },
    } as BridgeResponse;

    const script = createResponseScript(errorResponse);

    expect(extractResponse(script)).toEqual(errorResponse);
  });
});
