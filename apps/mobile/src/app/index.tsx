import { isBridgeRequest, parseBridgeMessage } from '@chapchap/shared/bridge';
import { useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

import { createBridgeResponse, createResponseScript } from '@/bridge';

import type { WebViewMessageEvent } from 'react-native-webview';

// TODO: 현재는 개발 서버 주소를 사용한다. 웹 배포 주소가 정해지면 환경별로 분리한다
const WEB_URL = process.env.EXPO_PUBLIC_WEB_URL;

/**
 * 웹 화면을 WebView로 띄우는 앱의 기본 화면.
 *
 * 웹에서 온 브릿지 요청을 받아 처리하고 응답을 돌려주는 진입점이기도 하다.
 * 웹 주소가 설정되지 않았거나 화면을 불러오지 못하면 원인을 알 수 있도록 안내 화면을 보여준다.
 */
export default function HomeScreen() {
  const webViewRef = useRef<WebView>(null);
  const [loadErrorMessage, setLoadErrorMessage] = useState<string | null>(null);

  const handleBridgeMessage = async (event: WebViewMessageEvent) => {
    const message = parseBridgeMessage(event.nativeEvent.data);

    if (!isBridgeRequest(message)) {
      return;
    }

    const response = await createBridgeResponse(message);

    webViewRef.current?.injectJavaScript(createResponseScript(response));
  };

  if (!WEB_URL) {
    return (
      <View style={styles.guide}>
        <Text style={styles.guideTitle}>웹 주소가 설정되지 않았습니다</Text>
        <Text style={styles.guideDescription}>
          apps/mobile/.env에 EXPO_PUBLIC_WEB_URL을 설정한 뒤 다시 실행해주세요.
        </Text>
      </View>
    );
  }

  if (loadErrorMessage) {
    return (
      <View style={styles.guide}>
        <Text style={styles.guideTitle}>웹 화면을 불러오지 못했습니다</Text>
        <Text style={styles.guideDescription}>{WEB_URL}</Text>
        <Text style={styles.guideDescription}>{loadErrorMessage}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri: WEB_URL }}
        onMessage={handleBridgeMessage}
        startInLoadingState
        renderLoading={() => <ActivityIndicator style={styles.loading} size="large" />}
        onError={({ nativeEvent }) => setLoadErrorMessage(nativeEvent.description)}
        onHttpError={({ nativeEvent }) =>
          setLoadErrorMessage(`HTTP ${nativeEvent.statusCode} 응답을 받았습니다`)
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loading: {
    flex: 1,
  },
  guide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#ffffff',
  },
  guideTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  guideDescription: {
    color: '#4b5563',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
});
