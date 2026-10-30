import FlipIcon from '@chapchap/shared/assets/icons/ic-sticker-flip.svg';
import { CameraView } from 'expo-camera';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { finishStickerCapture, isStickerCaptureActive } from '@/native/sticker/captureStickerPhoto';
import { prepareStickerPhoto } from '@/native/sticker/prepareStickerPhoto';
import { CloseIcon } from '@/shared/assets/icons';
import { useCameraPinchZoom } from '@/shared/hooks/useCameraPinchZoom';

import type { BridgeResult } from '@chapchap/shared/bridge';

/** REC_Take picture의 393×852 시안을 기준으로 구성한 스티커 전용 카메라입니다. */
export default function StickerCameraScreen() {
  const { captureId = '' } = useLocalSearchParams<{ captureId: string }>();
  const insets = useSafeAreaInsets();
  const camera = useRef<CameraView>(null);
  const mounted = useRef(false);
  const processing = useRef(false);
  const capturedResult = useRef<BridgeResult<'captureStickerPhoto'> | null>(null);
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [isReady, setIsReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const { zoom, selectedLens, panHandlers, loadLenses, reset } = useCameraPinchZoom(camera);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      // StrictMode의 즉시 재마운트는 유지하고 실제 화면 이탈 시점에 결과를 전달한다.
      // 카메라가 해제되고 WebView가 다시 보인 뒤 웹의 배경 제거가 시작되도록 촬영 결과도 여기서 보낸다.
      void Promise.resolve().then(() => {
        if (!mounted.current)
          finishStickerCapture(captureId, capturedResult.current ?? { status: 'cancelled' });
      });
    };
  }, [captureId]);

  const handleClose = () => {
    finishStickerCapture(captureId, { status: 'cancelled' });
    router.back();
  };
  const handleCapture = async () => {
    if (!camera.current || !isReady || processing.current) return;
    if (!isStickerCaptureActive(captureId)) {
      setError('촬영 대기 시간이 지났어요. 닫고 다시 촬영해주세요.');
      return;
    }
    processing.current = true;
    setIsProcessing(true);
    setError('');
    let failureStage = '촬영';
    try {
      const photo = await camera.current.takePictureAsync();
      failureStage = '사진 변환';
      const result = await prepareStickerPhoto(photo);
      if (!mounted.current) return;
      if (!isStickerCaptureActive(captureId)) {
        setError('촬영 대기 시간이 지났어요. 닫고 다시 촬영해주세요.');
        return;
      }
      capturedResult.current = result;
      router.back();
    } catch (cause) {
      if (mounted.current) {
        const detail = cause instanceof Error ? cause.message : '알 수 없는 오류';
        setError(`${failureStage}에 실패했어요. ${detail}`);
      }
    } finally {
      processing.current = false;
      if (mounted.current) setIsProcessing(false);
    }
  };

  return (
    <View className="flex-1 bg-neutral-900">
      <View style={{ height: Math.max(134, insets.top + 86) }}>
        <Text
          className="absolute inset-x-14 text-center font-pretendard-semibold text-title-02-semibold text-neutral-00"
          style={{ top: Math.max(77, insets.top + 29) }}
        >
          촬영하기
        </Text>
        <Pressable
          onPress={handleClose}
          accessibilityRole="button"
          accessibilityLabel="촬영 닫기"
          hitSlop={12}
          className="absolute right-4 size-6 items-center justify-center"
          style={{ top: Math.max(77, insets.top + 29) }}
        >
          <CloseIcon width={16} height={16} color="#ffffff" />
        </Pressable>
      </View>
      <View style={{ flex: 1 }} {...panHandlers}>
        <CameraView
          key={facing}
          ref={camera}
          style={{ flex: 1 }}
          facing={facing}
          zoom={zoom}
          selectedLens={selectedLens}
          onCameraReady={() => {
            setIsReady(true);
            loadLenses();
          }}
          onMountError={({ message }) => {
            setIsReady(false);
            setError(`카메라를 시작하지 못했어요. ${message}`);
          }}
        />
      </View>
      <View style={{ height: Math.max(178, insets.bottom + 120) }}>
        {error && (
          <Text
            accessibilityRole="alert"
            className="px-4 pt-2 text-center font-pretendard-regular text-caption-01-regular text-neutral-00"
          >
            {error}
          </Text>
        )}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="스티커 사진 촬영"
          disabled={!isReady || isProcessing}
          onPress={() => void handleCapture()}
          className="absolute top-9 left-1/2 size-18.75 -translate-x-1/2 items-center justify-center rounded-full bg-neutral-00"
          style={{ opacity: !isReady || isProcessing ? 0.45 : 1 }}
        >
          <View className="size-16 rounded-full border-[3px] border-neutral-900" />
          {isProcessing && <ActivityIndicator className="absolute" color="#1f1f1f" />}
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="카메라 전환"
          disabled={isProcessing}
          onPress={() => {
            setIsReady(false);
            // NOTE: 렌즈 목록과 배율은 카메라마다 달라 전환할 때 기본값으로 되돌린다.
            reset();
            setFacing((value) => (value === 'back' ? 'front' : 'back'));
          }}
          className="absolute top-11.75 right-8.5 size-13.5 items-center justify-center rounded-full bg-neutral-700"
        >
          <FlipIcon width={32} height={32} color="#ffffff" />
        </Pressable>
      </View>
    </View>
  );
}
