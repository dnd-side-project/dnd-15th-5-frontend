import { act, render } from '@testing-library/react-native';
import { BackHandler, Linking } from 'react-native';

import { requestWebViewNavigation } from '@/bridge/webViewNavigation';

import HomeScreen from './HomeScreen';

const mockCreateBridgeResponse = jest.fn();
const mockCreateResponseScript = jest.fn((_response: unknown, _trustedOrigin: string) => 'true;');
const removeBackHandler = jest.fn();
type HardwareBackHandler = Parameters<typeof BackHandler.addEventListener>[1];
let hardwareBackHandler: HardwareBackHandler | undefined;
const hardwareBackPressEvent = { type: 'hardwareBackPress', timeStamp: 0 };
const edgeToEdgeEdges = {
  top: 'off',
  right: 'off',
  bottom: 'off',
  left: 'off',
};

const bottomEdgeToEdgeEdges = {
  top: 'additive',
  right: 'additive',
  bottom: 'off',
  left: 'additive',
};

jest.mock('react-native-webview', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');
  const goBack = jest.fn();
  const injectJavaScript = jest.fn();
  const reload = jest.fn();
  const WebView = React.forwardRef(function MockWebView(props, ref) {
    React.useImperativeHandle(ref, () => ({
      goBack,
      injectJavaScript,
      reload,
    }));

    return React.createElement(View, props);
  });

  return { WebView, __mockGoBack: goBack, __mockInjectJavaScript: injectJavaScript };
});

const { __mockGoBack: mockGoBack, __mockInjectJavaScript: mockInjectJavaScript } = jest.requireMock(
  'react-native-webview'
) as { __mockGoBack: jest.Mock; __mockInjectJavaScript: jest.Mock };

jest.mock('@/bridge', () => ({
  createBridgeResponse: (message: unknown) => mockCreateBridgeResponse(message),
  createResponseScript: (response: unknown, trustedOrigin: string) =>
    mockCreateResponseScript(response, trustedOrigin),
  getTrustedInternalUrl: (path: string, trustedOrigin: string) => {
    const url = new URL(path, trustedOrigin);
    return url.origin === trustedOrigin ? url.toString() : null;
  },
  getUrlOrigin: (url: string) => new URL(url).origin,
  isTrustedBridgeUrl: (url: string, trustedOrigin: string) => new URL(url).origin === trustedOrigin,
}));

