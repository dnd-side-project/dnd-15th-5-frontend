import { isBridgeEvent, isBridgeRequest, isBridgeResponse } from './guards';
import { BRIDGE_MESSAGE_KIND } from './types';

describe('네이티브 ISNet 브릿지', () => {
  const payload = { requestId: 'photo-01', base64: 'cGhvdG8=', mimeType: 'image/png' };
  const request = { kind: 'request', id: 'native-01', type: 'removeStickerBackground', payload };
  const response = {
    kind: 'response',
    id: 'native-01',
    type: 'removeStickerBackground',
    ok: true,
    result: { base64: 'aW1hZ2U=', mimeType: 'image/png', backend: 'coreml', elapsedMs: 10 },
  };
  it('사진 요청·준비·취소와 PNG 응답을 허용한다', () => {
    expect(isBridgeRequest(request)).toBe(true);
    expect(isBridgeRequest({ ...request, type: 'prepareStickerBackground', payload: {} })).toBe(
      true
    );
    expect(
      isBridgeRequest({
        ...request,
        type: 'cancelStickerBackground',
        payload: { requestId: 'photo-01' },
      })
    ).toBe(true);
    expect(isBridgeResponse(response)).toBe(true);
    expect(
      isBridgeResponse({
        ...response,
        type: 'prepareStickerBackground',
        result: { ready: true, backend: 'cpu' },
      })
    ).toBe(true);
    expect(
      isBridgeResponse({
        ...response,
        type: 'cancelStickerBackground',
        result: { cancelled: true },
      })
    ).toBe(true);
  });
  it.each([
    { ...payload, requestId: '' },
    { ...payload, base64: '' },
    { ...payload, base64: 'data:image/png;base64,aW1hZ2U=' },
    { ...payload, base64: 'bad' },
    { ...payload, mimeType: 'image/jpeg' },
    { ...payload, base64: 'a'.repeat(16 * 1024 * 1024 + 4) },
  ])('잘못된 사진 요청을 거부한다 (%#)', (invalid) => {
    expect(isBridgeRequest({ ...request, payload: invalid })).toBe(false);
  });
  it.each([
    { ...response.result, backend: 'webgpu' },
    { ...response.result, backend: 'nnapi' },
    { ...response.result, elapsedMs: -1 },
    { ...response.result, elapsedMs: Infinity },
    { ...response.result, mimeType: 'image/jpeg' },
    { ...response.result, base64: '' },
  ])('잘못된 추론 결과는 거부한다 (%#)', (invalid) => {
    expect(isBridgeResponse({ ...response, result: invalid })).toBe(false);
  });
});

describe('영수증 인식 결과 브릿지', () => {
  const response = {
    kind: 'response',
    id: 'scan-01',
    type: 'scanReceipt',
    ok: true,
    result: {
      status: 'success',
      receipt: {
        receiptImageId: 15,
        purchaseDate: '2020-07-25',
        purchaseTime: '11:20:00',
        amount: 33000,
        shop: null,
      },
    },
  };
  it('인식 결과와 취소 응답을 허용한다', () => {
    expect(
      isBridgeRequest({ kind: 'request', id: 'scan-01', type: 'scanReceipt', payload: {} })
    ).toBe(true);
    expect(isBridgeResponse(response)).toBe(true);
    expect(isBridgeResponse({ ...response, result: { status: 'cancelled' } })).toBe(true);
  });
  it('잘못된 영수증 ID와 가게 좌표를 거부한다', () => {
    expect(
      isBridgeResponse({
        ...response,
        result: { ...response.result, receipt: { ...response.result.receipt, receiptImageId: -1 } },
      })
    ).toBe(false);
    expect(
      isBridgeResponse({
        ...response,
        result: {
          ...response.result,
          receipt: {
            ...response.result.receipt,
            shop: {
              id: 'google-01',
              name: '가게',
              address: '서울',
              latitude: 999,
              longitude: 127,
              photoUrl: null,
            },
          },
        },
      })
    ).toBe(false);
  });
});

