import { isBridgeRequest, isBridgeResponse } from './guards';
import { BRIDGE_MESSAGE_KIND } from './types';

describe('auth bridge guards', () => {
  it('비어 있지 않은 Refresh Token 저장 요청만 허용한다', () => {
    const request = {
      kind: BRIDGE_MESSAGE_KIND.REQUEST,
      id: 'request-01',
      type: 'setRefreshToken',
      payload: { refreshToken: 'refresh-token' },
    };

    expect(isBridgeRequest(request)).toBe(true);
    expect(isBridgeRequest({ ...request, payload: { refreshToken: '' } })).toBe(false);
  });

  it('Refresh Token 조회 응답은 문자열 또는 null만 허용한다', () => {
    const response = {
      kind: BRIDGE_MESSAGE_KIND.RESPONSE,
      id: 'request-02',
      type: 'getRefreshToken',
      ok: true,
      result: { refreshToken: null },
    };

    expect(isBridgeResponse(response)).toBe(true);
    expect(isBridgeResponse({ ...response, result: { refreshToken: 123 } })).toBe(false);
  });

  it('Refresh Token 제거 성공 응답의 결과를 검증한다', () => {
    const response = {
      kind: BRIDGE_MESSAGE_KIND.RESPONSE,
      id: 'request-03',
      type: 'clearRefreshToken',
      ok: true,
      result: { cleared: true },
    };

    expect(isBridgeResponse(response)).toBe(true);
    expect(isBridgeResponse({ ...response, result: { cleared: false } })).toBe(false);
  });
});
