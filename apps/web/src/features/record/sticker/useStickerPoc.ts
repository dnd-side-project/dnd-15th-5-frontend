import { useEffect, useRef, useState } from 'react';

import defaultSticker from '@/shared/assets/images/stickers/img-sticker-coffee.png';
import { isNativeApp, requestToNative } from '@/shared/lib/bridge';
import { IS_DEVELOPMENT } from '@/shared/lib/env';

import {
  disposeStickerBackground,
  prepareStickerBackground,
  removeStickerBackground,
} from './removeStickerBackground';
import {
  composeSticker,
  cropStickerImage,
  prepareStickerImage,
  validateStickerFile,
} from './stickerImage';

import type { StickerCrop } from './stickerImage';

type Stage = 'select' | 'crop' | 'preview' | 'record';
type Result = { original: string; sticker: string; elapsed: number };

export const useStickerPoc = () => {
  const [isCapturing, setIsCapturing] = useState(false);
  // NOTE: 카메라 대기·자르기 중 화면을 초기화하거나 나가면 늦게 끝난 요청을 무시하기 위한 식별자다.
  const inputRequest = useRef(0);
  const [cropSource, setCropSource] = useState<{ file: File; url: string } | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [stage, setStage] = useState<Stage>('select');
  const [result, setResult] = useState<Result | null>(null);
  const [original, setOriginal] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const controller = useRef<AbortController | null>(null);
  const urls = useRef<string[]>([]);
  const lastFile = useRef<File | null>(null);

  const releaseUrls = () => {
    urls.current.forEach(URL.revokeObjectURL);
    urls.current = [];
  };
  useEffect(() => {
    prepareStickerBackground();
    return () => {
      inputRequest.current += 1;
      controller.current?.abort();
      disposeStickerBackground();
      releaseUrls();
    };
  }, []);

  const selectImage = async (file: File) => {
    inputRequest.current += 1;
    setIsCapturing(false);
    try {
      validateStickerFile(file);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '사진을 확인해주세요.');
      return;
    }
    controller.current?.abort();
    const request = new AbortController();
    controller.current = request;
    lastFile.current = file;
    releaseUrls();
    const originalUrl = URL.createObjectURL(file);
    urls.current.push(originalUrl);
    setOriginal(originalUrl);
    setResult(null);
    setError('');
    setStage('preview');
    setIsProcessing(true);
    setMessage('사진을 준비하고 있어요');
    const startedAt = performance.now();
    try {
      const image = await prepareStickerImage(file);
      if (request.signal.aborted) return;
      const preparedAt = performance.now();
      setMessage('사진에서 배경을 지우고 있어요');
      const foreground = await removeStickerBackground(image, request.signal, setMessage);
      if (request.signal.aborted) return;
      const removedAt = performance.now();
      setMessage('흰색 테두리를 만들고 있어요');
      const sticker = await composeSticker(foreground);
      if (request.signal.aborted) return;
      const completedAt = performance.now();
      if (IS_DEVELOPMENT) {
        // eslint-disable-next-line no-console -- PC 실측에서 느린 단계를 구분하기 위한 개발용 시간 로그입니다.
        console.info('[스티커 처리 시간]', {
          unit: 'ms',
          prepare: Math.round(preparedAt - startedAt),
          backgroundRemoval: Math.round(removedAt - preparedAt),
          compose: Math.round(completedAt - removedAt),
          total: Math.round(completedAt - startedAt),
        });
      }
      const stickerUrl = URL.createObjectURL(sticker);
      urls.current.push(stickerUrl);
      setResult({
        original: originalUrl,
        sticker: stickerUrl,
        elapsed: completedAt - startedAt,
      });
    } catch (cause) {
      if (!request.signal.aborted)
        setError(
          cause instanceof Error ? cause.message : '스티커를 만들지 못했어요. 다시 시도해주세요.'
        );
    } finally {
      if (!request.signal.aborted) setIsProcessing(false);
    }
  };

  /** 가져온 사진은 바로 스티커로 만들지 않고 자르기 화면을 먼저 보여준다. */
  const openCrop = (file: File) => {
    inputRequest.current += 1;
    setIsCapturing(false);
    try {
      validateStickerFile(file);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '사진을 확인해주세요.');
      return;
    }
    controller.current?.abort();
    prepareStickerBackground();
    releaseUrls();
    const url = URL.createObjectURL(file);
    urls.current.push(url);
    setCropSource({ file, url });
    setResult(null);
    setError('');
    setStage('crop');
  };

  const confirmCrop = async (crop: StickerCrop) => {
    if (!cropSource || isCropping) return;
    const requestId = ++inputRequest.current;
    setIsCropping(true);
    setError('');
    try {
      const file = await cropStickerImage(cropSource.file, crop);
      if (requestId !== inputRequest.current) return;
      setCropSource(null);
      void selectImage(file);
    } catch (cause) {
      if (requestId === inputRequest.current)
        setError(cause instanceof Error ? cause.message : '사진을 자르지 못했어요.');
    } finally {
      if (requestId === inputRequest.current) setIsCropping(false);
    }
  };

  const capturePhoto = async () => {
    if (!isNativeApp() || isCapturing) return;
    const requestId = ++inputRequest.current;
    setIsCapturing(true);
    prepareStickerBackground();
    setError('');
    try {
      const photo = await requestToNative('captureStickerPhoto', {});
      if (requestId !== inputRequest.current) return;
      if (photo.status === 'cancelled') return;
      if (photo.status === 'permissionDenied') {
        setError('앱 설정에서 카메라 권한을 허용한 뒤 다시 촬영해주세요.');
        return;
      }
      const bytes = Uint8Array.from(atob(photo.base64), (character) => character.charCodeAt(0));
      await selectImage(new File([bytes], 'sticker-photo.jpg', { type: photo.mimeType }));
    } catch (cause) {
      if (requestId === inputRequest.current)
        setError(cause instanceof Error ? cause.message : '카메라를 열지 못했어요.');
    } finally {
      if (requestId === inputRequest.current) setIsCapturing(false);
    }
  };

  const reset = () => {
    inputRequest.current += 1;
    setIsCapturing(false);
    controller.current?.abort();
    if (isProcessing) disposeStickerBackground();
    releaseUrls();
    lastFile.current = null;
    setCropSource(null);
    setIsCropping(false);
    setOriginal('');
    setResult(null);
    setError('');
    setIsProcessing(false);
    setStage('select');
  };

  return {
    stage,
    isCapturing,
    cropSource,
    isCropping,
    openCrop,
    confirmCrop,
    capturePhoto,
    result,
    original,
    isProcessing,
    message,
    error,
    selectImage,
    reset,
    retry: () => {
      if (lastFile.current) void selectImage(lastFile.current);
    },
    selectDefaultSticker: () => {
      reset();
      setResult({ original: '', sticker: defaultSticker, elapsed: 0 });
      setStage('record');
    },
    confirm: () => {
      if (result) setStage('record');
    },
  };
};
