import {
  isBridgeEvent,
  parseBridgeMessage,
  RECEIPT_SHOP_SEARCH_SOURCE,
} from '@chapchap/shared/bridge';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef } from 'react';
import { WebView } from 'react-native-webview';

import { getUrlOrigin, isTrustedBridgeUrl } from '@/bridge';
import type { ReceiptReviewRouteParams } from '@/features/record';
import { WebViewScreen } from '@/shared/layout/WebViewScreen';

import type { WebViewMessageEvent } from 'react-native-webview';

const SHOP_SEARCH_PATH = `/record/shop/search?source=${RECEIPT_SHOP_SEARCH_SOURCE}`;

/** 웹의 실제 장소 검색을 그대로 표시하고 선택 결과를 영수증 리뷰로 돌려준다. */
export default function PlaceSearchScreen() {
  const params = useLocalSearchParams<ReceiptReviewRouteParams>();
  const webUrl = process.env.EXPO_PUBLIC_WEB_URL;
  const trustedWebOrigin = webUrl ? getUrlOrigin(webUrl) : null;
  const webViewRef = useRef<WebView>(null);
  const searchUrl = trustedWebOrigin ? `${trustedWebOrigin}${SHOP_SEARCH_PATH}` : null;

  const handleBridgeMessage = (event: WebViewMessageEvent) => {
    if (!trustedWebOrigin || !isTrustedBridgeUrl(event.nativeEvent.url, trustedWebOrigin)) {
      return;
    }

    const message = parseBridgeMessage(event.nativeEvent.data);

    if (!isBridgeEvent(message)) {
      return;
    }

    if (message.type === 'receiptShopSearchCancelled') {
      router.back();
      return;
    }

    if (message.type !== 'receiptShopSelected') {
      return;
    }

    router.dismissTo({
      pathname: '/receipt-confirm',
      params: {
        ...params,
        shopId: message.payload.shop.id,
        shopName: message.payload.shop.name,
        shopAddress: message.payload.shop.address,
        shopPhotoUrl: message.payload.shop.photoUrl ?? '',
      },
    });
  };

  return (
    <WebViewScreen
      uri={searchUrl}
      webViewRef={webViewRef}
      webViewTestID="place-search-webview"
      safeAreaTestID="place-search-safe-area"
      missingConfiguration={{
        title: '웹 주소가 설정되지 않았습니다',
        descriptions: ['apps/mobile/.env의 EXPO_PUBLIC_WEB_URL을 확인해주세요.'],
      }}
      loadErrorTitle="가게 검색을 불러오지 못했습니다"
      allowsBackForwardNavigationGestures={false}
      onMessage={handleBridgeMessage}
    />
  );
}
