import { isBridgeRequest, parseBridgeMessage } from '@chapchap/shared/bridge';
import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

import { createBridgeResponse, createResponseScript } from '@/bridge';

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
  const webViewRef = useRef<WebView>(null);
  const hasRequestedLocationPermission = useRef(false);
  const [loadErrorMessage, setLoadErrorMessage] = useState<string | null>(null);
  const [isLocationPermissionRequestComplete, setIsLocationPermissionRequestComplete] =
    useState(false);

  useEffect(() => {
    if (!webUrl || hasRequestedLocationPermission.current) {
      return;
    }

    hasRequestedLocationPermission.current = true;

    const requestLocationPermission = async () => {
      try {
        await Location.requestForegroundPermissionsAsync();
      } catch {
        // 네이티브 권한 요청 자체가 실패해도 웹의 위치 오류 처리 흐름은 사용할 수 있어야 한다.
      } finally {
        setIsLocationPermissionRequestComplete(true);
      }
    };

    void requestLocationPermission();
  }, [webUrl]);

  const handleBridgeMessage = async (event: WebViewMessageEvent) => {
    const message = parseBridgeMessage(event.nativeEvent.data);

    if (!isBridgeRequest(message)) {
      return;
    }

    const response = await createBridgeResponse(message);

    webViewRef.current?.injectJavaScript(createResponseScript(response));
  };

  if (!webUrl) {
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
        <Text style={styles.guideDescription}>{webUrl}</Text>
        <Text style={styles.guideDescription}>{loadErrorMessage}</Text>
      </View>
    );
  }

  if (!isLocationPermissionRequestComplete) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator style={styles.loading} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        ref={webViewRef}
        testID="home-webview"
        source={{ uri: webUrl }}
        geolocationEnabled
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
