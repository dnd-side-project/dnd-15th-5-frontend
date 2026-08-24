import { isOAuthCallbackUrl } from '@/native/auth';

import { redirectSystemPath } from '../src/app/+native-intent';

jest.mock('@/native/auth', () => ({ isOAuthCallbackUrl: jest.fn() }));

const mockIsOAuthCallbackUrl = jest.mocked(isOAuthCallbackUrl);

describe('redirectSystemPath', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('OAuth callback은 WebBrowser만 처리하도록 Expo Router 이동을 막는다', () => {
    mockIsOAuthCallbackUrl.mockReturnValue(true);

    expect(
      redirectSystemPath({ path: 'chapchap://oauth/callback?loginCode=code', initial: false })
    ).toBeNull();
  });

  it('일반 딥링크는 기존 경로를 유지한다', () => {
    mockIsOAuthCallbackUrl.mockReturnValue(false);

    expect(redirectSystemPath({ path: 'chapchap:///receipt-confirm', initial: false })).toBe(
      'chapchap:///receipt-confirm'
    );
  });
});
