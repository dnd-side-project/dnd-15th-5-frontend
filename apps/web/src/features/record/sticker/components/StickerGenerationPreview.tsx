import type { StickerPhotoSource } from '@/features/record/types';

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
};

/** 스티커 생성 진행 상황과 결과를 표시하고 입력 경로에 맞는 재선택 동작을 제공합니다. */
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
}: StickerGenerationPreviewProps) {
  const reselectLabel = photoSource === 'camera' ? '다시 찍기' : '사진 다시 고르기';

  return (
    <>
      <div className="relative flex h-[calc(100dvh-312px)] min-h-80 items-center justify-center overflow-hidden">
        {original && (
          <img
            src={original}
            alt="선택한 원본 사진"
            className="absolute inset-0 size-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-neutral-900/60" />
        {sticker && (
          <img
            src={sticker}
            alt="흰색 테두리가 적용된 스티커"
            className="relative size-40 object-contain"
          />
        )}
        {isProcessing && (
          <div role="status" className="relative px-8 text-center">
            <div className="mx-auto mb-5 size-8 animate-spin rounded-full border-2 border-neutral-00 border-t-transparent" />
            <p>{message}</p>
          </div>
        )}
      </div>
      <div className="flex min-h-44.5 flex-col justify-end gap-4 px-4 pt-5 pb-[max(32px,env(safe-area-inset-bottom))]">
        {error && (
          <div role="alert" className="text-body-02-regular">
            <p>{error}</p>
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
            {isProcessing ? '취소' : reselectLabel}
          </button>
          <button
            type="button"
            disabled={!sticker || isProcessing || isCapturing}
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
