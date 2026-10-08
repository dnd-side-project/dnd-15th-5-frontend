import { Camera } from 'expo-camera';
import { router } from 'expo-router';

import type { BridgeResult } from '@chapchap/shared/bridge';

type PhotoResult = BridgeResult<'captureStickerPhoto'>;
type PendingCapture = {
  id: string;
  resolve: (result: PhotoResult) => void;
  timer: ReturnType<typeof setTimeout>;
};
let pending: PendingCapture | null = null;
let isOpening = false;
const CAPTURE_TIMEOUT = 4 * 60_000;

export const isStickerCaptureActive = (id: string) => pending?.id === id;

/** 화면 종료/촬영 완료가 같은 요청을 두 번 완료하지 않도록 식별자를 검사합니다. */
export const finishStickerCapture = (id: string, result: PhotoResult) => {
  if (!pending || pending.id !== id) return;
  const request = pending;
  pending = null;
  clearTimeout(request.timer);
  request.resolve(result);
};

/** 시안 기반 앱 카메라 화면을 열고 촬영/취소 결과를 WebView 요청에 반환합니다. */
export const captureStickerPhoto = async (): Promise<PhotoResult> => {
  if (isOpening || pending) throw new Error('카메라가 이미 열려 있어요.');
  isOpening = true;
  try {
    const permission = await Camera.requestCameraPermissionsAsync();
    if (!permission.granted) return { status: 'permissionDenied' };
    return await new Promise<PhotoResult>((resolve, reject) => {
      const id = Date.now().toString(36) + Math.random().toString(36).slice(2);
      const timer = setTimeout(
        () => finishStickerCapture(id, { status: 'cancelled' }),
        CAPTURE_TIMEOUT
      );
      pending = { id, resolve, timer };
      try {
        router.push({ pathname: '/sticker-camera', params: { captureId: id } });
      } catch (error) {
        clearTimeout(timer);
        pending = null;
        reject(error);
      }
    });
  } finally {
    isOpening = false;
  }
};
