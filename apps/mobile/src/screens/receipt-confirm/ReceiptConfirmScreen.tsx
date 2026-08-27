import { router, useLocalSearchParams } from 'expo-router';

import { requestWebViewNavigation } from '@/bridge/webViewNavigation';
import {
  createReceiptReviewRouteParams,
  createRecordCreatedHomePath,
  isRecordCategory,
  parseVisitDateTime,
  ReceiptReviewForm,
  useSubmitReceiptConsumption,
} from '@/features/record';
import type { ReceiptReviewRouteParams } from '@/features/record';

import type { CreatedConsumptionPlace } from '@chapchap/shared/record';

const parseRouteNumber = (value: string | undefined) => {
  if (!value) {
    return null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
};

/**
 * 촬영한 영수증과 인식 결과를 확인하는 화면.
 * OCR 연동 후에는 같은 라우트 파라미터 경계로 인식 결과를 초기값에 전달한다.
 */
export default function ReceiptConfirmScreen() {
  const {
    uri = '',
    receiptImageId,
    shopName,
    shopAddress,
    shopPhotoUrl,
    latitude,
    longitude,
    amount,
    category,
    visitedAt,
    visitPeriod,
    shopId,
  } = useLocalSearchParams<ReceiptReviewRouteParams>();
  const initialVisitDateTime = parseVisitDateTime(visitedAt, visitPeriod);
  const parsedReceiptImageId = parseRouteNumber(receiptImageId);
  const parsedLatitude = parseRouteNumber(latitude);
  const parsedLongitude = parseRouteNumber(longitude);

  const handleClose = () => {
    requestWebViewNavigation('/home');
    router.dismissTo('/');
  };

  const handleSubmitSuccess = (createdPlace: CreatedConsumptionPlace) => {
    requestWebViewNavigation(createRecordCreatedHomePath(createdPlace));
    router.dismissTo('/');
  };

  const { isSubmitting, submitReceiptConsumption } = useSubmitReceiptConsumption({
    onSuccess: handleSubmitSuccess,
  });

  const handleBack = () => {
    router.replace('/camera');
  };

  return (
    <ReceiptReviewForm
      key={`${shopId ?? 'ocr'}:${shopName ?? ''}:${shopAddress ?? ''}`}
      receiptUri={uri}
      initialReceiptImageId={parsedReceiptImageId}
      initialShopId={shopId}
      initialShopName={shopName}
      initialShopAddress={shopAddress}
      initialShopPhotoUrl={shopPhotoUrl || null}
      initialLatitude={parsedLatitude}
      initialLongitude={parsedLongitude}
      initialVisitDateTime={initialVisitDateTime}
      initialAmount={amount}
      initialCategory={isRecordCategory(category) ? category : undefined}
      isSubmitting={isSubmitting}
      onBack={handleBack}
      onClose={handleClose}
      onSubmit={submitReceiptConsumption}
      onChangeShop={(state) =>
        router.push({
          pathname: '/place-search',
          params: createReceiptReviewRouteParams(state),
        })
      }
    />
  );
}
