import { router } from 'expo-router';

import { createCameraRequest } from '@/native/camera/createCameraRequest';

import type { BridgeResult } from '@chapchap/shared/bridge';

const stickerCamera = createCameraRequest<BridgeResult<'captureStickerPhoto'>>({
  open: (captureId) => router.push({ pathname: '/sticker-camera', params: { captureId } }),
  alreadyOpenMessage: '카메라가 이미 열려 있어요.',
});

export const isStickerCaptureActive = stickerCamera.isActive;
export const finishStickerCapture = stickerCamera.finish;

/** 앱 카메라 화면을 열고 촬영·취소 결과를 WebView 요청에 반환합니다. */
export const captureStickerPhoto = stickerCamera.request;
