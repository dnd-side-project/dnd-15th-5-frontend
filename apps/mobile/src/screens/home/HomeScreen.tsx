import { isBridgeEvent, isBridgeRequest, parseBridgeMessage } from '@chapchap/shared/bridge';
import { useRef } from 'react';
import { WebView } from 'react-native-webview';

import {
  createBridgeResponse,
  createResponseScript,
  getUrlOrigin,
  isTrustedBridgeUrl,
} from '@/bridge';
import { WebViewScreen } from '@/shared/layout/WebViewScreen';

import { useWebViewNavigationState } from './useWebViewNavigationState';

import type { WebViewMessageEvent } from 'react-native-webview';

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
  const initialWebUrl = trustedWebOrigin ? `${trustedWebOrigin}/` : null;
  const webViewRef = useRef<WebView>(null);
  const { handleNavigationStateChange, handleRouteChange, isMapHome } = useWebViewNavigationState(
    initialWebUrl ?? undefined
  );

  const handleBridgeMessage = async (event: WebViewMessageEvent) => {
    if (!trustedWebOrigin || !isTrustedBridgeUrl(event.nativeEvent.url, trustedWebOrigin)) {
      return;
    }

    const message = parseBridgeMessage(event.nativeEvent.data);

    if (isBridgeEvent(message)) {
      if (message.type === 'routeChanged') {
        handleRouteChange(message.payload.pathname);
      }
      return;
    }

    if (!isBridgeRequest(message)) {
      return;
    }

    const response = await createBridgeResponse(message);

    // NOTE: 처리 중 외부 페이지로 이동해도 위치 등 네이티브 응답을 전달하지 않는다.
    webViewRef.current?.injectJavaScript(createResponseScript(response, trustedWebOrigin));
  };

  return (
    <WebViewScreen
      uri={initialWebUrl}
      webViewRef={webViewRef}
      webViewTestID="home-webview"
      safeAreaTestID="home-safe-area"
      missingConfiguration={{
        title: '웹 주소가 설정되지 않았습니다',
        descriptions: ['apps/mobile/.env에 EXPO_PUBLIC_WEB_URL을 설정한 뒤 다시 실행해주세요.'],
      }}
      loadErrorTitle="웹 화면을 불러오지 못했습니다"
      loadErrorDescriptions={webUrl ? [webUrl] : []}
      edgeToEdge={isMapHome}
      allowsBackForwardNavigationGestures={!isMapHome}
      onNavigationStateChange={({ url }) => handleNavigationStateChange(url)}
      onMessage={handleBridgeMessage}
    />
  );
}
