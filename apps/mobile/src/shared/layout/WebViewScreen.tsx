import { useMemo, useState } from 'react';
import { ActivityIndicator, Platform, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

import type { RefObject } from 'react';
import type { Edge } from 'react-native-safe-area-context';
import type { WebViewProps } from 'react-native-webview';

type WebViewSafeAreaMode = 'all' | 'except-bottom' | 'none';

const WEB_VIEW_SAFE_AREA_EDGES: Edge[] = ['top', 'right', 'bottom', 'left'];
const WEB_VIEW_SAFE_AREA_EDGES_WITHOUT_BOTTOM: Edge[] = ['top', 'right', 'left'];
const WEB_VIEW_SAFE_AREA_EDGES_BY_MODE = {
  all: WEB_VIEW_SAFE_AREA_EDGES,
  'except-bottom': WEB_VIEW_SAFE_AREA_EDGES_WITHOUT_BOTTOM,
  none: [],
} satisfies Record<WebViewSafeAreaMode, Edge[]>;
const INSET_WEB_VIEW_HEIGHT = '99.9%';
/** iOS WebView에서 웹 문서 자체의 핀치 확대를 막는 viewport 설정입니다. */
const DISABLE_WEB_VIEW_ZOOM_SCRIPT = `
  (function () {
    var viewport = document.querySelector('meta[name="viewport"]');

    if (viewport) {
      viewport.setAttribute(
        'content',
        'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover'
      );
    }
  })();
  true;
`;

type GuideContent = {
  title: string;
  descriptions: string[];
};

type WebViewScreenProps = {
  uri: string | null;
  webViewRef: RefObject<WebView | null>;
  webViewTestID: string;
  safeAreaTestID: string;
  missingConfiguration: GuideContent;
  loadErrorTitle: string;
  loadErrorDescriptions?: string[];
  safeAreaMode?: WebViewSafeAreaMode;
  allowsBackForwardNavigationGestures: boolean;
  onMessage?: WebViewProps['onMessage'];
  onLoadStart?: WebViewProps['onLoadStart'];
  onNavigationStateChange?: WebViewProps['onNavigationStateChange'];
  onShouldStartLoadWithRequest?: WebViewProps['onShouldStartLoadWithRequest'];
};

function WebViewGuide({ title, descriptions }: GuideContent) {
  return (
    <View className="flex-1 items-center justify-center bg-neutral-00 px-6">
      <Text className="mb-2 font-pretendard-bold text-title-02-bold text-neutral-700">{title}</Text>
      {descriptions.map((description) => (
        <Text
          key={description}
          className="mt-1 text-center font-pretendard-regular text-body-02-regular text-neutral-600"
        >
          {description}
        </Text>
      ))}
    </View>
  );
}

/**
 * 모든 WebView 화면에 동일한 Safe Area, 로딩, 오류 복구 동작을 적용합니다.
 *
 * `uri`가 없으면 환경 설정 안내를, 로드 중에는 Spinner를, 로드에 실패하면 원인이 포함된 안내를
 * 표시합니다. 콘텐츠 프로세스가 종료되면 전달받은 `webViewRef`로 현재 문서를 다시 불러옵니다.
 *
 * iOS는 모든 WebView의 크기를 고정하고 웹의 PageFrame 또는 화면 자체에서 Safe Area를 처리합니다.
 * Android의 `safeAreaMode`는 전체 inset 적용(`all`), 하단만 edge-to-edge(`except-bottom`),
 * 전체 edge-to-edge(`none`) 중 하나를 선택합니다.
 * 앱 UI가 브라우저처럼 확대되지 않도록 iOS는 viewport 배율을, Android는 내장 줌을 제한합니다.
 *
 * @param props.uri - 로드할 웹 주소입니다. `null`이면 `missingConfiguration`을 표시합니다.
 * @param props.webViewRef - 뒤로 가기·브릿지 응답·프로세스 복구에 사용하는 WebView ref입니다.
 * @param props.safeAreaMode - Android에서 네이티브 Safe Area를 적용할 가장자리 범위입니다.
 */
export function WebViewScreen({
  uri,
  webViewRef,
  webViewTestID,
  safeAreaTestID,
  missingConfiguration,
  loadErrorTitle,
  loadErrorDescriptions = [],
  safeAreaMode = 'all',
  allowsBackForwardNavigationGestures,
  onMessage,
  onLoadStart,
  onNavigationStateChange,
  onShouldStartLoadWithRequest,
}: WebViewScreenProps) {
  const [loadErrorMessage, setLoadErrorMessage] = useState<string | null>(null);
  const effectiveSafeAreaMode = Platform.OS === 'ios' ? 'none' : safeAreaMode;
  const isEdgeToEdge = effectiveSafeAreaMode !== 'all';
  // NOTE: source 객체가 매 렌더마다 바뀌면 동일한 URL도 WebView가 다시 로드할 수 있다.
  const source = useMemo(() => (uri ? { uri } : undefined), [uri]);

  if (!source) {
    return <WebViewGuide {...missingConfiguration} />;
  }

  if (loadErrorMessage) {
    return (
      <WebViewGuide
        title={loadErrorTitle}
        descriptions={[...loadErrorDescriptions, loadErrorMessage]}
      />
    );
  }

  return (
    <View className="flex-1 bg-neutral-00">
      <SafeAreaView
        testID={safeAreaTestID}
        edges={WEB_VIEW_SAFE_AREA_EDGES_BY_MODE[effectiveSafeAreaMode]}
        style={{ flex: 1 }}
      >
        <WebView
          ref={webViewRef}
          testID={webViewTestID}
          // NOTE: Android inset 모드는 기존 높이를 유지합니다. iOS와 edge-to-edge 모드는
          // 화면 전환 중 크기가 변하거나 하단에 실선이 생기지 않도록 정확히 100%로 채웁니다.
          style={{
            height: isEdgeToEdge ? '100%' : INSET_WEB_VIEW_HEIGHT,
            width: '100%',
          }}
          source={source}
          automaticallyAdjustContentInsets={false}
          contentInsetAdjustmentBehavior="never"
          setBuiltInZoomControls={false}
          injectedJavaScript={DISABLE_WEB_VIEW_ZOOM_SCRIPT}
          allowsBackForwardNavigationGestures={allowsBackForwardNavigationGestures}
          nestedScrollEnabled
          setSupportMultipleWindows={false}
          onNavigationStateChange={onNavigationStateChange}
          onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
          onMessage={onMessage}
          onLoadStart={onLoadStart}
          startInLoadingState
          onContentProcessDidTerminate={() => webViewRef.current?.reload()}
          renderLoading={() => <ActivityIndicator className="flex-1" size="large" />}
          onError={({ nativeEvent }) => setLoadErrorMessage(nativeEvent.description)}
          onHttpError={({ nativeEvent }) =>
            setLoadErrorMessage(`HTTP ${nativeEvent.statusCode} 응답을 받았습니다`)
          }
        />
      </SafeAreaView>
    </View>
  );
}
