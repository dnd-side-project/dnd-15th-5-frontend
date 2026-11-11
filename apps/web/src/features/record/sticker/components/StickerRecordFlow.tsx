import { RECORD_EXIT_CONFIRM_TEXT } from '@chapchap/shared/record';
import { useEffect, useRef, useState } from 'react';

import { STICKER_FLOW_HEADER_HEIGHT_CLASS } from '@/features/record/sticker/constants';
import { useStickerRecordFlow } from '@/features/record/sticker/hooks/useStickerRecordFlow';
import type {
  StickerRecordDraft,
  StickerRecordInitialValue,
  StickerRecordMedia,
} from '@/features/record/types';
import { isDefaultStickerMedia } from '@/features/record/utils/isDefaultStickerMedia';
import { isNativeApp } from '@/shared/lib/bridge';
import { cn } from '@/shared/lib/cn';
import { UnsavedChangesDialog } from '@/shared/ui/dialog';

import DefaultStickerPicker from './DefaultStickerPicker';
import ImageChangeSheet from './ImageChangeSheet';
import StickerCropper from './StickerCropper';
import StickerFlowHeader from './StickerFlowHeader';
import StickerGenerationPreview from './StickerGenerationPreview';
import StickerRecordPreview from './StickerRecordPreview';
import StickerSourcePicker from './StickerSourcePicker';

import type { ReceiptScanData } from '@chapchap/shared/bridge';
import type { RecordCategory, VisitDateTimeValue } from '@chapchap/shared/record';
import type { ShopSearchResult } from '@chapchap/shared/shop';
import type { ChangeEvent } from 'react';