describe('<HomeScreen />', () => {
  const originalWebUrl = process.env.EXPO_PUBLIC_WEB_URL;

  beforeEach(() => {
    hardwareBackHandler = undefined;
    mockGoBack.mockReset();
    mockInjectJavaScript.mockReset();
    removeBackHandler.mockReset();
    mockCreateBridgeResponse.mockReset();
    mockCreateBridgeResponse.mockResolvedValue({});
    mockCreateResponseScript.mockClear();
    jest.spyOn(BackHandler, 'addEventListener').mockImplementation((_eventName, handler) => {
      hardwareBackHandler = handler;
      return { remove: removeBackHandler };
    });
    jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    process.env.EXPO_PUBLIC_WEB_URL = originalWebUrl;
  });

  it('웹 주소가 설정되지 않으면 안내 문구를 보여준다', async () => {
    delete process.env.EXPO_PUBLIC_WEB_URL;

    const { getByText } = await render(<HomeScreen />);

    getByText('웹 주소가 설정되지 않았습니다');
  });

  it('웹 주소가 설정되면 로그인 진입점인 루트 경로를 최초로 띄운다', async () => {
    process.env.EXPO_PUBLIC_WEB_URL = 'http://192.168.0.2:5173/record/receipt/camera';

    const { getByTestId } = await render(<HomeScreen />);

    expect(getByTestId('home-webview')).toHaveProp('source', {
      uri: 'http://192.168.0.2:5173/',
    });
    expect(getByTestId('home-safe-area').props.edges).toEqual(bottomEdgeToEdgeEdges);
    expect(getByTestId('home-webview')).toHaveProp('automaticallyAdjustContentInsets', false);
    expect(getByTestId('home-webview')).toHaveProp('contentInsetAdjustmentBehavior', 'never');
    expect(getByTestId('home-webview')).toHaveProp('allowsBackForwardNavigationGestures', true);
    expect(getByTestId('home-webview')).toHaveProp('setSupportMultipleWindows', false);
  });

  it('지도 홈은 전체 화면, 다른 웹 경로는 하단 배경만 edge-to-edge로 표시한다', async () => {
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

    expect(getByTestId('home-safe-area').props.edges).toEqual(bottomEdgeToEdgeEdges);
    expect(getByTestId('home-webview')).toHaveProp('allowsBackForwardNavigationGestures', true);

    await act(async () => {
      await getByTestId('home-webview').props.onMessage({
        nativeEvent: {
          data: JSON.stringify({
            kind: 'event',
            type: 'routeChanged',
            payload: { pathname: '/my-page' },
          }),
          url: 'http://192.168.0.2:5173/my-page',
        },
      });
    });

    expect(getByTestId('home-safe-area').props.edges).toEqual(bottomEdgeToEdgeEdges);
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

  it('지도에서 요청한 현재 위치를 네이티브 브릿지로 처리해 WebView에 응답한다', async () => {
    process.env.EXPO_PUBLIC_WEB_URL = 'https://chapchap.example.com';
    const bridgeResponse = {
      kind: 'response',
      id: 'position-01',
      type: 'getCurrentPosition',
      ok: true,
      result: { latitude: 37.5665, longitude: 126.978 },
    };
    mockCreateBridgeResponse.mockResolvedValue(bridgeResponse);
    const { getByTestId } = await render(<HomeScreen />);

    await act(async () => {
      await getByTestId('home-webview').props.onMessage({
        nativeEvent: {
          data: JSON.stringify({
            kind: 'request',
            id: 'position-01',
            type: 'getCurrentPosition',
            payload: {},
          }),
          url: 'https://chapchap.example.com/home',
        },
      });
    });

    expect(mockCreateBridgeResponse).toHaveBeenCalledWith({
      kind: 'request',
      id: 'position-01',
      type: 'getCurrentPosition',
      payload: {},
    });
    expect(mockCreateResponseScript).toHaveBeenCalledWith(
      bridgeResponse,
      'https://chapchap.example.com'
    );
    expect(mockInjectJavaScript).toHaveBeenCalledWith('true;');
  });

  it('같은 origin의 웹 경로는 WebView에서 열고 외부 지도 링크는 기기로 전달한다', async () => {
    process.env.EXPO_PUBLIC_WEB_URL = 'https://chapchap.example.com';
    const { getByTestId } = await render(<HomeScreen />);
    const shouldStartLoad = getByTestId('home-webview').props.onShouldStartLoadWithRequest;
    const googleMapsUrl = 'https://www.google.com/maps/search/?api=1&query=투썸플레이스';

    expect(shouldStartLoad({ url: 'https://chapchap.example.com/home/shop/101' })).toBe(true);
    expect(shouldStartLoad({ url: googleMapsUrl })).toBe(false);
    expect(Linking.openURL).toHaveBeenCalledWith(googleMapsUrl);
  });

  it('네이티브 기록 완료 요청을 받으면 메인 WebView를 지도 홈으로 새로 이동한다', async () => {
    process.env.EXPO_PUBLIC_WEB_URL = 'https://chapchap.example.com';
    await render(<HomeScreen />);

    await act(async () => {
      requestWebViewNavigation('/home');
    });

    expect(mockInjectJavaScript).toHaveBeenCalledWith(
      'window.location.replace("https://chapchap.example.com/home"); true;'
    );
  });

  it('외부 origin으로 향하는 네이티브 내부 이동 요청은 무시한다', async () => {
    process.env.EXPO_PUBLIC_WEB_URL = 'https://chapchap.example.com';
    await render(<HomeScreen />);

    await act(async () => {
      requestWebViewNavigation('https://evil.example.com');
    });

    expect(mockInjectJavaScript).not.toHaveBeenCalled();
  });

  it('Android 뒤로가기는 실제 WebView 기록이 있을 때만 WebView에서 처리한다', async () => {
    process.env.EXPO_PUBLIC_WEB_URL = 'https://chapchap.example.com';
    const { getByTestId } = await render(<HomeScreen />);

    expect(hardwareBackHandler?.(hardwareBackPressEvent)).toBe(false);
    expect(mockGoBack).not.toHaveBeenCalled();

    await act(async () => {
      await getByTestId('home-webview').props.onMessage({
        nativeEvent: {
          data: JSON.stringify({
            kind: 'event',
            type: 'routeChanged',
            payload: { pathname: '/home/shop/101' },
          }),
          url: 'https://chapchap.example.com/home/shop/101',
        },
      });
    });

    expect(hardwareBackHandler?.(hardwareBackPressEvent)).toBe(false);
    expect(mockGoBack).not.toHaveBeenCalled();

    await act(async () => {
      getByTestId('home-webview').props.onNavigationStateChange({
        canGoBack: true,
        url: 'https://chapchap.example.com/home/shop/101',
      });
    });

    expect(hardwareBackHandler?.(hardwareBackPressEvent)).toBe(true);
    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });
});
