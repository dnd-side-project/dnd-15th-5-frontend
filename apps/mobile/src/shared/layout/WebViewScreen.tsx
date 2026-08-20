import { useMemo, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

import type { RefObject } from 'react';
import type { Edge } from 'react-native-safe-area-context';
import type { WebViewProps } from 'react-native-webview';

const WEB_VIEW_SAFE_AREA_EDGES: Edge[] = ['top', 'right', 'bottom', 'left'];

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
  allowsBackForwardNavigationGestures: boolean;
  onMessage?: WebViewProps['onMessage'];
  onNavigationStateChange?: WebViewProps['onNavigationStateChange'];
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

/** 모든 WebView 화면에 동일한 Safe Area, 로딩, 오류 복구 동작을 적용한다. */
export function WebViewScreen({
  uri,
  webViewRef,
  webViewTestID,
  safeAreaTestID,
  missingConfiguration,
  loadErrorTitle,
  loadErrorDescriptions = [],
  allowsBackForwardNavigationGestures,
  onMessage,
  onNavigationStateChange,
}: WebViewScreenProps) {
  const [loadErrorMessage, setLoadErrorMessage] = useState<string | null>(null);
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
      <SafeAreaView testID={safeAreaTestID} edges={WEB_VIEW_SAFE_AREA_EDGES} style={{ flex: 1 }}>
        <WebView
          ref={webViewRef}
          testID={webViewTestID}
          // NOTE: iOS에서 flex: 1인 WebView를 덮었다가 돌아오면 흰 화면으로 남는 문제가 있다.
          style={{ height: '99.9%', width: '100%' }}
          source={source}
          automaticallyAdjustContentInsets={false}
          contentInsetAdjustmentBehavior="never"
          allowsBackForwardNavigationGestures={allowsBackForwardNavigationGestures}
          onNavigationStateChange={onNavigationStateChange}
          onMessage={onMessage}
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
