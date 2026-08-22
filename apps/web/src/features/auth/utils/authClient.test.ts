import { StartClient } from '@/features/auth/apis/dto';
import { isNativeApp } from '@/shared/lib/bridge';

import { getAuthClient } from './authClient';

jest.mock('@/shared/lib/bridge', () => ({
  isNativeApp: jest.fn(),
}));

const mockIsNativeApp = jest.mocked(isNativeApp);

describe('getAuthClient', () => {
  it('일반 브라우저에서는 WEB을 반환한다', () => {
    mockIsNativeApp.mockReturnValue(false);

    expect(getAuthClient()).toBe(StartClient.WEB);
  });

  it('앱 WebView에서는 APP을 반환한다', () => {
    mockIsNativeApp.mockReturnValue(true);

    expect(getAuthClient()).toBe(StartClient.APP);
  });
});
