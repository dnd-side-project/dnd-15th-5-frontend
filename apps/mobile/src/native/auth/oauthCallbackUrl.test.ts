import * as Linking from 'expo-linking';

import { createOAuthCallbackUrl, isOAuthCallbackUrl } from './oauthCallbackUrl';

jest.mock('expo-linking', () => ({ createURL: jest.fn() }));

const mockCreateUrl = jest.mocked(Linking.createURL);

describe('oauthCallbackUrl', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateUrl.mockReturnValue('chapchap:///auth/callback');
  });

  it('앱 scheme을 사용하는 callback URL을 생성한다', () => {
    expect(createOAuthCallbackUrl()).toBe('chapchap:///auth/callback');
    expect(mockCreateUrl).toHaveBeenCalledWith('/auth/callback');
  });

  it('query와 관계없이 같은 scheme·host·path의 callback만 허용한다', () => {
    expect(isOAuthCallbackUrl('chapchap:///auth/callback?loginCode=login-code')).toBe(true);
    expect(isOAuthCallbackUrl('chapchap:///auth/callback?error=access_denied')).toBe(true);
    expect(isOAuthCallbackUrl('chapchap://evil/auth/callback?loginCode=login-code')).toBe(false);
    expect(isOAuthCallbackUrl('chapchap:///other?loginCode=login-code')).toBe(false);
    expect(isOAuthCallbackUrl('https://chapchap.example.com/auth/callback')).toBe(false);
  });
});
