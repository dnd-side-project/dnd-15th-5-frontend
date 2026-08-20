import { act, render } from '@testing-library/react-native';

import HomeScreen from './HomeScreen';

const mockCreateBridgeResponse = jest.fn();
const safeAreaEdges = {
  top: 'additive',
  right: 'additive',
  bottom: 'additive',
  left: 'additive',
};

const edgeToEdgeEdges = {
  top: 'off',
  right: 'off',
  bottom: 'off',
  left: 'off',
};

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

  it('웹 주소가 설정되면 기록 방법 선택 화면을 최초 경로로 띄운다', async () => {
    process.env.EXPO_PUBLIC_WEB_URL = 'http://192.168.0.2:5173/record/receipt/camera';

    const { getByTestId } = await render(<HomeScreen />);

    expect(getByTestId('home-webview')).toHaveProp('source', {
      uri: 'http://192.168.0.2:5173/record',
    });
    expect(getByTestId('home-webview')).toHaveProp('automaticallyAdjustContentInsets', false);
    expect(getByTestId('home-webview')).toHaveProp('contentInsetAdjustmentBehavior', 'never');
    expect(getByTestId('home-webview')).toHaveProp('allowsBackForwardNavigationGestures', true);
  });

  it('지도 홈만 edge-to-edge로 표시하고 다른 웹 경로에서는 Safe Area를 유지한다', async () => {
    process.env.EXPO_PUBLIC_WEB_URL = 'http://192.168.0.2:5173';
    const { getByTestId } = await render(<HomeScreen />);

    await act(async () => {
      await getByTestId('home-webview').props.onMessage({
        nativeEvent: {
          data: JSON.stringify({
            kind: 'event',
            type: 'routeChanged',
            payload: { pathname: '/home' },
          }),
          url: 'http://192.168.0.2:5173/home',
        },
      });
    });

    expect(getByTestId('home-safe-area').props.edges).toEqual(edgeToEdgeEdges);
    expect(getByTestId('home-webview')).toHaveProp('allowsBackForwardNavigationGestures', false);

    await act(async () => {
      await getByTestId('home-webview').props.onMessage({
        nativeEvent: {
          data: JSON.stringify({
            kind: 'event',
            type: 'routeChanged',
            payload: { pathname: '/report' },
          }),
          url: 'http://192.168.0.2:5173/report',
        },
      });
    });

    expect(getByTestId('home-safe-area').props.edges).toEqual(safeAreaEdges);
    expect(getByTestId('home-webview')).toHaveProp('allowsBackForwardNavigationGestures', true);
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
