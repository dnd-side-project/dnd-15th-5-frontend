import { useRef, useState } from 'react';

import { captureStickerPhoto } from '@/features/record/camera/utils/captureStickerPhoto';
import {
  cropStickerImage,
  validateStickerFile,
} from '@/features/record/sticker/image/stickerImage';
import type { StickerCrop } from '@/features/record/sticker/image/stickerImage';
import { createPhotoSticker } from '@/features/record/sticker/utils/createPhotoSticker';
import { loadDefaultSticker } from '@/features/record/sticker/utils/loadDefaultSticker';
import type {
  StickerPhotoSource,
  StickerRecordInitialValue,
  StickerRecordMedia,
} from '@/features/record/types';
import type { DefaultSticker } from '@/shared/assets/images/ios-stickers/catalog';
import { isNativeApp } from '@/shared/lib/bridge';

import { useStickerImageTask } from './useStickerImageTask';

type CropSource = { file: File; url: string };
type PhotoInput = {
  file: File;
  source: StickerPhotoSource;
  cropSource?: CropSource;
  crop?: StickerCrop;
};
type StickerResult = StickerRecordMedia & {
  original: string;
  sticker: string;
  cropSource?: CropSource;
  photoSource?: StickerPhotoSource;
  crop?: StickerCrop;
  defaultSticker?: DefaultSticker;
};
type PreviewScreen = {
  stage: 'preview';
  input: PhotoInput & { cropSource: CropSource };
  original: string;
  result: StickerResult | null;
};
type StickerFlowScreen =
  | { stage: 'select' | 'default' | 'record' }
  | { stage: 'crop'; cropSource: CropSource; crop?: StickerCrop }
  | PreviewScreen;

type StickerRecordFlowOptions = {
  initialValue?: StickerRecordInitialValue;
  /** 앱 카메라에서 기록 종료를 선택했을 때 호출합니다. */
  onCaptureClose?: () => void;
  /** 가져온 사진의 스티커 생성이 실패해 자르기 화면으로 돌아갈 때 안내할 메시지를 전달합니다. */
  onGalleryStickerError?: (message: string) => void;
};

const CAMERA_PERMISSION_ERROR = '앱 설정에서 카메라 권한을 허용한 뒤 다시 촬영해주세요.';
const PHOTO_STICKER_ERROR = '스티커를 만들지 못했어요. 다시 시도해주세요.';

const getResultUrls = (result: StickerResult | null) =>
  result ? [result.original, result.sticker, result.cropSource?.url ?? ''] : [];

const getScreenUrls = (screen: StickerFlowScreen) => {
  if (screen.stage === 'crop') return [screen.cropSource.url];
  if (screen.stage === 'preview') {
    return [screen.original, screen.input.cropSource.url, ...getResultUrls(screen.result)];
  }
  return [];
};

const restoreSavedResult = (initial: StickerRecordInitialValue): StickerResult => ({
  ...initial.media,
  original: initial.sticker,
  sticker: initial.sticker,
  defaultSticker: initial.defaultSticker,
});

const isSavedDefaultSticker = (
  initial: StickerRecordInitialValue | undefined,
  sticker: DefaultSticker
): initial is StickerRecordInitialValue =>
  initial?.media.source === 'saved' &&
  initial.media.stickerItemId !== undefined &&
  initial.defaultSticker?.id === sticker.id;

/** 확정한 미디어를 만들었던 단계로 돌아가며, 촬영 결과는 다시 찍지 않고 미리보기로 복원합니다. */
const getMediaScreen = (result: StickerResult): StickerFlowScreen => {
  if (result.defaultSticker) return { stage: 'default' };
  if (!result.cropSource) return { stage: 'select' };
  if (result.photoSource === 'camera') {
    return {
      stage: 'preview',
      input: { file: result.cropSource.file, source: 'camera', cropSource: result.cropSource },
      original: result.original,
      result,
    };
  }
  return { stage: 'crop', cropSource: result.cropSource, crop: result.crop };
};

