import { router, useLocalSearchParams } from 'expo-router';

import {
  createReceiptReviewRouteParams,
  isRecordCategory,
  parseVisitDateTime,
  ReceiptReviewForm,
} from '@/features/record';
import type { ReceiptReviewRouteParams } from '@/features/record';

/**
 * 촬영한 영수증과 인식 결과를 확인하는 화면.
 * OCR 연동 후에는 같은 라우트 파라미터 경계로 인식 결과를 초기값에 전달한다.
 */
export default function ReceiptConfirmScreen() {
  const {
    uri = '',
    shopName,
    shopAddress,
    shopPhotoUrl,
    amount,
    category,
    visitedAt,
    visitPeriod,
    shopId,
  } = useLocalSearchParams<ReceiptReviewRouteParams>();
  const initialVisitDateTime = parseVisitDateTime(visitedAt, visitPeriod);

  const handleBack = () => {
    // TODO: 공통 확인 UI 디자인 확정 후 작성 중 이탈 안내를 거쳐 카메라로 이동한다.
    router.replace('/camera');
  };

  // TODO: 기록 생성 API 계약이 확정되면 onSubmit으로 저장하고 WebView의 /home을 갱신한다.
  return (
    <ReceiptReviewForm
      key={`${shopId ?? 'ocr'}:${shopName ?? ''}:${shopAddress ?? ''}`}
      receiptUri={uri}
      initialShopId={shopId}
      initialShopName={shopName}
      initialShopAddress={shopAddress}
      initialShopPhotoUrl={shopPhotoUrl || null}
      initialVisitDateTime={initialVisitDateTime}
      initialAmount={amount}
      initialCategory={isRecordCategory(category) ? category : undefined}
      onBack={handleBack}
      onChangeShop={(state) =>
        router.push({
          pathname: '/place-search',
          params: createReceiptReviewRouteParams(state),
        })
      }
    />
  );
}
