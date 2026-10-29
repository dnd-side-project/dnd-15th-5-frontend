import { useRef, useState } from 'react';

import type { StickerRecordDraft, StickerRecordMedia } from '@/features/record/types';
import { CloseIcon } from '@/shared/assets/icons';
import { isNativeApp } from '@/shared/lib/bridge';
import { cn } from '@/shared/lib/cn';

import DefaultStickerPicker from './DefaultStickerPicker';
import ImageChangeSheet from './ImageChangeSheet';
import StickerCropper from './StickerCropper';
import StickerGenerationPreview from './StickerGenerationPreview';
import StickerRecordPreview from './StickerRecordPreview';
import StickerSourcePicker from './StickerSourcePicker';
import { useStickerRecordFlow } from './useStickerRecordFlow';

import type { ReceiptScanData } from '@chapchap/shared/bridge';
import type { RecordCategory, VisitDateTimeValue } from '@chapchap/shared/record';
import type { ShopSearchResult } from '@chapchap/shared/shop';
import type { ChangeEvent } from 'react';

type StickerRecordFlowProps = {
  onClose: () => void;
  onSearchShop?: () => void;
  onScanReceipt?: () => Promise<ReceiptScanData | null> | void;
  onReceiptShopSelected?: (shop: ShopSearchResult) => void;
  onSubmit?: (media: StickerRecordMedia, draft: StickerRecordDraft) => void;
  isSubmitting?: boolean;
  submitError?: string;
  selectedShop?: ShopSearchResult | null;
  initialCategory?: RecordCategory;
  initialVisitDateTime?: VisitDateTimeValue;
  isOpeningReceipt?: boolean;
  receiptError?: string;
};

export default function StickerRecordFlow({
  onClose,
  onSearchShop,
  onScanReceipt,
  onReceiptShopSelected,
  onSubmit,
  isSubmitting,
  submitError,
  selectedShop,
  initialCategory,
  initialVisitDateTime,
  isOpeningReceipt,
  receiptError,
}: StickerRecordFlowProps) {
  const isApp = isNativeApp();
  const galleryInput = useRef<HTMLInputElement>(null);
  const [isImageChangeOpen, setIsImageChangeOpen] = useState(false);
  const {
    stage,
    isCapturing,
    capturePhoto,
    result,
    recordResult,
    original,
    photoSource,
    isProcessing,
    message,
    error,
    cropSource,
    isCropping,
    openCrop,
    confirmCrop,
    reset,
    cancelImageSelection,
    retry,
    confirm,
    openDefaultStickers,
    selectDefaultSticker,
  } = useStickerRecordFlow();
  const isPreview = stage === 'preview';
  const isDark = isPreview || stage === 'crop';
  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) openCrop(file);
  };
  const handleImportImage = () => galleryInput.current?.click();
  const handleCapturePhoto = () => void capturePhoto();
  const handleRetake = photoSource === 'camera' ? handleCapturePhoto : handleImportImage;

  return (
    <main
      className={cn(
        'flex min-h-dvh flex-col [--sticker-primary:var(--color-primary-500)] [&_button:disabled:not([data-disabled])]:cursor-default [&_button:disabled:not([data-disabled])]:opacity-45 [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-offset-4 [&_button:focus-visible]:outline-primary-500',
        isDark ? 'bg-neutral-700 text-neutral-00' : 'bg-neutral-00 text-neutral-700'
      )}
    >
      <input
        ref={galleryInput}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleImageChange}
        className="hidden"
        aria-label="사진 가져오기"
      />
      {stage === 'default' && (
        <DefaultStickerPicker
          onClose={cancelImageSelection}
          onConfirm={(sticker) => void selectDefaultSticker(sticker)}
          isProcessing={isProcessing}
          error={error}
        />
      )}
      {(stage === 'select' || isPreview) && (
        <header className={cn('relative shrink-0', isPreview ? 'h-33.5' : 'h-28')}>
          {isPreview && (
            <h1 className="absolute inset-x-14 top-19.25 text-center text-title-02-semibold leading-6.25">
              스티커 생성
            </h1>
          )}
          <button
            type="button"
            className="absolute top-19.25 right-4 grid size-6 place-items-center"
            aria-label="닫기"
            onClick={onClose}
          >
            <CloseIcon className="size-4" aria-hidden="true" />
          </button>
        </header>
      )}
      {stage === 'crop' && cropSource && (
        <StickerCropper
          key={cropSource.url}
          src={cropSource.url}
          isCropping={isCropping}
          onCancel={cancelImageSelection}
          onConfirm={(crop) => void confirmCrop(crop)}
        />
      )}
      {stage === 'select' && (
        <StickerSourcePicker
          isCapturing={isCapturing}
          onCapture={isApp ? handleCapturePhoto : undefined}
          onImportImage={handleImportImage}
          onSelectDefaultSticker={openDefaultStickers}
        />
      )}
      {isPreview && (
        <StickerGenerationPreview
          original={original}
          sticker={result?.sticker}
          photoSource={photoSource}
          isProcessing={isProcessing}
          isCapturing={isCapturing}
          message={message}
          error={error}
          onCancel={cancelImageSelection}
          onRetry={retry}
          onReselect={handleRetake}
          onConfirm={confirm}
        />
      )}
      {recordResult && (
        <div hidden={stage !== 'record'} inert={isImageChangeOpen}>
          <StickerRecordPreview
            sticker={recordResult.sticker}
            isDefaultSticker={recordResult.source === 'default'}
            defaultStickerCategory={
              recordResult.source === 'default' ? recordResult.category : undefined
            }
            onChangeImage={() => setIsImageChangeOpen(true)}
            onBack={reset}
            onClose={onClose}
            onSearchShop={onSearchShop}
            onScanReceipt={onScanReceipt}
            onReceiptShopSelected={onReceiptShopSelected}
            onSubmit={onSubmit ? (draft) => onSubmit(recordResult, draft) : undefined}
            isSubmitting={isSubmitting}
            submitError={submitError}
            selectedShop={selectedShop}
            initialCategory={initialCategory}
            initialVisitDateTime={initialVisitDateTime}
            isOpeningReceipt={isOpeningReceipt}
            receiptError={receiptError}
            imageError={stage === 'record' ? error : ''}
            isCapturing={isCapturing}
          />
        </div>
      )}
      {isImageChangeOpen && stage === 'record' && (
        <ImageChangeSheet
          onClose={() => setIsImageChangeOpen(false)}
          onTakePhoto={isApp ? handleCapturePhoto : undefined}
          onImportImage={handleImportImage}
          onSelectDefaultSticker={openDefaultStickers}
        />
      )}
      {(stage === 'select' || stage === 'crop') && error && (
        <p role="alert" className="px-4 pb-5 text-body-02-regular text-notification">
          {error}
        </p>
      )}
    </main>
  );
}
