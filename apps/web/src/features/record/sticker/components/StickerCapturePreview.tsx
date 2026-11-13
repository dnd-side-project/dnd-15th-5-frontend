import { useState } from 'react';

import StickerGenerationStage from './StickerGenerationStage';

type StickerCapturePreviewProps = {
  original: string;
  sticker?: string;
  isProcessing: boolean;
  isCapturing: boolean;
  message: string;
  error: string;
  isPaused?: boolean;
  onCancel: () => void;
  onRetry: () => void;
  onReselect: () => void;
  onConfirm: () => void;
};

const STICKER_LOAD_ERROR = '스티커를 불러오지 못했어요. 다시 시도해주세요.';

/** 촬영한 사진의 스티커를 보여주고, 사용자가 사용·다시 찍기·재시도를 직접 고르도록 합니다. */
export default function StickerCapturePreview({
  original,
  sticker,
  isProcessing,
  isCapturing,
  message,
  error,
  isPaused,
  onCancel,
  onRetry,
  onReselect,
  onConfirm,
}: StickerCapturePreviewProps) {
  const [failedSticker, setFailedSticker] = useState('');
  const previewError = error || (sticker && failedSticker === sticker ? STICKER_LOAD_ERROR : '');

  return (
    <>
      <StickerGenerationStage
        original={original}
        sticker={previewError ? undefined : sticker}
        isProcessing={isProcessing}
        message={message}
        isPaused={isPaused}
        onRevealError={() => setFailedSticker(sticker ?? '')}
      />
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
    </>
  );
}
