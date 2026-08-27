import { CameraView } from 'expo-camera';
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, PanResponder, Platform, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { requestWebViewNavigation } from '@/bridge/webViewNavigation';
import {
  getRecordErrorMessage,
  parseReceiptVisitDateTime,
  processReceiptImage,
  RecordExitConfirmDialog,
  RECEIPT_BACK_BUTTON_SAFE_AREA_OFFSET,
  ReceiptScanLoading,
} from '@/features/record';
import type { ReceiptReviewRouteParams } from '@/features/record';
import { pickReceiptImageFromLibrary } from '@/native/pickReceiptImageFromLibrary';
import { CloseIcon, GalleryIcon } from '@/shared/assets/icons';
import { BackButton } from '@/shared/ui/back-button';
import { useToast } from '@/shared/ui/toast';

import type { GestureResponderEvent } from 'react-native';

type ProcessedReceipt = Awaited<ReturnType<typeof processReceiptImage>>;

// NOTE: 손가락 이동 거리 대비 줌 변화량. 실제 기기에서 체감 속도를 보고 조정이 필요할 수 있다.
const PINCH_ZOOM_SENSITIVITY = 0.5;
const ULTRA_WIDE_LENS_PATTERN = /ultra[ -]?wide|울트라[ -]?와이드|초광각/i;

const getTouchDistance = (touches: GestureResponderEvent['nativeEvent']['touches']) => {
  const [first, second] = touches;

  if (!first || !second) {
    return 0;
  }

  return Math.hypot(first.pageX - second.pageX, first.pageY - second.pageY);
};