/**
 * 사진 촬영·자르기·스티커 생성과 기본 스티커 선택의 화면 전환을 관리합니다.
 *
 * 화면별 입력(`screen`)과 기록에 확정한 미디어(`recordResult`)를 분리해, 작업 화면을 오가도
 * 확정 미디어는 새 미디어를 확정하기 전까지 유지합니다. 화면을 옮길 때는 확정 미디어와
 * 다음 화면이 쓰는 blob URL만 남기고 해제합니다.
 * 비동기 작업 취소와 언마운트 시 URL 정리는 `useStickerImageTask`가 담당합니다.
 */
export const useStickerRecordFlow = ({
  initialValue,
  onCaptureClose,
  onGalleryStickerError,
}: StickerRecordFlowOptions = {}) => {
  const [screen, setScreen] = useState<StickerFlowScreen>({
    stage: initialValue ? 'record' : 'select',
  });
  const [recordResult, setRecordResult] = useState<StickerResult | null>(() =>
    initialValue ? restoreSavedResult(initialValue) : null
  );
  const task = useStickerImageTask();
  const isImageChangePausedRef = useRef(false);
  const pendingResultRef = useRef<StickerResult | null>(null);

  const showScreen = (next: StickerFlowScreen) => {
    task.releaseUrls([...getResultUrls(recordResult), ...getScreenUrls(next)]);
    setScreen(next);
  };
  const moveTo = (next: StickerFlowScreen) => {
    task.start();
    showScreen(next);
  };
  const applyResult = (result: StickerResult) => {
    task.releaseUrls(getResultUrls(result));
    setRecordResult(result);
    setScreen({ stage: 'record' });
  };
  const commitResult = (result: StickerResult) => {
    if (isImageChangePausedRef.current) {
      pendingResultRef.current = result;
      task.releaseUrls([...getResultUrls(recordResult), ...getResultUrls(result)]);
      return;
    }
    applyResult(result);
  };
  const validateImage = (file: File) => {
    try {
      validateStickerFile(file);
      return true;
    } catch (cause) {
      task.fail(cause, '사진을 확인해주세요.');
      return false;
    }
  };

  /** 가져온 사진은 생성 화면에 머무르지 않고, 같은 원본과 자르기 영역으로 돌아가 실패를 안내합니다. */
  const failGallerySticker = ({ cropSource, crop }: PreviewScreen['input']) => {
    moveTo({ stage: 'crop', cropSource, crop });
    onGalleryStickerError?.(PHOTO_STICKER_ERROR);
  };

  const processImage = (input: PhotoInput, request: AbortController) => {
    const isOriginalFile = input.cropSource?.file === input.file;
    const original =
      input.cropSource && isOriginalFile ? input.cropSource.url : task.createUrl(input.file);
    const preview: PreviewScreen = {
      stage: 'preview',
      input: { ...input, cropSource: input.cropSource ?? { file: input.file, url: original } },
      original,
      result: null,
    };
    task.continueAs(request, 'process');
    showScreen(preview);
    return task.run(request, PHOTO_STICKER_ERROR, async () => {
      let image: Blob;
      try {
        image = await createPhotoSticker(input.file, request.signal, (message) =>
          task.reportProgress(request, message)
        );
      } catch (cause) {
        if (input.source !== 'gallery' || request.signal.aborted) throw cause;
        failGallerySticker(preview.input);
        return;
      }
      if (request.signal.aborted) return;
      setScreen({
        ...preview,
        result: {
          source: 'photo',
          image,
          original,
          sticker: task.createUrl(image),
          cropSource: preview.input.cropSource,
          crop: input.crop,
          photoSource: input.source,
        },
      });
    });
  };

  /** 가져온 사진은 바로 스티커로 만들지 않고 자르기 화면을 먼저 보여줍니다. */
  const openCrop = (file: File) => {
    if (!validateImage(file)) return;
    task.prepareBackground();
    moveTo({ stage: 'crop', cropSource: { file, url: task.createUrl(file) } });
  };

  const confirmCrop = async (crop: StickerCrop) => {
    if (screen.stage !== 'crop' || task.isCropping) return;
    const { cropSource } = screen;
    const request = task.start('crop');
    await task.run(request, '사진을 자르지 못했어요.', async () => {
      const file = await cropStickerImage(cropSource.file, crop);
      if (request.signal.aborted) return;
      await processImage({ file, source: 'gallery', cropSource, crop }, request);
    });
  };

  const capturePhoto = async () => {
    if (!isNativeApp() || task.isCapturing) return;
    const request = task.start('capture');
    task.prepareBackground();
    await task.run(request, '카메라를 열지 못했어요.', async () => {
      const photo = await captureStickerPhoto({
        hasActiveRecord: Boolean(recordResult) || screen.stage === 'preview',
        ...(recordResult ? { isChangingImage: true } : {}),
      });
      if (request.signal.aborted) return;
      switch (photo.status) {
        case 'closed':
          if (recordResult) moveTo({ stage: 'record' });
          else onCaptureClose?.();
          return;
        case 'cancelled':
          return;
        case 'permissionDenied':
          throw new Error(CAMERA_PERMISSION_ERROR);
        case 'success':
          await processImage({ file: photo.file, source: 'camera' }, request);
      }
    });
  };

  const selectDefaultSticker = async (sticker: DefaultSticker) => {
    if (task.isProcessing) return;
    if (isSavedDefaultSticker(initialValue, sticker)) {
      task.start();
      commitResult(restoreSavedResult(initialValue));
      return;
    }
    const request = task.start('process');
    await task.run(request, '스티커를 만들지 못했어요.', async () => {
      const image = await loadDefaultSticker(sticker.image, request.signal);
      if (request.signal.aborted) return;
      commitResult({
        source: 'default',
        category: sticker.category,
        name: sticker.name,
        original: '',
        sticker: task.createUrl(image),
        defaultSticker: sticker,
      });
    });
  };

  const backToMediaSelection = () => {
    if (recordResult) moveTo(getMediaScreen(recordResult));
  };

  /** 촬영 결과 화면에서 생성을 취소하면 기록 방법 선택으로 돌아갑니다. */
  const cancelPreview = () => {
    if (screen.stage === 'preview') moveTo({ stage: 'select' });
  };

  /** 가져온 사진의 스티커 이미지를 표시하지 못한 경우도 생성 실패와 같게 처리합니다. */
  const failPreview = () => {
    if (screen.stage === 'preview' && screen.input.source === 'gallery') {
      failGallerySticker(screen.input);
    }
  };

  const retry = () => {
    if (screen.stage === 'preview' && validateImage(screen.input.file)) {
      void processImage(screen.input, task.start('process'));
    }
  };

  const confirm = () => {
    if (screen.stage === 'preview' && screen.result) commitResult(screen.result);
  };

  return {
    screen,
    recordResult,
    isCapturing: task.isCapturing,
    isCropping: task.isCropping,
    isProcessing: task.isProcessing,
    message: task.message,
    error: task.error,
    openCrop,
    /** 단계 이동·변경 취소·새 이미지 작업 시작 시 갤러리 응답도 함께 무효화합니다. */
    beginGallerySelection: () => task.start().signal,
    confirmCrop,
    capturePhoto,
    selectDefaultSticker,
    openDefaultStickers: () => moveTo({ stage: 'default' }),
    backToMediaSelection,
    pauseImageChange: () => {
      isImageChangePausedRef.current = true;
    },
    continueImageChange: () => {
      isImageChangePausedRef.current = false;
      const pending = pendingResultRef.current;
      pendingResultRef.current = null;
      if (pending) applyResult(pending);
    },
    cancelImageChange: () => {
      isImageChangePausedRef.current = false;
      pendingResultRef.current = null;
      moveTo({ stage: 'record' });
    },
    cancelPreview,
    failPreview,
    retry,
    confirm,
  };
};
