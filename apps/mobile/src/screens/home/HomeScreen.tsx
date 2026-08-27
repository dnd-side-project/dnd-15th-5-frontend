import { isBridgeEvent, parseBridgeMessage } from '@chapchap/shared/bridge';
import { useEffect, useRef } from 'react';
import { AppState, BackHandler, Linking } from 'react-native';
import { WebView } from 'react-native-webview';

import {
  createAppActiveScript,
  getTrustedInternalUrl,
  getUrlOrigin,
  isTrustedBridgeUrl,
  respondToBridgeRequest,
} from '@/bridge';
import { getKakaoTalkShareTarget } from '@/bridge/kakaoTalkShare';
import { subscribeWebViewNavigation } from '@/bridge/webViewNavigation';
import { WebViewScreen } from '@/shared/layout/WebViewScreen';

import { useWebViewNavigationState } from './useWebViewNavigationState';

import type { WebViewMessageEvent, WebViewProps } from 'react-native-webview';

/**
 * 웹 인증 진입점부터 지도 홈까지 하나의 WebView로 띄우는 앱의 기본 화면입니다.
 *
 * 설정된 웹 origin과 같은 문서에서 온 브릿지 요청만 처리하고, 외부 HTTP(S) 링크는 기기의
 * 기본 앱으로 전달합니다. 웹 주소가 없거나 로드에 실패하면 `WebViewScreen`의 안내 화면을
 * 사용하며, Android 하드웨어 뒤로 가기는 지도 홈 이외의 웹 경로에서 WebView 기록을 이동합니다.
 */
export default function HomeScreen() {
  // 개발 빌드는 .env의 로컬 개발 서버를, preview·production 빌드는 eas.json에 지정한 배포 주소를 사용한다
  const webUrl = process.env.EXPO_PUBLIC_WEB_URL;
  const trustedWebOrigin = webUrl ? getUrlOrigin(webUrl) : null;
  const initialWebUrl = trustedWebOrigin ? `${trustedWebOrigin}/` : null;
  const webViewRef = useRef<WebView>(null);
  const { canGoBack, handleNavigationStateChange, handleRouteChange, isMapHome } =
    useWebViewNavigationState(initialWebUrl ?? undefined);

  useEffect(() => {
    let previousAppState = AppState.currentState;
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      const didBecomeActive = previousAppState !== 'active' && nextAppState === 'active';

      previousAppState = nextAppState;

      if (didBecomeActive && trustedWebOrigin) {
        webViewRef.current?.injectJavaScript(createAppActiveScript(trustedWebOrigin));
      }
    });

    return () => subscription.remove();
  }, [trustedWebOrigin]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isMapHome || !canGoBack || !webViewRef.current) {
        return false;
      }

      webViewRef.current.goBack();
      return true;
    });

    return () => subscription.remove();
  }, [canGoBack, isMapHome]);

  useEffect(() => {
    if (!trustedWebOrigin) {
      return;
    }

    return subscribeWebViewNavigation((path) => {
      const targetUrl = getTrustedInternalUrl(path, trustedWebOrigin);

      if (!targetUrl) {
        return;
      }

      webViewRef.current?.injectJavaScript(
        `window.location.replace(${JSON.stringify(targetUrl)}); true;`
      );
    });
  }, [trustedWebOrigin]);

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

    // NOTE: 처리 중 외부 페이지로 이동해도 위치 등 네이티브 응답을 전달하지 않는다.
    await respondToBridgeRequest(message, trustedWebOrigin, webViewRef.current);
  };

  const handleShouldStartLoadWithRequest: NonNullable<
    WebViewProps['onShouldStartLoadWithRequest']
  > = ({ url }) => {
    if (!trustedWebOrigin || isTrustedBridgeUrl(url, trustedWebOrigin)) {
      return true;
    }

    const kakaoTalkShareTarget = getKakaoTalkShareTarget(url);

    if (kakaoTalkShareTarget) {
      void Linking.openURL(kakaoTalkShareTarget.launchUrl).catch(() => {
        if (kakaoTalkShareTarget.fallbackUrl) {
          void Linking.openURL(kakaoTalkShareTarget.fallbackUrl).catch(() => {
            // TODO: 네이티브 공통 오류 안내 UI가 생기면 카카오톡 실행 실패를 사용자에게 알린다.
          });
        }
      });

      return false;
    }

    if (/^https?:\/\//i.test(url)) {
      void Linking.openURL(url).catch(() => {
        // TODO: 네이티브 공통 오류 안내 UI가 생기면 외부 링크 실행 실패를 사용자에게 알린다.
      });
    }

    return false;
  };

  // TODO: iOS 실기기 개발 빌드에서 경로별 Safe Area, 뒤로 가기 제스처, 바텀시트 드래그·스크롤을 E2E 확인한다.
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
      safeAreaMode={isMapHome ? 'none' : 'except-bottom'}
      allowsBackForwardNavigationGestures={!isMapHome}
      onNavigationStateChange={({ canGoBack: nextCanGoBack, url }) =>
        handleNavigationStateChange(url, nextCanGoBack)
      }
      onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
      onMessage={handleBridgeMessage}
    />
  );
}
