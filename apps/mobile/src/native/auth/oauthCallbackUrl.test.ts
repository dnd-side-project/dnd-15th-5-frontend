import * as Linking from 'expo-linking';

import { createOAuthCallbackUrl, isOAuthCallbackUrl } from './oauthCallbackUrl';

jest.mock('expo-linking', () => ({ createURL: jest.fn() }));

const mockCreateUrl = jest.mocked(Linking.createURL);

describe('oauthCallbackUrl', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateUrl.mockReturnValue('chapchap://oauth/callback');
  });

  it('앱 scheme을 사용하는 callback URL을 생성한다', () => {
    expect(createOAuthCallbackUrl()).toBe('chapchap://oauth/callback');
    expect(mockCreateUrl).toHaveBeenCalledWith('/oauth/callback');
  });

  it('두·세 슬래시와 query 차이에 관계없이 같은 callback 경로를 허용한다', () => {
    expect(isOAuthCallbackUrl('chapchap://oauth/callback?loginCode=login-code')).toBe(true);
    expect(isOAuthCallbackUrl('chapchap:///oauth/callback?error=access_denied')).toBe(true);
    expect(isOAuthCallbackUrl('chapchap://evil/oauth/callback?loginCode=login-code')).toBe(false);
    expect(isOAuthCallbackUrl('chapchap:///other?loginCode=login-code')).toBe(false);
    expect(isOAuthCallbackUrl('https://chapchap.example.com/auth/callback')).toBe(false);
  });
});
