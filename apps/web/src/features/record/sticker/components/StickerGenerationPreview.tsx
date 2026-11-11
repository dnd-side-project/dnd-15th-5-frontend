import { useState } from 'react';

import type { StickerPhotoSource } from '@/features/record/types';
import { Button } from '@/shared/ui/button';
import { Spinner } from '@/shared/ui/spinner';

import StickerFlowHeader from './StickerFlowHeader';
import StickerReveal from './StickerReveal';

type StickerGenerationPreviewProps = {
  original: string;
  sticker?: string;
  photoSource: StickerPhotoSource;
  isProcessing: boolean;
  isCapturing: boolean;
  message: string;
  error: string;
  onCancel: () => void;
  onRetry: () => void;
  onReselect: () => void;
  onConfirm: () => void;
  onClose?: () => void;
  onBack?: () => void;
  isChangingImage?: boolean;
  isPaused?: boolean;
};

/** 생성 상태와 실패 복구 UI를 공유하며, 갤러리는 모션 후 자동 확정하고 촬영은 사용자의 확정을 기다립니다. */
export default function StickerGenerationPreview({
  original,
  sticker,
  photoSource,
  isProcessing,
  isCapturing,
  message,
  error,
  onCancel,
  onRetry,
  onReselect,
  onConfirm,
  onClose,
  onBack,
  isChangingImage,
  isPaused,
}: StickerGenerationPreviewProps) {
  const isGallery = photoSource === 'gallery';
  const [failedSticker, setFailedSticker] = useState('');
  const previewError =
    error ||
    (sticker && failedSticker === sticker ? '스티커를 불러오지 못했어요. 다시 시도해주세요.' : '');

  return (
    <>
      <section
        aria-label="스티커 생성"
        className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden"
      >
        {original && (
          <img
            src={original}
            alt="선택한 원본 사진"
            className="absolute inset-0 size-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-neutral-900/60" />
        {isGallery && (
          <StickerFlowHeader
            title="스티커 생성"
            tone="inverse"
            onClose={onClose ?? onCancel}
            onBack={onBack}
            isChangingImage={isChangingImage}
            className="z-sticky-header"
          />
        )}
        {sticker && !previewError && (
          <StickerReveal
            src={sticker}
            isPaused={isPaused || isProcessing}
            onComplete={isGallery ? onConfirm : undefined}
            onError={() => setFailedSticker(sticker)}
          />
        )}
        {isProcessing && (
          <div
            role="status"
            aria-label="스티커 생성 중"
            className="relative flex flex-col items-center gap-5 px-8 text-center"
          >
            <Spinner className="size-8 motion-reduce:animate-none" />
            <p>{message}</p>
          </div>
        )}
        {isGallery && previewError && (
          <div className="absolute inset-x-4 bottom-0 space-y-4 pb-[max(32px,env(safe-area-inset-bottom))]">
            <p role="alert" className="text-center text-body-02-regular">
              {previewError}
            </p>
            <Button onClick={onRetry}>다시 시도</Button>
          </div>
        )}
      </section>
      {!isGallery && (
        <div className="flex min-h-44.5 flex-col justify-end gap-4 px-4 pt-5 pb-[max(32px,env(safe-area-inset-bottom))]">
          {previewError && (
            <div role="alert" className="text-body-02-regular">
              <p>{previewError}</p>
              <button type="button" className="mt-2 underline" onClick={onRetry}>
                다시 시도
              </button>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={isCapturing}
              className="h-13.5 rounded-full bg-neutral-600 text-body-01-semibold leading-6 text-neutral-00"
              onClick={isProcessing ? onCancel : onReselect}
            >
              {isProcessing ? '취소' : '다시 찍기'}
            </button>
            <button
              type="button"
              disabled={!sticker || Boolean(previewError) || isProcessing || isCapturing}
              className="h-13.5 rounded-full bg-primary-500 text-body-01-semibold leading-6 text-neutral-00"
              onClick={onConfirm}
            >
              이 스티커 사용
            </button>
          </div>
        </div>
      )}
    </>
  );
}
