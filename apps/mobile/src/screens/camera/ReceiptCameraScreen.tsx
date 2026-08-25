import { CameraView } from 'expo-camera';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { requestWebViewNavigation } from '@/bridge/webViewNavigation';
import {
  getRecordErrorMessage,
  parseReceiptVisitDateTime,
  processReceiptImage,
  RECEIPT_BACK_BUTTON_SAFE_AREA_OFFSET,
  ReceiptScanLoading,
} from '@/features/record';
import type { ReceiptReviewRouteParams } from '@/features/record';
import { pickReceiptImageFromLibrary } from '@/native/pickReceiptImageFromLibrary';
import { CloseIcon, GalleryIcon } from '@/shared/assets/icons';
import { BackButton } from '@/shared/ui/back-button';
import { useToast } from '@/shared/ui/toast';

type ProcessedReceipt = Awaited<ReturnType<typeof processReceiptImage>>;

const createReceiptConfirmParams = ({
  uri,
  receiptImageId,
  storeName,
  address,
  purchaseDate,
  purchaseTime,
  amount,
}: ProcessedReceipt): ReceiptReviewRouteParams => {
  const visitDateTime = parseReceiptVisitDateTime(purchaseDate, purchaseTime);

  return {
    uri,
    receiptImageId: String(receiptImageId),
    ...(storeName ? { shopName: storeName } : {}),
    ...(address ? { shopAddress: address } : {}),
    ...(amount !== null && amount !== undefined ? { amount: String(amount) } : {}),
    ...(visitDateTime
      ? {
          visitedAt: String(visitDateTime.date.getTime()),
          visitPeriod: visitDateTime.period,
        }
      : {}),
  };
};

/**
 * 영수증을 촬영하는 화면.
 *
 * 촬영·선택 결과는 웹으로 돌아가지 않고 `receipt-confirm` 화면으로 바로 이어간다.
 * 좌표는 시안(REC_ReceiptScan, 393x852 기준)을 그대로 옮긴 값이다.
 * 393x852는 상단바·하단바가 노치·홈 인디케이터를 감안해 그려진 크기라 안전영역을 더하지 않는다.
 */
export default function ReceiptCameraScreen() {
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const cameraRef = useRef<CameraView>(null);
  const isProcessingRef = useRef(false);
  const isScanVisibleRef = useRef(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  // NOTE: 촬영과 갤러리 선택 중 하나만 동시에 진행될 수 있어 상태 하나로 함께 관리한다.
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanImageUri, setScanImageUri] = useState<string | null>(null);

  const resetProcessing = () => {
    isProcessingRef.current = false;
    if (isScanVisibleRef.current) {
      setIsCameraReady(false);
    }
    isScanVisibleRef.current = false;
    setIsProcessing(false);
    setScanImageUri(null);
  };

  const showScanLoading = (imageUri: string) => {
    isScanVisibleRef.current = true;
    setScanImageUri(imageUri);
  };

  const handleClose = () => {
    requestWebViewNavigation('/home');
    router.dismissTo('/');
  };

  const startProcessing = () => {
    if (isProcessingRef.current) {
      return false;
    }

    isProcessingRef.current = true;
    setIsProcessing(true);
    return true;
  };

  const handleCapture = async () => {
    if (!cameraRef.current || !isCameraReady || !startProcessing()) {
      return;
    }

    try {
      // NOTE: 압축은 normalizeReceiptImage가 백엔드 제약에 맞춰 처리하므로 최대 화질로 촬영한다.
      const picture = await cameraRef.current.takePictureAsync();
      showScanLoading(picture.uri);
      const processedReceipt = await processReceiptImage(picture);

      router.replace({
        pathname: '/receipt-confirm',
        params: createReceiptConfirmParams(processedReceipt),
      });
    } catch (error) {
      // NOTE: 촬영에 실패해도 화면을 유지해 다시 시도할 수 있게 한다.
      resetProcessing();
      const serverErrorMessage = getRecordErrorMessage(error);

      if (serverErrorMessage) {
        showToast({ message: serverErrorMessage, type: 'info' });
        return;
      }

      Alert.alert('사진을 처리하지 못했습니다', error instanceof Error ? error.message : undefined);
    }
  };

  const handlePickFromLibrary = async () => {
    if (!startProcessing()) {
      return;
    }

    try {
      const picked = await pickReceiptImageFromLibrary();

      if (picked.status === 'cancelled') {
        resetProcessing();
        return;
      }

      showScanLoading(picked.uri);
      const processedReceipt = await processReceiptImage(picked);

      router.replace({
        pathname: '/receipt-confirm',
        params: createReceiptConfirmParams(processedReceipt),
      });
    } catch (error) {
      resetProcessing();
      const serverErrorMessage = getRecordErrorMessage(error);

      if (serverErrorMessage) {
        showToast({ message: serverErrorMessage, type: 'info' });
        return;
      }

      // NOTE: 권한 거부는 다시 시도해도 바뀌지 않아 원인을 알려준다.
      Alert.alert('사진을 가져오지 못했습니다', error instanceof Error ? error.message : undefined);
    }
  };

  if (scanImageUri) {
    return <ReceiptScanLoading imageUri={scanImageUri} />;
  }

  return (
    <View className="flex-1 bg-neutral-900">
      {/* NOTE: CameraView는 react-native 외부 컴포넌트라 Uniwind의 className이 적용되지 않으므로 style을 쓴다. */}
      <CameraView
        ref={cameraRef}
        style={{ flex: 1 }}
        facing="back"
        onCameraReady={() => setIsCameraReady(true)}
      />

      <View pointerEvents="none" className="absolute inset-x-0 top-0 h-33.5 bg-neutral-900/80" />
      <View pointerEvents="none" className="absolute inset-x-0 bottom-0 h-44.5 bg-neutral-900/80" />

      <BackButton
        onPress={() => router.back()}
        disabled={isProcessing}
        variant="light"
        className={`absolute left-4 ${isProcessing ? 'opacity-40' : ''}`}
        style={{ top: insets.top + RECEIPT_BACK_BUTTON_SAFE_AREA_OFFSET }}
      />

      <Pressable
        onPress={handleClose}
        disabled={isProcessing}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="기록 닫고 홈으로 이동"
        className={`absolute right-4 h-6 w-6 items-center justify-center ${isProcessing ? 'opacity-40' : ''}`}
        style={{ top: insets.top + RECEIPT_BACK_BUTTON_SAFE_AREA_OFFSET }}
      >
        {/* #ffffff = neutral-00 */}
        <CloseIcon width={14} height={14} color="#ffffff" />
      </Pressable>

      <Pressable
        onPress={handlePickFromLibrary}
        disabled={isProcessing}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="사진 보관함에서 선택"
        className={`absolute bottom-[74.5px] left-10 h-15 w-15 items-center justify-center rounded-full bg-neutral-900/80 ${isProcessing ? 'opacity-40' : ''}`}
      >
        {/* #ffffff = neutral-00 */}
        <GalleryIcon width={26} height={26} color="#ffffff" />
      </Pressable>

      <View className="absolute inset-x-0 bottom-16.75 items-center">
        <Pressable
          onPress={handleCapture}
          disabled={!isCameraReady || isProcessing}
          accessibilityRole="button"
          accessibilityLabel="영수증 촬영"
          className={`h-18.75 w-18.75 items-center justify-center rounded-full bg-neutral-00 ${!isCameraReady || isProcessing ? 'opacity-40' : ''}`}
        >
          <View className="h-15 w-15 rounded-full border-[3px] border-neutral-900" />
        </Pressable>
      </View>
    </View>
  );
}
