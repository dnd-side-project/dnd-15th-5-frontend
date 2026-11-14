import { useEffect, useState } from 'react';

import RecordExitDialog from '@/features/record/components/RecordExitDialog';
import { getStickerFlowLayout } from '@/features/record/sticker/constants';
import { useStickerGallery } from '@/features/record/sticker/hooks/useStickerGallery';
import { useStickerRecordExit } from '@/features/record/sticker/hooks/useStickerRecordExit';
import { useStickerRecordFlow } from '@/features/record/sticker/hooks/useStickerRecordFlow';
import type {
  StickerRecordDraft,
  StickerRecordInitialValue,
  StickerRecordMedia,
} from '@/features/record/types';
import { isDefaultStickerMedia } from '@/features/record/utils/isDefaultStickerMedia';
import { isNativeApp } from '@/shared/lib/bridge';
import { cn } from '@/shared/lib/cn';
import { useToast } from '@/shared/ui/toast';

import DefaultStickerPicker from './DefaultStickerPicker';
import ImageChangeSheet from './ImageChangeSheet';
import StickerCapturePreview from './StickerCapturePreview';
import StickerCropper from './StickerCropper';
import StickerFlowHeader from './StickerFlowHeader';
import StickerGenerationStage from './StickerGenerationStage';
import StickerRecordPreview from './StickerRecordPreview';
import StickerSourcePicker from './StickerSourcePicker';

import type { ReceiptScanData } from '@chapchap/shared/bridge';
import type { RecordCategory, VisitDateTimeValue } from '@chapchap/shared/record';
import type { ShopSearchResult } from '@chapchap/shared/shop';

