import { useEffect, useRef, useState } from 'react';

import { captureStickerPhoto } from '@/features/record/camera/utils/captureStickerPhoto';
import {
  disposeStickerBackground,
  prepareStickerBackground,
} from '@/features/record/sticker/background-removal/removeStickerBackground';
import {
  cropStickerImage,
  validateStickerFile,
} from '@/features/record/sticker/image/stickerImage';
import type { StickerCrop } from '@/features/record/sticker/image/stickerImage';
import { createPhotoSticker } from '@/features/record/sticker/utils/createPhotoSticker';
import { loadDefaultSticker } from '@/features/record/sticker/utils/loadDefaultSticker';
import type { StickerPhotoSource, StickerRecordMedia } from '@/features/record/types';
import type { DefaultSticker } from '@/shared/assets/images/ios-stickers/catalog';
import { isNativeApp } from '@/shared/lib/bridge';

type Stage = 'select' | 'default' | 'crop' | 'preview' | 'record';
type PendingAction = 'capture' | 'crop' | 'process' | null;
type CropSource = { file: File; url: string };
type Result = {
  original: string;
  sticker: string;
  cropSource?: CropSource;
  photoSource?: StickerPhotoSource;
  defaultSticker?: DefaultSticker;
} & StickerRecordMedia;

/**
 * 사진 촬영·자르기·스티커 생성과 기본 스티커 선택의 화면 전환 및 비동기 상태를 관리합니다.
 *
 * 새 요청이나 취소 시 이전 요청의 취소 신호를 활성화하고, 늦게 도착한 결과를 무시합니다.
 * 이미지 변경이 확정되기 전까지 기존 기록 결과를 유지해 선택 취소 시 복원합니다.
 * 사진 원본과 blob URL은 다시 자르기에 사용할 수 있도록 보관하며,
 * 새 결과 확정·초기화·언마운트 시 더 이상 필요하지 않은 URL을 해제합니다.
 * 반환된 blob URL의 수명은 이 훅에서 관리합니다.
 */
export const useStickerRecordFlow = () => {
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [cropSource, setCropSource] = useState<CropSource | null>(null);
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
  const lastCropSource = useRef<CropSource | null>(null);
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
  const getResultUrls = (value: Result | null) =>
    value ? [value.original, value.sticker, value.cropSource?.url ?? ''] : [];
  const keepRecordUrls = () => releaseUrls(getResultUrls(recordResult));
  const commitResult = (next: Result) => {
    releaseUrls(getResultUrls(next));
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

  const processImage = async (
    file: File,
    request: AbortController,
    source: StickerPhotoSource,
    sourceCrop?: CropSource
  ) => {
    lastFile.current = file;
    setPhotoSource(source);
    releaseUrls([...getResultUrls(recordResult), sourceCrop?.url ?? '']);
    const originalUrl = createUrl(file);
    const nextCropSource = sourceCrop ?? { file, url: originalUrl };
    lastCropSource.current = nextCropSource;
    setCropSource(nextCropSource);
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
        image: sticker,
        original: originalUrl,
        sticker: createUrl(sticker),
        source: 'photo',
        cropSource: nextCropSource,
        photoSource: source,
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
    setPhotoSource('gallery');
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
      await processImage(file, request, photoSource, cropSource);
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
      const photo = await captureStickerPhoto();
      if (request.signal.aborted) return;
      if (photo.status === 'cancelled') return;
      if (photo.status === 'permissionDenied') {
        setError('앱 설정에서 카메라 권한을 허용한 뒤 다시 촬영해주세요.');
        return;
      }
      await processImage(photo.file, request, 'camera');
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
    lastCropSource.current = null;
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
    setPhotoSource(recordResult.photoSource ?? 'gallery');
    setStage('record');
  };

  const backToImageSelection = () => {
    if (!recordResult) return;
    startRequest();
    keepRecordUrls();
    if (recordResult.source === 'default') {
      setStage('default');
      return;
    }
    setCropSource(recordResult.cropSource ?? null);
    setPhotoSource(recordResult.photoSource ?? 'gallery');
    setResult(null);
    setStage('crop');
  };

  const selectDefaultSticker = async (sticker: DefaultSticker) => {
    if (isProcessing) return;
    const request = startRequest('process');
    try {
      const stickerBlob = await loadDefaultSticker(sticker.image, request.signal);
      if (request.signal.aborted) return;
      commitResult({
        category: sticker.category,
        name: sticker.name,
        original: '',
        sticker: createUrl(stickerBlob),
        source: 'default',
        defaultSticker: sticker,
      });
    } catch (cause) {
      if (!request.signal.aborted) {
        setError(cause instanceof Error ? cause.message : '스티커를 만들지 못했어요.');
      }
    } finally {
      finishRequest(request);
    }
  };

  const retry = () => {
    const file = lastFile.current;
    if (file && validateImage(file))
      void processImage(file, startRequest(), photoSource, lastCropSource.current ?? undefined);
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
    backToImageSelection,
    retry,
    openDefaultStickers: () => {
      startRequest();
      keepRecordUrls();
      setStage('default');
    },
    selectDefaultSticker,
    confirm: () => {
      if (result) commitResult(result);
    },
  };
};
