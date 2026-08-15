import { act, render } from '@testing-library/react-native';

import HomeScreen from './HomeScreen';

const mockCreateBridgeResponse = jest.fn();

jest.mock('@/bridge', () => ({
  createBridgeResponse: (message: unknown) => mockCreateBridgeResponse(message),
  createResponseScript: jest.fn(() => 'true;'),
  getUrlOrigin: (url: string) => new URL(url).origin,
  isTrustedBridgeUrl: (url: string, trustedOrigin: string) => new URL(url).origin === trustedOrigin,
}));

describe('<HomeScreen />', () => {
  const originalWebUrl = process.env.EXPO_PUBLIC_WEB_URL;

  beforeEach(() => {
    mockCreateBridgeResponse.mockReset();
    mockCreateBridgeResponse.mockResolvedValue({});
  });

  afterEach(() => {
    process.env.EXPO_PUBLIC_WEB_URL = originalWebUrl;
  });

  it('웹 주소가 설정되지 않으면 안내 문구를 보여준다', async () => {
    delete process.env.EXPO_PUBLIC_WEB_URL;

    const { getByText } = await render(<HomeScreen />);

    getByText('웹 주소가 설정되지 않았습니다');
  });

  it('웹 주소가 설정되면 웹 화면을 바로 띄운다', async () => {
    process.env.EXPO_PUBLIC_WEB_URL = 'http://192.168.0.2:5173';

    const { getByTestId } = await render(<HomeScreen />);

    expect(getByTestId('home-webview')).toBeTruthy();
  });

  it('설정된 웹 주소와 다른 origin의 브릿지 요청은 처리하지 않는다', async () => {
    process.env.EXPO_PUBLIC_WEB_URL = 'https://chapchap.example.com';
    const { getByTestId } = await render(<HomeScreen />);

    await act(async () => {
      await getByTestId('home-webview').props.onMessage({
        nativeEvent: {
          data: JSON.stringify({ kind: 'request', id: 'request-01', type: 'ping', payload: {} }),
          url: 'https://evil.example.com',
        },
      });
    });

    expect(mockCreateBridgeResponse).not.toHaveBeenCalled();
  });
});