describe('auth bridge guards', () => {
  it('웹 분석 수신 준비 이벤트를 허용한다', () => {
    expect(
      isBridgeEvent({
        kind: BRIDGE_MESSAGE_KIND.EVENT,
        type: 'analyticsReady',
        payload: {},
      })
    ).toBe(true);
  });

  it('영수증 기록 종료 이벤트를 허용한다', () => {
    expect(
      isBridgeEvent({
        kind: BRIDGE_MESSAGE_KIND.EVENT,
        type: 'receiptRecordCloseRequested',
        payload: {},
      })
    ).toBe(true);
  });

  it('지원하는 제공자와 PKCE challenge를 가진 로그인 요청만 허용한다', () => {
    const request = {
      kind: BRIDGE_MESSAGE_KIND.REQUEST,
      id: 'request-oauth-01',
      type: 'startSocialLogin',
      payload: {
        provider: 'kakao',
        codeChallenge: 'a'.repeat(43),
      },
    };

    expect(isBridgeRequest(request)).toBe(true);
    expect(
      isBridgeRequest({ ...request, payload: { ...request.payload, provider: 'naver' } })
    ).toBe(false);
    expect(
      isBridgeRequest({ ...request, payload: { ...request.payload, codeChallenge: 'short' } })
    ).toBe(false);
  });

  it.each([
    { status: 'success', loginCode: 'login-code' },
    { status: 'cancelled' },
    { status: 'error', error: 'invalid_state' },
  ])('로그인 결과 응답을 검증한다: $status', (result) => {
    expect(
      isBridgeResponse({
        kind: BRIDGE_MESSAGE_KIND.RESPONSE,
        id: 'request-oauth-02',
        type: 'startSocialLogin',
        ok: true,
        result,
      })
    ).toBe(true);
  });

  it('비어 있지 않은 Refresh Token 저장 요청만 허용한다', () => {
    const request = {
      kind: BRIDGE_MESSAGE_KIND.REQUEST,
      id: 'request-01',
      type: 'saveRefreshToken',
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

  it('푸시 토큰 조회 요청과 응답을 검증한다', () => {
    const request = {
      kind: BRIDGE_MESSAGE_KIND.REQUEST,
      id: 'request-push-01',
      type: 'getPushToken',
      payload: {},
    };
    const response = {
      kind: BRIDGE_MESSAGE_KIND.RESPONSE,
      id: request.id,
      type: request.type,
      ok: true,
      result: { status: 'success', pushToken: 'ExponentPushToken[test-token]' },
    };

    expect(isBridgeRequest(request)).toBe(true);
    expect(isBridgeResponse(response)).toBe(true);
    expect(isBridgeResponse({ ...response, result: { status: 'success', pushToken: '' } })).toBe(
      false
    );
    expect(isBridgeResponse({ ...response, result: { status: 'permissionDenied' } })).toBe(true);
    expect(isBridgeResponse({ ...response, result: { status: 'unsupportedDevice' } })).toBe(true);
    expect(
      isBridgeResponse({
        ...response,
        result: {
          status: 'error',
          reason: 'network',
          message: 'network failed',
        },
      })
    ).toBe(true);
    expect(
      isBridgeResponse({
        ...response,
        result: { status: 'error', reason: 'invalid', message: 'failed' },
      })
    ).toBe(false);
    expect(
      isBridgeResponse({
        ...response,
        result: { status: 'error', reason: 'server', message: 'failed' },
      })
    ).toBe(true);
    expect(
      isBridgeResponse({
        ...response,
        result: { status: 'error', reason: 'server', message: '' },
      })
    ).toBe(false);
  });
});

describe('스티커 촬영 응답', () => {
  const response = {
    kind: BRIDGE_MESSAGE_KIND.RESPONSE,
    id: 'sticker-01',
    type: 'captureStickerPhoto',
    ok: true,
  };
  it('촬영 성공·취소·권한 거부를 구분한다', () => {
    expect(
      isBridgeResponse({
        ...response,
        result: { status: 'success', base64: 'cGhvdG8=', mimeType: 'image/jpeg' },
      })
    ).toBe(true);
    expect(isBridgeResponse({ ...response, result: { status: 'cancelled' } })).toBe(true);
    expect(isBridgeResponse({ ...response, result: { status: 'permissionDenied' } })).toBe(true);
  });
  it('파일 URI나 잘못된 이미지 데이터가 전달되면 거부한다', () => {
    expect(
      isBridgeResponse({
        ...response,
        result: { status: 'success', base64: 'file://photo.jpg', mimeType: 'image/jpeg' },
      })
    ).toBe(false);
    expect(
      isBridgeResponse({
        ...response,
        result: { status: 'success', base64: '', mimeType: 'image/jpeg' },
      })
    ).toBe(false);
    expect(
      isBridgeResponse({
        ...response,
        result: { status: 'success', base64: 'cGhvdG8=', mimeType: 'image/png' },
      })
    ).toBe(false);
  });
});
