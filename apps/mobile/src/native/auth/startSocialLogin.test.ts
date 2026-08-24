import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

import { startSocialLogin } from './startSocialLogin';

jest.mock('expo-linking', () => ({ createURL: jest.fn() }));
jest.mock('expo-web-browser', () => ({
  openAuthSessionAsync: jest.fn(),
  WebBrowserResultType: {
    CANCEL: 'cancel',
    DISMISS: 'dismiss',
  },
}));

const mockCreateUrl = jest.mocked(Linking.createURL);
const mockOpenAuthSessionAsync = jest.mocked(WebBrowser.openAuthSessionAsync);

describe('startSocialLogin', () => {
  const originalApiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.EXPO_PUBLIC_API_BASE_URL = 'https://chapchap.kr/api';
    mockCreateUrl.mockReturnValue('chapchap://oauth/callback');
  });

  afterAll(() => {
    process.env.EXPO_PUBLIC_API_BASE_URL = originalApiBaseUrl;
  });

  it('외부 인증 세션에서 받은 loginCode를 반환한다', async () => {
    mockOpenAuthSessionAsync.mockResolvedValue({
      type: 'success',
      url: 'chapchap://oauth/callback?loginCode=login-code',
    });

    await expect(startSocialLogin('kakao', 'a'.repeat(43))).resolves.toEqual({
      status: 'success',
      loginCode: 'login-code',
    });
    expect(mockCreateUrl).toHaveBeenCalledWith('/oauth/callback');
    expect(mockOpenAuthSessionAsync).toHaveBeenCalledWith(
      `https://chapchap.kr/api/oauth/kakao/start?client=APP&codeChallenge=${'a'.repeat(43)}`,
      'chapchap://oauth/callback'
    );
  });

  it('API 주소가 슬래시로 끝나도 OAuth 경로를 유지한다', async () => {
    process.env.EXPO_PUBLIC_API_BASE_URL = 'https://chapchap.kr/api/';
    mockOpenAuthSessionAsync.mockResolvedValue({ type: WebBrowser.WebBrowserResultType.CANCEL });

    await startSocialLogin('kakao', 'a'.repeat(43));

    expect(mockOpenAuthSessionAsync).toHaveBeenCalledWith(
      `https://chapchap.kr/api/oauth/kakao/start?client=APP&codeChallenge=${'a'.repeat(43)}`,
      'chapchap://oauth/callback'
    );
  });

  it.each([WebBrowser.WebBrowserResultType.CANCEL, WebBrowser.WebBrowserResultType.DISMISS])(
    '외부 인증 세션의 %s 결과를 사용자 취소로 반환한다',
    async (type) => {
      mockOpenAuthSessionAsync.mockResolvedValue({ type });

      await expect(startSocialLogin('kakao', 'a'.repeat(43))).resolves.toEqual({
        status: 'cancelled',
      });
    }
  );

  it('callback의 제공자 오류를 보존한다', async () => {
    mockOpenAuthSessionAsync.mockResolvedValue({
      type: 'success',
      url: 'chapchap://oauth/callback?error=invalid_state',
    });

    await expect(startSocialLogin('kakao', 'a'.repeat(43))).resolves.toEqual({
      status: 'error',
      error: 'invalid_state',
    });
  });

  it('callback에 loginCode가 없으면 오류로 반환한다', async () => {
    mockOpenAuthSessionAsync.mockResolvedValue({
      type: 'success',
      url: 'chapchap://oauth/callback',
    });

    await expect(startSocialLogin('google', 'a'.repeat(43))).resolves.toEqual({
      status: 'error',
      error: 'missing_login_code',
    });
  });

  it('등록한 callback과 다른 URL은 loginCode가 있어도 거부한다', async () => {
    mockOpenAuthSessionAsync.mockResolvedValue({
      type: 'success',
      url: 'chapchap://evil/oauth/callback?loginCode=login-code',
    });

    await expect(startSocialLogin('kakao', 'a'.repeat(43))).resolves.toEqual({
      status: 'error',
      error: 'invalid_callback_url',
    });
  });

  it('외부 인증 세션을 열지 못하면 오류를 그대로 전달한다', async () => {
    mockOpenAuthSessionAsync.mockRejectedValue(new Error('Browser unavailable'));

    await expect(startSocialLogin('kakao', 'a'.repeat(43))).rejects.toThrow('Browser unavailable');
  });
});
