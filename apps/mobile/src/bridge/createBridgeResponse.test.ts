import { BRIDGE_MESSAGE_KIND } from '@chapchap/shared/bridge';

import {
  clearRefreshToken,
  getRefreshToken,
  setRefreshToken,
  startSocialLogin,
} from '@/native/auth';
import { getCurrentPosition } from '@/native/location';
import { openReceiptCamera } from '@/native/openReceiptCamera';
import { saveImageToLibrary } from '@/native/save-image';

import { createBridgeResponse } from './createBridgeResponse';

import type { BridgeRequest } from '@chapchap/shared/bridge';

jest.mock('@/native/location', () => ({ getCurrentPosition: jest.fn() }));
jest.mock('@/native/save-image', () => ({ saveImageToLibrary: jest.fn() }));
jest.mock('@/native/openReceiptCamera', () => ({ openReceiptCamera: jest.fn() }));
jest.mock('@/native/auth', () => ({
  clearRefreshToken: jest.fn(),
  getRefreshToken: jest.fn(),
  setRefreshToken: jest.fn(),
  startSocialLogin: jest.fn(),
}));

const mockClearRefreshToken = jest.mocked(clearRefreshToken);
const mockGetRefreshToken = jest.mocked(getRefreshToken);
const mockGetCurrentPosition = jest.mocked(getCurrentPosition);
const mockSaveImageToLibrary = jest.mocked(saveImageToLibrary);
const mockOpenReceiptCamera = jest.mocked(openReceiptCamera);
const mockSetRefreshToken = jest.mocked(setRefreshToken);
const mockStartSocialLogin = jest.mocked(startSocialLogin);

const createRequest = (overrides: Partial<BridgeRequest> = {}): BridgeRequest =>
  ({
    kind: BRIDGE_MESSAGE_KIND.REQUEST,
    id: 'request-01',
    type: 'ping',
    payload: { sentAt: 0 },
    ...overrides,
  }) as BridgeRequest;

