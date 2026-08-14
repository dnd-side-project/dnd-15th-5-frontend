import { CameraView } from 'expo-camera';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert, Pressable, View } from 'react-native';

import { normalizeReceiptImage } from '@/native/normalizeReceiptImage';
import { pickReceiptImageFromLibrary } from '@/native/pickReceiptImageFromLibrary';
import { ChevronLeftIcon, GalleryIcon } from '@/shared/assets/icons';

/**
 * 영수증을 촬영하는 화면.
 *
 * 촬영·선택 결과는 웹으로 돌아가지 않고 `receipt-confirm` 화면으로 바로 이어간다.
 * 좌표는 시안(REC_ReceiptScan, 393x852 기준)을 그대로 옮긴 값이다.
 * 393x852는 상단바·하단바가 노치·홈 인디케이터를 감안해 그려진 크기라 안전영역을 더하지 않는다.
 */
export default function ReceiptCameraScreen() {
  const cameraRef = useRef<CameraView>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  // NOTE: 촬영과 갤러리 선택 중 하나만 동시에 진행될 수 있어 상태 하나로 함께 관리한다.
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCapture = async () => {
    if (!cameraRef.current || !isCameraReady || isProcessing) {
      return;
    }

    setIsProcessing(true);

    try {
      // NOTE: 압축은 normalizeReceiptImage가 백엔드 제약에 맞춰 처리하므로 최대 화질로 촬영한다.
      const picture = await cameraRef.current.takePictureAsync();
      const normalized = await normalizeReceiptImage(picture);

      router.replace({ pathname: '/receipt-confirm', params: { uri: normalized.uri } });
    } catch {
      // NOTE: 촬영에 실패해도 화면을 유지해 다시 시도할 수 있게 한다.
      setIsProcessing(false);
    }
  };

  const handlePickFromLibrary = async () => {
    if (isProcessing) {
      return;
    }

    setIsProcessing(true);

    try {
      const picked = await pickReceiptImageFromLibrary();

      if (picked.status === 'cancelled') {
        setIsProcessing(false);
        return;
      }

      const normalized = await normalizeReceiptImage(picked);

      router.replace({ pathname: '/receipt-confirm', params: { uri: normalized.uri } });
    } catch (error) {
      setIsProcessing(false);
      // NOTE: 권한 거부는 다시 시도해도 바뀌지 않아 원인을 알려준다.
      Alert.alert('사진을 가져오지 못했습니다', error instanceof Error ? error.message : undefined);
    }
  };

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

      <Pressable onPress={() => router.back()} hitSlop={12} className="absolute left-5 top-19.25">
        {/* NOTE: react-native-svg 컴포넌트라 색은 className이 아닌 color prop으로 지정한다. #ffffff = neutral-00 */}
        <ChevronLeftIcon width={10} height={18} color="#ffffff" />
      </Pressable>

      <Pressable
        onPress={handlePickFromLibrary}
        disabled={isProcessing}
        hitSlop={12}
        className={`absolute bottom-[74.5px] left-10 h-15 w-15 items-center justify-center rounded-full bg-neutral-900/80 ${isProcessing ? 'opacity-40' : ''}`}
      >
        {/* #ffffff = neutral-00 */}
        <GalleryIcon width={26} height={26} color="#ffffff" />
      </Pressable>

      <Pressable
        onPress={handleCapture}
        disabled={!isCameraReady || isProcessing}
        className={`absolute bottom-16.75 left-39.75 h-18.75 w-18.75 items-center justify-center rounded-full bg-neutral-00 ${!isCameraReady || isProcessing ? 'opacity-40' : ''}`}
      >
        <View className="h-15 w-15 rounded-full border-[3px] border-neutral-900" />
      </Pressable>
    </View>
  );
}
