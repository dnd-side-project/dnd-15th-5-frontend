import {
  clearRefreshToken,
  getRefreshToken,
  setRefreshToken,
} from '@/native/auth/authTokenStorage';

import { clearAccessToken } from './accessTokenMemory';
import { authenticatedRequest, NativeApiError } from './authenticatedRequest';

jest.mock('@/native/auth/authTokenStorage', () => ({
  clearRefreshToken: jest.fn(),
  getRefreshToken: jest.fn(),
  setRefreshToken: jest.fn(),
}));

const mockClearRefreshToken = jest.mocked(clearRefreshToken);
const mockGetRefreshToken = jest.mocked(getRefreshToken);
const mockSetRefreshToken = jest.mocked(setRefreshToken);
const mockFetch = jest.fn();
const originalFetch = globalThis.fetch;

const createResponse = (status: number, body: unknown) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(body),
  }) as unknown as Response;

describe('authenticatedRequest', () => {
  const originalApiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

  beforeAll(() => {
    globalThis.fetch = mockFetch;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    clearAccessToken();
    process.env.EXPO_PUBLIC_API_BASE_URL = 'https://chapchap.example.com/api';
    mockGetRefreshToken.mockResolvedValue('refresh-token');
    mockSetRefreshToken.mockResolvedValue(undefined);
    mockClearRefreshToken.mockResolvedValue(undefined);
  });

  afterAll(() => {
    globalThis.fetch = originalFetch;

    if (originalApiBaseUrl === undefined) {
      delete process.env.EXPO_PUBLIC_API_BASE_URL;
      return;
    }

    process.env.EXPO_PUBLIC_API_BASE_URL = originalApiBaseUrl;
  });

  it('Refresh Token으로 Access Token을 발급한 뒤 인증 요청을 보낸다', async () => {
    mockFetch
      .mockResolvedValueOnce(
        createResponse(200, {
          data: { accessToken: 'access-token', refreshToken: 'rotated-refresh-token' },
        })
      )
      .mockResolvedValueOnce(createResponse(200, { data: { receiptImageId: 15 } }));

    await expect(
      authenticatedRequest<{ receiptImageId: number }>('/consumptions/receipt-ocr', {
        method: 'POST',
      })
    ).resolves.toEqual({ receiptImageId: 15 });

    expect(mockFetch).toHaveBeenNthCalledWith(
      1,
      'https://chapchap.example.com/api/auth/token/refresh',
      expect.objectContaining({ body: JSON.stringify({ refreshToken: 'refresh-token' }) })
    );
    expect(mockSetRefreshToken).toHaveBeenCalledWith('rotated-refresh-token');
    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      'https://chapchap.example.com/api/consumptions/receipt-ocr',
      expect.objectContaining({
        method: 'POST',
        headers: { Authorization: 'Bearer access-token' },
      })
    );
  });

  it('API 실패 시 서버 메시지와 상태 코드를 보존한다', async () => {
    mockFetch
      .mockResolvedValueOnce(
        createResponse(200, {
          data: { accessToken: 'access-token', refreshToken: 'rotated-refresh-token' },
        })
      )
      .mockResolvedValueOnce(
        createResponse(422, { code: 'CONSUMPTION008', message: '영수증 인식에 실패했습니다.' })
      );

    await expect(authenticatedRequest('/consumptions/receipt-ocr')).rejects.toEqual(
      expect.objectContaining<Partial<NativeApiError>>({
        message: '영수증 인식에 실패했습니다.',
        status: 422,
        code: 'CONSUMPTION008',
      })
    );
  });

  it('Refresh Token 재발급이 401로 거절되면 인증 정보를 지운다', async () => {
    mockFetch.mockResolvedValueOnce(createResponse(401, { message: '만료된 Refresh Token' }));

    await expect(authenticatedRequest('/consumptions/receipt-ocr')).rejects.toThrow(
      '만료된 Refresh Token'
    );

    expect(mockClearRefreshToken).toHaveBeenCalledTimes(1);
  });

  it('Refresh Token 재발급이 일시적인 서버 오류로 실패하면 인증 정보를 유지한다', async () => {
    mockFetch.mockResolvedValueOnce(createResponse(500, { message: '서버 오류' }));

    await expect(authenticatedRequest('/consumptions/receipt-ocr')).rejects.toThrow('서버 오류');

    expect(mockClearRefreshToken).not.toHaveBeenCalled();
  });

  it('Refresh Token 재발급이 네트워크 오류로 실패하면 인증 정보를 유지한다', async () => {
    mockFetch.mockRejectedValueOnce(new TypeError('Network request failed'));

    await expect(authenticatedRequest('/consumptions/receipt-ocr')).rejects.toThrow(
      'Network request failed'
    );

    expect(mockClearRefreshToken).not.toHaveBeenCalled();
  });
});