const createReceiptConfirmParams = ({
  uri,
  receiptImageId,
  storeName,
  address,
  purchaseDate,
  purchaseTime,
  amount,
  googlePlaceSearchResult,
}: ProcessedReceipt): ReceiptReviewRouteParams => {
  const visitDateTime = parseReceiptVisitDateTime(purchaseDate, purchaseTime);
  const recognizedShopName = googlePlaceSearchResult?.placeName || storeName;
  const recognizedShopAddress = googlePlaceSearchResult?.roadAddress || address;

  return {
    uri,
    receiptImageId: String(receiptImageId),
    ...(googlePlaceSearchResult?.googlePlaceId
      ? { shopId: googlePlaceSearchResult.googlePlaceId }
      : {}),
    ...(recognizedShopName ? { shopName: recognizedShopName } : {}),
    ...(recognizedShopAddress ? { shopAddress: recognizedShopAddress } : {}),
    ...(googlePlaceSearchResult?.thumbnailUrl
      ? { shopPhotoUrl: googlePlaceSearchResult.thumbnailUrl }
      : {}),
    ...(googlePlaceSearchResult?.latitude !== undefined
      ? { latitude: String(googlePlaceSearchResult.latitude) }
      : {}),
    ...(googlePlaceSearchResult?.longitude !== undefined
      ? { longitude: String(googlePlaceSearchResult.longitude) }
      : {}),
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
  const [zoom, setZoom] = useState(0);
  const zoomRef = useRef(0);
  const [selectedLens, setSelectedLens] = useState<string | undefined>(undefined);
  const selectedLensRef = useRef<string | undefined>(undefined);
  const ultraWideLensRef = useRef<string | undefined>(undefined);
  const pinchStartRef = useRef<{
    distance: number;
    zoom: number;
    lens: string | undefined;
  } | null>(null);
  // NOTE: 촬영과 갤러리 선택 중 하나만 동시에 진행될 수 있어 상태 하나로 함께 관리한다.
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false);
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

  const updateZoom = useCallback((value: number) => {
    zoomRef.current = value;
    setZoom(value);
  }, []);

  const updateSelectedLens = useCallback((value?: string) => {
    selectedLensRef.current = value;
    setSelectedLens(value);
  }, []);

  const handleCameraReady = () => {
    setIsCameraReady(true);

    if (Platform.OS !== 'ios') {
      return;
    }

    // NOTE: onCameraReady는 async로 넘기면 안 된다(호출부가 반환값을 함수로 기대할 수 있다).
    // 렌즈 목록 조회는 별도로 fire-and-forget한다.
    void (async () => {
      try {
        const availableLenses = (await cameraRef.current?.getAvailableLensesAsync()) ?? [];
        ultraWideLensRef.current = availableLenses.find((lens) =>
          ULTRA_WIDE_LENS_PATTERN.test(lens)
        );
      } catch {
        // NOTE: 렌즈 목록 조회에 실패해도 기본 렌즈로는 계속 촬영할 수 있어 조용히 무시한다.
        ultraWideLensRef.current = undefined;
      }
    })();
  };

  const [pinchPanHandlers, setPinchPanHandlers] = useState<
    ReturnType<typeof PanResponder.create>['panHandlers']
  >({});

  useEffect(() => {
    const responder = PanResponder.create({
      onStartShouldSetPanResponder: (event) => event.nativeEvent.touches.length === 2,
      onMoveShouldSetPanResponder: (event) => event.nativeEvent.touches.length === 2,
      onPanResponderGrant: (event) => {
        pinchStartRef.current = {
          distance: getTouchDistance(event.nativeEvent.touches),
          zoom: zoomRef.current,
          lens: selectedLensRef.current,
        };
      },
      onPanResponderMove: (event) => {
        const pinchStart = pinchStartRef.current;

        if (!pinchStart || event.nativeEvent.touches.length !== 2 || pinchStart.distance === 0) {
          return;
        }

        const distance = getTouchDistance(event.nativeEvent.touches);
        const scale = distance / pinchStart.distance;
        const nextZoom = pinchStart.zoom + (scale - 1) * PINCH_ZOOM_SENSITIVITY;

        // NOTE: 기본 렌즈에서 계속 축소하면(줌 < 0) iOS에서만 초광각 렌즈로 전환한다.
        // 이 지점을 새 제스처 기준점으로 삼아 이어서 손가락을 움직여도 자연스럽게 이어지게 한다.
        if (pinchStart.lens === undefined && nextZoom < 0 && ultraWideLensRef.current) {
          updateSelectedLens(ultraWideLensRef.current);
          updateZoom(0);
          pinchStartRef.current = { distance, zoom: 0, lens: ultraWideLensRef.current };
          return;
        }

        // NOTE: 초광각에서 다시 확대 방향으로 돌리면 기본 렌즈로 복귀한다.
        if (
          ultraWideLensRef.current &&
          pinchStart.lens === ultraWideLensRef.current &&
          nextZoom > 0
        ) {
          updateSelectedLens(undefined);
          updateZoom(0);
          pinchStartRef.current = { distance, zoom: 0, lens: undefined };
          return;
        }

        updateZoom(Math.min(1, Math.max(0, nextZoom)));
      },
      onPanResponderRelease: () => {
        pinchStartRef.current = null;
      },
      onPanResponderTerminate: () => {
        pinchStartRef.current = null;
      },
    });

    setPinchPanHandlers(responder.panHandlers);
  }, [updateSelectedLens, updateZoom]);

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
    <View className="flex-1 bg-neutral-900" {...pinchPanHandlers}>
      {/* NOTE: CameraView는 react-native 외부 컴포넌트라 Uniwind의 className이 적용되지 않으므로 style을 쓴다. */}
      <CameraView
        ref={cameraRef}
        style={{ flex: 1 }}
        facing="back"
        zoom={zoom}
        selectedLens={Platform.OS === 'ios' ? selectedLens : undefined}
        onCameraReady={handleCameraReady}
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
        onPress={() => setIsExitConfirmOpen(true)}
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

      {isExitConfirmOpen && (
        <RecordExitConfirmDialog
          onExit={handleClose}
          onContinue={() => setIsExitConfirmOpen(false)}
        />
      )}
    </View>
  );
}
