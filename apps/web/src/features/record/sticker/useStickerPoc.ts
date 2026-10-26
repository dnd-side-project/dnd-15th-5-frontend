import { useEffect, useRef, useState } from 'react';

import type { StickerPhotoSource } from '@/features/record/types';
import { isNativeApp, requestToNative } from '@/shared/lib/bridge';

import { createPhotoSticker } from './createPhotoSticker';
import { disposeStickerBackground, prepareStickerBackground } from './removeStickerBackground';
import { cropStickerImage, validateStickerFile } from './stickerImage';

import type { StickerCrop } from './stickerImage';

type Stage = 'select' | 'crop' | 'preview' | 'record';
type PendingAction = 'capture' | 'crop' | 'process' | null;
type Result = {
  original: string;
  sticker: string;
};

export const useStickerPoc = () => {
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [cropSource, setCropSource] = useState<{ file: File; url: string } | null>(null);
  const [stage, setStage] = useState<Stage>('select');
  const [result, setResult] = useState<Result | null>(null);
  const [recordResult, setRecordResult] = useState<Result | null>(null);
  const [original, setOriginal] = useState('');
  const [photoSource, setPhotoSource] = useState<StickerPhotoSource>('gallery');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const controller = useRef<AbortController | null>(null);
  const urls = useRef<string[]>([]);
  const lastFile = useRef<File | null>(null);
  const isCapturing = pendingAction === 'capture';
  const isCropping = pendingAction === 'crop';
  const isProcessing = pendingAction === 'process';

  // NOTE: 촬영·자르기·합성을 하나의 취소 신호로 이어 늦은 결과가 새 화면을 덮지 않도록 한다.
  const startRequest = (action: PendingAction = null) => {
    controller.current?.abort();
    const request = new AbortController();
    controller.current = request;
    setPendingAction(action);
    setError('');
    setMessage('');
    return request;
  };
  const finishRequest = (request: AbortController) => {
    if (!request.signal.aborted) setPendingAction(null);
  };
  const createUrl = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    urls.current.push(url);
    return url;
  };
  const releaseUrls = (keep: string[] = []) => {
    urls.current = urls.current.filter((url) => {
      if (keep.includes(url)) return true;
      URL.revokeObjectURL(url);
      return false;
    });
  };
  const keepRecordUrls = () =>
    releaseUrls(recordResult ? [recordResult.original, recordResult.sticker] : []);
  const commitResult = (next: Result) => {
    releaseUrls([next.original, next.sticker]);
    setRecordResult(next);
    setResult(next);
    setStage('record');
  };
  useEffect(() => {
    prepareStickerBackground();
    return () => {
      controller.current?.abort();
      disposeStickerBackground();
      releaseUrls();
    };
  }, []);

  const validateImage = (file: File) => {
    try {
      validateStickerFile(file);
      return true;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '사진을 확인해주세요.');
      return false;
    }
  };

  const processImage = async (file: File, request: AbortController, source: StickerPhotoSource) => {
    lastFile.current = file;
    setPhotoSource(source);
    keepRecordUrls();
    const originalUrl = createUrl(file);
    setCropSource(null);
    setPendingAction('process');
    setOriginal(originalUrl);
    setResult(null);
    setStage('preview');
    try {
      const sticker = await createPhotoSticker(file, request.signal, (progress) => {
        if (!request.signal.aborted) setMessage(progress);
      });
      if (request.signal.aborted) return;
      setResult({
        original: originalUrl,
        sticker: createUrl(sticker),
      });
    } catch (cause) {
      if (!request.signal.aborted)
        setError(
          cause instanceof Error ? cause.message : '스티커를 만들지 못했어요. 다시 시도해주세요.'
        );
    } finally {
      finishRequest(request);
    }
  };

  /** 가져온 사진은 바로 스티커로 만들지 않고 자르기 화면을 먼저 보여준다. */
  const openCrop = (file: File) => {
    if (!validateImage(file)) return;
    startRequest();
    prepareStickerBackground();
    keepRecordUrls();
    setCropSource({ file, url: createUrl(file) });
    setOriginal('');
    setResult(null);
    setStage('crop');
  };

  const confirmCrop = async (crop: StickerCrop) => {
    if (!cropSource || isCropping) return;
    const request = startRequest('crop');
    try {
      const file = await cropStickerImage(cropSource.file, crop);
      if (request.signal.aborted) return;
      await processImage(file, request, 'gallery');
    } catch (cause) {
      if (!request.signal.aborted)
        setError(cause instanceof Error ? cause.message : '사진을 자르지 못했어요.');
    } finally {
      finishRequest(request);
    }
  };

  const capturePhoto = async () => {
    if (!isNativeApp() || isCapturing) return;
    const request = startRequest('capture');
    prepareStickerBackground();
    try {
      const photo = await requestToNative('captureStickerPhoto', {});
      if (request.signal.aborted) return;
      if (photo.status === 'cancelled') return;
      if (photo.status === 'permissionDenied') {
        setError('앱 설정에서 카메라 권한을 허용한 뒤 다시 촬영해주세요.');
        return;
      }
      const bytes = Uint8Array.from(atob(photo.base64), (character) => character.charCodeAt(0));
      await processImage(
        new File([bytes], 'sticker-photo.jpg', { type: photo.mimeType }),
        request,
        'camera'
      );
    } catch (cause) {
      if (!request.signal.aborted)
        setError(cause instanceof Error ? cause.message : '카메라를 열지 못했어요.');
    } finally {
      finishRequest(request);
    }
  };

  const reset = () => {
    controller.current?.abort();
    controller.current = null;
    setPendingAction(null);
    if (isProcessing) disposeStickerBackground();
    releaseUrls();
    lastFile.current = null;
    setCropSource(null);
    setOriginal('');
    setResult(null);
    setRecordResult(null);
    setPhotoSource('gallery');
    setError('');
    setMessage('');
    setStage('select');
  };

  const cancelImageSelection = () => {
    if (!recordResult) {
      reset();
      return;
    }
    startRequest();
    if (isProcessing) disposeStickerBackground();
    keepRecordUrls();
    setCropSource(null);
    setOriginal(recordResult.original);
    setResult(recordResult);
    setStage('record');
  };

  const retry = () => {
    const file = lastFile.current;
    if (file && validateImage(file)) void processImage(file, startRequest(), photoSource);
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
    recordResult,
    original,
    photoSource,
    isProcessing,
    message,
    error,
    reset,
    cancelImageSelection,
    retry,
    confirm: () => {
      if (result) commitResult(result);
    },
  };
};