type StickerRecordFlowProps = {
  initialValue?: StickerRecordInitialValue;
  onDirtyChange?: (dirty: boolean) => void;
  onClose: () => void;
  isExitBlocked?: boolean;
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
  isExitBlocked = false,
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
  const layout = getStickerFlowLayout(isApp);
  const [isImageChangeOpen, setIsImageChangeOpen] = useState(false);
  const [isImageExitConfirmOpen, setIsImageExitConfirmOpen] = useState(false);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const { showToast } = useToast();
  const {
    screen,
    recordResult,
    isCapturing,
    isCropping,
    isProcessing,
    message,
    error,
    openCrop,
    confirmCrop,
    capturePhoto,
    selectDefaultSticker,
    openDefaultStickers,
    backToMediaSelection,
    cancelImageChange,
    pauseImageChange,
    continueImageChange,
    cancelPreview,
    failPreview,
    retry,
    confirm,
  } = useStickerRecordFlow({
    initialValue,
    onCaptureClose: onClose,
    onGalleryStickerError: (message) => showToast({ type: 'error', message }),
  });
  const { stage } = screen;
  const preview = stage === 'preview' ? screen : null;
  const isCameraPreview = preview?.input.source === 'camera';
  const isDark = stage === 'preview' || stage === 'crop';
  const {
    isExitConfirmOpen,
    requestClose: requestRecordClose,
    continueWriting,
  } = useStickerRecordExit({
    isEditing: Boolean(initialValue),
    hasStarted: stage !== 'select' || Boolean(recordResult),
    onExit: onClose,
  });
  const isChangingImage = Boolean(recordResult) && stage !== 'record';
  const recordCloseButtonLabel = initialValue ? '기록 수정 종료' : '기록 닫고 홈으로 이동';
  const closeButtonLabel = isChangingImage ? '이미지 변경 종료' : recordCloseButtonLabel;
  const requestClose = () => {
    if (isChangingImage) {
      pauseImageChange();
      setIsImageExitConfirmOpen(true);
    } else requestRecordClose();
  };
  const hasMediaChanges = Boolean(initialValue && recordResult?.source !== 'saved');
  const hasPendingPhoto = isDark;
  const hasChanges =
    isFormDirty || hasMediaChanges || hasPendingPhoto || (!initialValue && recordResult !== null);
  const recordedDefaultSticker =
    recordResult && isDefaultStickerMedia(recordResult) ? recordResult : null;
  useEffect(() => {
    onDirtyChange?.(hasChanges);
  }, [hasChanges, onDirtyChange]);
  const {
    inputRef: galleryInput,
    handleChange: handleImageChange,
    openGallery: handleImportImage,
  } = useStickerGallery({
    isApp,
    onSelect: openCrop,
    onError: () =>
      showToast({ type: 'error', message: '이미지를 가져오지 못했어요. 다시 시도해주세요.' }),
  });
  const handleCapturePhoto = () => void capturePhoto();

  return (
    <>
      <main
        inert={isExitConfirmOpen || isExitBlocked || isImageExitConfirmOpen}
        className={cn(
          'relative flex min-h-dvh flex-col [--sticker-primary:var(--color-primary-500)] [&_button:disabled:not([data-disabled])]:cursor-default [&_button:disabled:not([data-disabled])]:opacity-45 [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-offset-4 [&_button:focus-visible]:outline-primary-500',
          isDark && 'h-dvh',
          stage === 'preview' && 'overflow-hidden',
          stage === 'crop' && 'overflow-x-hidden overflow-y-auto',
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
              recordedDefaultSticker ? (recordedDefaultSticker.defaultSticker ?? null) : undefined
            }
            onClose={requestClose}
            closeButtonLabel={closeButtonLabel}
            onConfirm={(sticker) => void selectDefaultSticker(sticker)}
            isProcessing={isProcessing}
            error={error}
          />
        )}
        {(stage === 'select' || isCameraPreview) && (
          <div
            className={cn(
              'relative shrink-0',
              isCameraPreview ? layout.headerHeight : layout.sourceHeaderHeight
            )}
          >
            <StickerFlowHeader
              title={isCameraPreview ? '스티커 생성' : undefined}
              tone={isCameraPreview ? 'inverse' : undefined}
              onClose={requestClose}
              closeButtonLabel={closeButtonLabel}
            />
          </div>
        )}
        {screen.stage === 'crop' && (
          <StickerCropper
            key={screen.cropSource.url}
            src={screen.cropSource.url}
            initialCrop={screen.crop}
            isCropping={isCropping}
            onCancel={requestClose}
            closeButtonLabel={closeButtonLabel}
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
          />
        )}
        {preview && isCameraPreview && (
          <StickerCapturePreview
            original={preview.original}
            sticker={preview.result?.sticker}
            isProcessing={isProcessing}
            isCapturing={isCapturing}
            message={message}
            error={error}
            isPaused={isExitConfirmOpen || isExitBlocked || isImageExitConfirmOpen}
            onCancel={cancelPreview}
            onRetry={retry}
            onReselect={handleCapturePhoto}
            onConfirm={confirm}
          />
        )}
        {preview && !isCameraPreview && (
          <StickerGenerationStage
            original={preview.original}
            sticker={preview.result?.sticker}
            isProcessing={isProcessing}
            message={message}
            isPaused={isExitConfirmOpen || isExitBlocked || isImageExitConfirmOpen}
            onRevealComplete={confirm}
            onRevealError={failPreview}
          />
        )}
        {recordResult && (
          <div hidden={stage !== 'record'} inert={isImageChangeOpen}>
            <StickerRecordPreview
              sticker={recordResult.sticker}
              isDefaultSticker={Boolean(recordedDefaultSticker)}
              defaultStickerCategory={recordedDefaultSticker?.category}
              onChangeImage={() => setIsImageChangeOpen(true)}
              onBack={initialValue ? undefined : backToMediaSelection}
              onClose={requestClose}
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
      {isExitConfirmOpen && <RecordExitDialog onExit={onClose} onContinue={continueWriting} />}
      {isImageExitConfirmOpen && (
        <RecordExitDialog
          mode="imageChange"
          onContinue={() => {
            setIsImageExitConfirmOpen(false);
            continueImageChange();
          }}
          onExit={() => {
            setIsImageExitConfirmOpen(false);
            setIsImageChangeOpen(false);
            cancelImageChange();
          }}
        />
      )}
    </>
  );
}