type StickerRecordFlowProps = {
  initialValue?: StickerRecordInitialValue;
  onDirtyChange?: (dirty: boolean) => void;
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
  initialValue,
  onDirtyChange,
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
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false);
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
    backToSourceSelection,
    cancelImageSelection,
    retry,
    confirm,
    openDefaultStickers,
    selectDefaultSticker,
  } = useStickerRecordFlow(initialValue);
  const hasMediaChanges = Boolean(initialValue && recordResult?.source !== 'saved');
  const hasPendingPhoto = Boolean(initialValue && (stage === 'crop' || stage === 'preview'));
  const hasChanges = isFormDirty || hasMediaChanges || hasPendingPhoto;
  const defaultStickerCategory =
    recordResult && isDefaultStickerMedia(recordResult) ? recordResult.category : undefined;
  useEffect(() => {
    onDirtyChange?.(hasChanges);
  }, [hasChanges, onDirtyChange]);
  const isPreview = stage === 'preview';
  const isDark = isPreview || stage === 'crop';
  const isChangingImage = Boolean(recordResult) && stage !== 'record' && stage !== 'select';
  const handleRequestClose = () => {
    // NOTE: 기존 기록 수정은 상위 라우트의 변경 확인을 사용해 확인창이 중복되지 않도록 한다.
    if (initialValue || (stage === 'select' && !recordResult)) {
      onClose();
      return;
    }
    setIsExitConfirmOpen(true);
  };
  const handleStepClose = isChangingImage ? cancelImageSelection : handleRequestClose;
  const handleExit = () => {
    // NOTE: 홈 전환 전 중간 화면이 보이지 않도록 상태를 유지하고, 정리는 훅의 언마운트에서 처리한다.
    onClose();
  };
  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) openCrop(file);
  };
  const handleImportImage = () => galleryInput.current?.click();
  const handleCapturePhoto = () => void capturePhoto();

  return (
    <>
      <main
        inert={isExitConfirmOpen}
        className={cn(
          'relative flex min-h-dvh flex-col [--sticker-primary:var(--color-primary-500)] [&_button:disabled:not([data-disabled])]:cursor-default [&_button:disabled:not([data-disabled])]:opacity-45 [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-offset-4 [&_button:focus-visible]:outline-primary-500',
          isDark && 'h-dvh overflow-hidden',
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
            initialSticker={
              recordResult && isDefaultStickerMedia(recordResult)
                ? (recordResult.defaultSticker ?? null)
                : undefined
            }
            onClose={handleStepClose}
            onBack={backToSourceSelection}
            isChangingImage={isChangingImage}
            onConfirm={(sticker) => void selectDefaultSticker(sticker)}
            isProcessing={isProcessing}
            error={error}
          />
        )}
        {(stage === 'select' || (isPreview && photoSource === 'camera')) && (
          <div
            className={cn(
              'relative shrink-0',
              isPreview
                ? STICKER_FLOW_HEADER_HEIGHT_CLASS
                : 'h-[max(7rem,calc(env(safe-area-inset-top)+4rem))]'
            )}
          >
            <StickerFlowHeader
              title={isPreview ? '스티커 생성' : undefined}
              tone={isPreview ? 'inverse' : undefined}
              onClose={stage === 'select' ? handleRequestClose : handleStepClose}
              isChangingImage={isChangingImage}
            />
          </div>
        )}
        {stage === 'crop' && cropSource && (
          <StickerCropper
            key={cropSource.url}
            src={cropSource.url}
            isCropping={isCropping}
            onCancel={handleStepClose}
            closeButtonLabel={isChangingImage ? '사진 변경 취소' : '기록 닫고 홈으로 이동'}
            onReselect={handleImportImage}
            onConfirm={(crop) => void confirmCrop(crop)}
          />
        )}
        {stage === 'select' && (
          <StickerSourcePicker
            isCapturing={isCapturing}
            onCapture={isApp ? handleCapturePhoto : undefined}
            onImportImage={handleImportImage}
            onSelectDefaultSticker={openDefaultStickers}
            onResumeRecord={recordResult ? cancelImageSelection : undefined}
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
            onCancel={isChangingImage ? cancelImageSelection : backToSourceSelection}
            onClose={handleStepClose}
            onBack={backToSourceSelection}
            isChangingImage={isChangingImage}
            isPaused={isExitConfirmOpen}
            onRetry={retry}
            onReselect={handleCapturePhoto}
            onConfirm={confirm}
          />
        )}
        {recordResult && (
          <div hidden={stage !== 'record'} inert={isImageChangeOpen}>
            <StickerRecordPreview
              sticker={recordResult.sticker}
              isDefaultSticker={defaultStickerCategory !== undefined}
              defaultStickerCategory={defaultStickerCategory}
              onChangeImage={() => setIsImageChangeOpen(true)}
              onBack={initialValue ? onClose : backToSourceSelection}
              onClose={handleRequestClose}
              onSearchShop={onSearchShop}
              onScanReceipt={onScanReceipt}
              onReceiptShopSelected={onReceiptShopSelected}
              onSubmit={onSubmit ? (draft) => onSubmit(recordResult, draft) : undefined}
              isSubmitting={isSubmitting}
              submitError={submitError}
              selectedShop={selectedShop}
              initialCategory={initialCategory}
              initialVisitDateTime={initialVisitDateTime}
              initialDraft={initialValue?.draft}
              isEditing={Boolean(initialValue)}
              hasMediaChanges={hasMediaChanges}
              onDirtyChange={setIsFormDirty}
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
          <p role="alert" className="px-4 pb-5 text-body-02-regular text-red">
            {error}
          </p>
        )}
      </main>
      {isExitConfirmOpen && (
        <UnsavedChangesDialog
          title={RECORD_EXIT_CONFIRM_TEXT.title}
          description={RECORD_EXIT_CONFIRM_TEXT.description}
          exitLabel={RECORD_EXIT_CONFIRM_TEXT.exit}
          continueLabel={RECORD_EXIT_CONFIRM_TEXT.continue}
          onExit={handleExit}
          onContinue={() => setIsExitConfirmOpen(false)}
        />
      )}
    </>
  );
}
