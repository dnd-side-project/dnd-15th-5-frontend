import { isBridgeRequest, parseBridgeMessage } from '@chapchap/shared/bridge';
import { useRef, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

import { createBridgeResponse, createResponseScript } from '@/bridge';
import { useForegroundLocationPermission } from '@/native/location';

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
  const webViewRef = useRef<WebView>(null);
  const [loadErrorMessage, setLoadErrorMessage] = useState<string | null>(null);
  const isLocationPermissionRequestComplete = useForegroundLocationPermission(Boolean(webUrl));

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

  if (!isLocationPermissionRequestComplete) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-00">
        <ActivityIndicator className="flex-1" size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-00">
      <WebView
        ref={webViewRef}
        testID="home-webview"
        source={{ uri: webUrl }}
        geolocationEnabled
        onMessage={handleBridgeMessage}
        startInLoadingState
        renderLoading={() => <ActivityIndicator className="flex-1" size="large" />}
        onError={({ nativeEvent }) => setLoadErrorMessage(nativeEvent.description)}
        onHttpError={({ nativeEvent }) =>
          setLoadErrorMessage(`HTTP ${nativeEvent.statusCode} 응답을 받았습니다`)
        }
      />
    </SafeAreaView>
  );
}
