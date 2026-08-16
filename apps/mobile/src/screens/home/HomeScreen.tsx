import { isBridgeEvent, isBridgeRequest, parseBridgeMessage } from '@chapchap/shared/bridge';
import { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

import {
  createBridgeResponse,
  createResponseScript,
  getUrlOrigin,
  isTrustedBridgeUrl,
} from '@/bridge';

import { useWebViewSafeArea } from './useWebViewSafeArea';

import type { WebViewMessageEvent } from 'react-native-webview';

type GuideProps = {
  title: string;
  descriptions: string[];
};

/** 웹 화면을 띄울 수 없을 때 원인을 알려주는 안내 화면. */
function Guide({ title, descriptions }: GuideProps) {
  return (
    <View className="flex-1 items-center justify-center bg-neutral-00 px-6">
      <Text className="mb-2 font-pretendard-bold text-title-02-bold text-neutral-700">{title}</Text>
      {descriptions.map((description, index) => (
        <Text
          key={index}
          className="mt-1 text-center font-pretendard-regular text-body-02-regular text-neutral-600"
        >
          {description}
        </Text>
      ))}
    </View>
  );
}

/**
 * 웹 화면을 WebView로 띄우는 앱의 기본 화면.
 *
 * 웹에서 온 브릿지 요청을 받아 처리하고 응답을 돌려주는 진입점이기도 하다.
 * 웹 주소가 설정되지 않았거나 화면을 불러오지 못하면 원인을 알 수 있도록 안내 화면을 보여준다.
 */
export default function HomeScreen() {
  // 개발 빌드는 .env의 로컬 개발 서버를, preview·production 빌드는 eas.json에 지정한 배포 주소를 사용한다
  const webUrl = process.env.EXPO_PUBLIC_WEB_URL;
  const trustedWebOrigin = webUrl ? getUrlOrigin(webUrl) : null;
  const webViewRef = useRef<WebView>(null);
  const [loadErrorMessage, setLoadErrorMessage] = useState<string | null>(null);
  const { edges, handleNavigationStateChange, handleRouteChange } = useWebViewSafeArea(webUrl);
  // NOTE: source에 매번 새 객체를 넘기면 값이 같아도 WebView가 다시 로드할 수 있어 재사용한다.
  const webViewSource = useMemo(() => (webUrl ? { uri: webUrl } : undefined), [webUrl]);

  const handleBridgeMessage = async (event: WebViewMessageEvent) => {
    if (!trustedWebOrigin || !isTrustedBridgeUrl(event.nativeEvent.url, trustedWebOrigin)) {
      return;
    }

    const message = parseBridgeMessage(event.nativeEvent.data);

    if (isBridgeEvent(message)) {
      // 웹 라우트에 따라 SafeAreaView의 edges만 바꿔 WebView 재마운트를 피한다.
      handleRouteChange(message.payload.pathname);
      return;
    }

    if (!isBridgeRequest(message)) {
      return;
    }

    const response = await createBridgeResponse(message);

    // NOTE: 처리 중 외부 페이지로 이동해도 위치 등 네이티브 응답을 전달하지 않는다.
    webViewRef.current?.injectJavaScript(createResponseScript(response, trustedWebOrigin));
  };

  if (!webUrl) {
    return (
      <Guide
        title="웹 주소가 설정되지 않았습니다"
        descriptions={['apps/mobile/.env에 EXPO_PUBLIC_WEB_URL을 설정한 뒤 다시 실행해주세요.']}
      />
    );
  }

  if (loadErrorMessage) {
    return (
      <Guide title="웹 화면을 불러오지 못했습니다" descriptions={[webUrl, loadErrorMessage]} />
    );
  }

  return (
    <SafeAreaView
      testID="home-safe-area"
      edges={edges}
      className="bg-neutral-00"
      style={{ flex: 1 }}
    >
      <WebView
        ref={webViewRef}
        testID="home-webview"
        // NOTE: 높이가 정확히 100%(flex: 1)면 화면을 덮는 다른 화면에서 돌아올 때
        // iOS WebView가 다시 그려지지 않고 흰 화면으로 남는 알려진 버그가 있다.
        // https://github.com/react-native-webview/react-native-webview/issues/2963
        style={{ height: '99.9%', width: '100%' }}
        source={webViewSource}
        // Safe Area는 위 wrapper가 경로별로 관리하므로 WebView 자체의 iOS 자동 보정은 끈다.
        automaticallyAdjustContentInsets={false}
        contentInsetAdjustmentBehavior="never"
        onNavigationStateChange={({ url }) => handleNavigationStateChange(url)}
        onMessage={handleBridgeMessage}
        startInLoadingState
        // NOTE: 위 이슈와 같은 계열의 iOS 문제로, 콘텐츠 프로세스가 죽으면 페이지 이동 없이
        // 흰 화면만 남는다. 감지되면 다시 불러온다.
        onContentProcessDidTerminate={() => webViewRef.current?.reload()}
        renderLoading={() => <ActivityIndicator className="flex-1" size="large" />}
        onError={({ nativeEvent }) => setLoadErrorMessage(nativeEvent.description)}
        onHttpError={({ nativeEvent }) =>
          setLoadErrorMessage(`HTTP ${nativeEvent.statusCode} 응답을 받았습니다`)
        }
      />
    </SafeAreaView>
  );
}
