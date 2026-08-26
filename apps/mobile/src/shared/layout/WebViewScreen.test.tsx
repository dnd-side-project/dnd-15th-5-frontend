import { render } from '@testing-library/react-native';
import { act, createRef } from 'react';
import { WebView } from 'react-native-webview';

import { WebViewScreen } from './WebViewScreen';

const createDefaultProps = () => ({
  uri: 'https://chapchap.example.com/home',
  webViewRef: createRef<WebView>(),
  webViewTestID: 'test-webview',
  safeAreaTestID: 'test-safe-area',
  missingConfiguration: {
    title: '웹 주소가 없습니다',
    descriptions: ['환경 변수를 확인해주세요.'],
  },
  loadErrorTitle: '웹 화면을 불러오지 못했습니다',
  loadErrorDescriptions: ['https://chapchap.example.com'],
  allowsBackForwardNavigationGestures: false,
});

describe('<WebViewScreen />', () => {
  it('공통 WebView의 스크롤·확대·단일 창 설정을 적용한다', async () => {
    const onShouldStartLoadWithRequest = jest.fn(() => true);
    const { getByTestId } = await render(
      <WebViewScreen
        {...createDefaultProps()}
        safeAreaMode="none"
        onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
      />
    );

    expect(getByTestId('test-safe-area').props.edges).toEqual({
      top: 'off',
      right: 'off',
      bottom: 'off',
      left: 'off',
    });
    expect(getByTestId('test-webview')).toHaveStyle({ height: '100%', width: '100%' });
    expect(getByTestId('test-webview')).toHaveProp('nestedScrollEnabled', true);
    expect(getByTestId('test-webview')).toHaveProp('setSupportMultipleWindows', false);
    expect(getByTestId('test-webview')).toHaveProp('setBuiltInZoomControls', false);
    expect(getByTestId('test-webview').props.injectedJavaScript).toContain('user-scalable=no');
    expect(getByTestId('test-webview').props.onShouldStartLoadWithRequest).toBe(
      onShouldStartLoadWithRequest
    );
  });

  it('하단만 edge-to-edge이면 나머지 Safe Area를 유지한다', async () => {
    const { getByTestId } = await render(
      <WebViewScreen {...createDefaultProps()} safeAreaMode="except-bottom" />
    );

    expect(getByTestId('test-safe-area').props.edges).toEqual({
      top: 'additive',
      right: 'additive',
      bottom: 'off',
      left: 'additive',
    });
    expect(getByTestId('test-webview')).toHaveStyle({ height: '100%', width: '100%' });
  });

  it('웹 주소가 없으면 설정 안내를 표시한다', async () => {
    const { getByText, queryByTestId } = await render(
      <WebViewScreen {...createDefaultProps()} uri={null} />
    );

    getByText('웹 주소가 없습니다');
    getByText('환경 변수를 확인해주세요.');
    expect(queryByTestId('test-webview')).toBeNull();
  });

  it('WebView 로드 오류가 발생하면 주소와 오류 원인을 안내한다', async () => {
    const { getByTestId, getByText } = await render(<WebViewScreen {...createDefaultProps()} />);

    act(() => {
      getByTestId('test-webview').props.onError({
        nativeEvent: { description: '네트워크 연결 실패' },
      });
    });

    getByText('웹 화면을 불러오지 못했습니다');
    getByText('https://chapchap.example.com');
    getByText('네트워크 연결 실패');
  });
});