describe('createBridgeResponse', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCurrentPosition.mockResolvedValue({
      status: 'success',
      position: { lat: 37.5665, lng: 126.978, accuracy: 25 },
    });
    mockSaveImageToLibrary.mockResolvedValue();
    mockGetRefreshToken.mockResolvedValue(null);
    mockSetRefreshToken.mockResolvedValue(undefined);
    mockClearRefreshToken.mockResolvedValue(undefined);
    mockStartSocialLogin.mockResolvedValue({ status: 'cancelled' });
  });

  it('요청을 처리하고 같은 식별자로 응답한다', async () => {
    const response = await createBridgeResponse(createRequest());

    expect(response.id).toBe('request-01');
    expect(response.type).toBe('ping');
    expect(response.ok).toBe(true);
  });

  it('처리할 수 없는 요청이면 실패로 응답한다', async () => {
    const response = await createBridgeResponse(
      createRequest({ type: 'unknown' as BridgeRequest['type'] })
    );

    expect(response.ok).toBe(false);
    expect(response).toHaveProperty('error.message', expect.stringContaining('처리할 수 없는'));
  });

  it('네이티브 현재 위치를 조회해 웹 좌표 형식으로 반환한다', async () => {
    const request: BridgeRequest<'getCurrentPosition'> = {
      kind: BRIDGE_MESSAGE_KIND.REQUEST,
      id: 'request-location-01',
      type: 'getCurrentPosition',
      payload: {},
    };

    const response = await createBridgeResponse(request);

    expect(response).toEqual({
      kind: BRIDGE_MESSAGE_KIND.RESPONSE,
      id: request.id,
      type: request.type,
      ok: true,
      result: {
        status: 'success',
        position: { lat: 37.5665, lng: 126.978, accuracy: 25 },
      },
    });
  });

  it('네이티브 위치 권한이 거부되면 권한 거부 상태를 반환한다', async () => {
    mockGetCurrentPosition.mockResolvedValue({ status: 'permissionDenied' });
    const request: BridgeRequest<'getCurrentPosition'> = {
      kind: BRIDGE_MESSAGE_KIND.REQUEST,
      id: 'request-location-02',
      type: 'getCurrentPosition',
      payload: {},
    };

    const response = await createBridgeResponse(request);

    expect(response).toEqual({
      kind: BRIDGE_MESSAGE_KIND.RESPONSE,
      id: request.id,
      type: request.type,
      ok: true,
      result: { status: 'permissionDenied' },
    });
  });

  it('기기 위치 서비스가 꺼져 있으면 비활성 상태를 반환한다', async () => {
    mockGetCurrentPosition.mockResolvedValue({ status: 'servicesDisabled' });
    const request: BridgeRequest<'getCurrentPosition'> = {
      kind: BRIDGE_MESSAGE_KIND.REQUEST,
      id: 'request-location-03',
      type: 'getCurrentPosition',
      payload: {},
    };

    const response = await createBridgeResponse(request);

    expect(response).toEqual({
      kind: BRIDGE_MESSAGE_KIND.RESPONSE,
      id: request.id,
      type: request.type,
      ok: true,
      result: { status: 'servicesDisabled' },
    });
  });

  it('이미지 저장 요청을 처리하고 성공 응답을 반환한다', async () => {
    const request: BridgeRequest<'saveImage'> = {
      kind: BRIDGE_MESSAGE_KIND.REQUEST,
      id: 'request-02',
      type: 'saveImage',
      payload: { base64: 'base64-image', fileName: '리포트.png' },
    };

    const response = await createBridgeResponse(request);

    expect(mockSaveImageToLibrary).toHaveBeenCalledWith('base64-image', '리포트.png');
    expect(response).toEqual({
      kind: BRIDGE_MESSAGE_KIND.RESPONSE,
      id: request.id,
      type: request.type,
      ok: true,
      result: { saved: true },
    });
  });

  it('이미지 저장 실패 사유를 웹에 전달한다', async () => {
    mockSaveImageToLibrary.mockRejectedValue(new Error('사진 저장 권한이 필요합니다'));
    const request: BridgeRequest<'saveImage'> = {
      kind: BRIDGE_MESSAGE_KIND.REQUEST,
      id: 'request-03',
      type: 'saveImage',
      payload: { base64: 'base64-image', fileName: '리포트.png' },
    };

    const response = await createBridgeResponse(request);

    expect(response).toEqual({
      kind: BRIDGE_MESSAGE_KIND.RESPONSE,
      id: request.id,
      type: request.type,
      ok: false,
      error: { message: '사진 저장 권한이 필요합니다' },
    });
  });

  it('영수증 촬영 요청을 처리하고 카메라 화면이 열렸다는 응답을 전달한다', async () => {
    mockOpenReceiptCamera.mockResolvedValue({ opened: true });
    const request: BridgeRequest<'captureReceipt'> = {
      kind: BRIDGE_MESSAGE_KIND.REQUEST,
      id: 'request-04',
      type: 'captureReceipt',
      payload: {},
    };

    const response = await createBridgeResponse(request);

    expect(response).toEqual({
      kind: BRIDGE_MESSAGE_KIND.RESPONSE,
      id: request.id,
      type: request.type,
      ok: true,
      result: { opened: true },
    });
  });

  it('카메라 권한이 없으면 촬영 요청을 실패로 응답한다', async () => {
    mockOpenReceiptCamera.mockRejectedValue(new Error('카메라 권한이 필요합니다'));
    const request: BridgeRequest<'captureReceipt'> = {
      kind: BRIDGE_MESSAGE_KIND.REQUEST,
      id: 'request-06',
      type: 'captureReceipt',
      payload: {},
    };

    const response = await createBridgeResponse(request);

    expect(response).toEqual({
      kind: BRIDGE_MESSAGE_KIND.RESPONSE,
      id: request.id,
      type: request.type,
      ok: false,
      error: { message: '카메라 권한이 필요합니다' },
    });
  });

  it('네이티브 보안 저장소에서 Refresh Token을 조회한다', async () => {
    mockGetRefreshToken.mockResolvedValue('native-refresh-token');
    const request: BridgeRequest<'getRefreshToken'> = {
      kind: BRIDGE_MESSAGE_KIND.REQUEST,
      id: 'request-auth-01',
      type: 'getRefreshToken',
      payload: {},
    };

    const response = await createBridgeResponse(request);

    expect(response).toEqual({
      kind: BRIDGE_MESSAGE_KIND.RESPONSE,
      id: request.id,
      type: request.type,
      ok: true,
      result: { refreshToken: 'native-refresh-token' },
    });
  });

  it('외부 OAuth를 시작하고 loginCode를 웹에 반환한다', async () => {
    mockStartSocialLogin.mockResolvedValue({ status: 'success', loginCode: 'login-code' });
    const request: BridgeRequest<'startSocialLogin'> = {
      kind: BRIDGE_MESSAGE_KIND.REQUEST,
      id: 'request-oauth-01',
      type: 'startSocialLogin',
      payload: { provider: 'kakao', codeChallenge: 'a'.repeat(43) },
    };

    const response = await createBridgeResponse(request);

    expect(mockStartSocialLogin).toHaveBeenCalledWith('kakao', 'a'.repeat(43));
    expect(response).toEqual({
      kind: BRIDGE_MESSAGE_KIND.RESPONSE,
      id: request.id,
      type: request.type,
      ok: true,
      result: { status: 'success', loginCode: 'login-code' },
    });
  });

  it.each([{ status: 'cancelled' } as const, { status: 'error', error: 'invalid_state' } as const])(
    '외부 OAuth의 $status 결과를 같은 요청의 응답으로 반환한다',
    async (result) => {
      mockStartSocialLogin.mockResolvedValue(result);
      const request: BridgeRequest<'startSocialLogin'> = {
        kind: BRIDGE_MESSAGE_KIND.REQUEST,
        id: 'request-oauth-02',
        type: 'startSocialLogin',
        payload: { provider: 'google', codeChallenge: 'a'.repeat(43) },
      };

      const response = await createBridgeResponse(request);

      expect(response).toEqual({
        kind: BRIDGE_MESSAGE_KIND.RESPONSE,
        id: request.id,
        type: request.type,
        ok: true,
        result,
      });
    }
  );

  it('외부 OAuth 실행 실패를 같은 요청의 실패 응답으로 반환한다', async () => {
    mockStartSocialLogin.mockRejectedValue(new Error('외부 인증 화면을 열지 못했습니다.'));
    const request: BridgeRequest<'startSocialLogin'> = {
      kind: BRIDGE_MESSAGE_KIND.REQUEST,
      id: 'request-oauth-03',
      type: 'startSocialLogin',
      payload: { provider: 'kakao', codeChallenge: 'a'.repeat(43) },
    };

    const response = await createBridgeResponse(request);

    expect(response).toEqual({
      kind: BRIDGE_MESSAGE_KIND.RESPONSE,
      id: request.id,
      type: request.type,
      ok: false,
      error: { message: '외부 인증 화면을 열지 못했습니다.' },
    });
  });

  it('Refresh Token을 네이티브 보안 저장소에 저장한다', async () => {
    const request: BridgeRequest<'saveRefreshToken'> = {
      kind: BRIDGE_MESSAGE_KIND.REQUEST,
      id: 'request-auth-02',
      type: 'saveRefreshToken',
      payload: { refreshToken: 'rotated-refresh-token' },
    };

    const response = await createBridgeResponse(request);

    expect(mockSetRefreshToken).toHaveBeenCalledWith('rotated-refresh-token');
    expect(response).toEqual({
      kind: BRIDGE_MESSAGE_KIND.RESPONSE,
      id: request.id,
      type: request.type,
      ok: true,
      result: { saved: true },
    });
  });

  it('네이티브 보안 저장소의 Refresh Token을 제거한다', async () => {
    const request: BridgeRequest<'clearRefreshToken'> = {
      kind: BRIDGE_MESSAGE_KIND.REQUEST,
      id: 'request-auth-03',
      type: 'clearRefreshToken',
      payload: {},
    };

    const response = await createBridgeResponse(request);

    expect(mockClearRefreshToken).toHaveBeenCalledTimes(1);
    expect(response).toEqual({
      kind: BRIDGE_MESSAGE_KIND.RESPONSE,
      id: request.id,
      type: request.type,
      ok: true,
      result: { cleared: true },
    });
  });
});
