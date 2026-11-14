import CameraIcon from '@chapchap/shared/assets/icons/ic-sticker-camera.svg?react';
import {
  createInitialVisitDateTime,
  formatAmount,
  formatPurchaseDateTime,
  formatVisitDateTime,
  MAX_RECORD_AMOUNT,
  parseReceiptVisitDateTime,
  RECORD_CATEGORIES,
  sanitizeAmount,
} from '@chapchap/shared/record';
import { useEffect, useState } from 'react';

import RecordNavigationHeader from '@/features/record/components/RecordNavigationHeader';
import VisitDateTimeSheet from '@/features/record/components/visit-date-time-sheet/VisitDateTimeSheet';
import { useStickerRecordCategory } from '@/features/record/sticker/hooks/useStickerRecordCategory';
import type { StickerRecordDraft } from '@/features/record/types';
import { isValidStickerRecordShop } from '@/features/record/utils/createStickerConsumptionRequest';
import { CalendarIcon, SearchIcon } from '@/shared/assets/icons';
import { isNativeApp } from '@/shared/lib/bridge';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/button';
import { PlaceCard } from '@/shared/ui/card';
import { CategoryChip } from '@/shared/ui/category-chip';

import ReceiptScanPanel from './ReceiptScanPanel';

import type { ReceiptScanData } from '@chapchap/shared/bridge';
import type { RecordCategory, VisitDateTimeValue } from '@chapchap/shared/record';
import type { ShopSearchResult } from '@chapchap/shared/shop';
import type { FormEvent, ReactNode } from 'react';

type StickerRecordPreviewProps = {
  initialDraft?: StickerRecordDraft;
  isEditing?: boolean;
  hasMediaChanges?: boolean;
  onDirtyChange?: (dirty: boolean) => void;
  sticker: string;
  isDefaultSticker: boolean;
  defaultStickerCategory?: RecordCategory;
  onChangeImage: () => void;
  onBack: () => void;
  onClose: () => void;
  onSearchShop?: () => void;
  onScanReceipt?: () => Promise<ReceiptScanData | null> | void;
  onReceiptShopSelected?: (shop: ShopSearchResult) => void;
  onSubmit?: (draft: StickerRecordDraft) => void;
  isSubmitting?: boolean;
  submitError?: string;
  selectedShop?: ShopSearchResult | null;
  initialCategory?: RecordCategory;
  initialVisitDateTime?: VisitDateTimeValue;
  isOpeningReceipt?: boolean;
  receiptError?: string;
  imageError?: string;
  isCapturing?: boolean;
};

type RecordFieldProps = { label: string; required?: boolean; children: ReactNode };

function RecordField({ label, required = false, children }: RecordFieldProps) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-2 text-body-02-semibold text-neutral-700">
        {required && (
          <span aria-hidden="true" className="mr-1 text-red">
            *
          </span>
        )}
        {label}
      </legend>
      {children}
    </fieldset>
  );
}

/** 스티커와 소비 정보를 확인하고 최종 기록 등록을 요청하는 폼입니다. */
export default function StickerRecordPreview({
  initialDraft,
  isEditing = false,
  hasMediaChanges = false,
  onDirtyChange,
  sticker,
  isDefaultSticker,
  defaultStickerCategory,
  onChangeImage,
  onBack,
  onClose,
  onSearchShop,
  onScanReceipt,
  onReceiptShopSelected,
  onSubmit,
  isSubmitting = false,
  submitError = '',
  selectedShop,
  initialCategory = '카페',
  initialVisitDateTime,
  isOpeningReceipt = false,
  receiptError = '',
  imageError = '',
  isCapturing = false,
}: StickerRecordPreviewProps) {
  const isApp = isNativeApp();
  const [category, setCategory] = useStickerRecordCategory({
    sticker,
    stickerCategory: defaultStickerCategory,
    initialCategory: initialDraft?.category ?? defaultStickerCategory ?? initialCategory,
  });
  const [visitDateTime, setVisitDateTime] = useState(
    () => initialDraft?.visitDateTime ?? initialVisitDateTime ?? createInitialVisitDateTime()
  );
  const [isDateSheetOpen, setIsDateSheetOpen] = useState(false);
  const [amount, setAmount] = useState(initialDraft?.amount ?? '');
  const [memo, setMemo] = useState(initialDraft?.memo ?? '');
  const [receiptImageId, setReceiptImageId] = useState<number>();
  const [purchaseTime, setPurchaseTime] = useState<string | undefined>(initialDraft?.purchaseTime);
  const isAmountTooLarge = Number(amount) > MAX_RECORD_AMOUNT;
  const initialDateTime = initialDraft
    ? formatPurchaseDateTime(initialDraft.visitDateTime)
    : undefined;
  const currentDateTime = formatPurchaseDateTime(visitDateTime);
  const isDirty = Boolean(
    initialDraft &&
    (selectedShop?.id !== initialDraft.shop.id ||
      selectedShop?.name !== initialDraft.shop.name ||
      selectedShop?.address !== initialDraft.shop.address ||
      selectedShop?.latitude !== initialDraft.shop.latitude ||
      selectedShop?.longitude !== initialDraft.shop.longitude ||
      amount !== initialDraft.amount ||
      memo !== initialDraft.memo ||
      category !== initialDraft.category ||
      currentDateTime.purchaseDate !== initialDateTime?.purchaseDate ||
      (purchaseTime ?? currentDateTime.purchaseTime) !==
        (initialDraft.purchaseTime ?? initialDateTime?.purchaseTime) ||
      receiptImageId !== undefined)
  );
  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const canSubmit = Boolean(
    onSubmit &&
    isValidStickerRecordShop(selectedShop) &&
    !isAmountTooLarge &&
    memo.length <= 1000 &&
    !isSubmitting &&
    !isOpeningReceipt &&
    !isCapturing &&
    (!isEditing || isDirty || hasMediaChanges)
  );
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit || !selectedShop) return;
    onSubmit?.({
      shop: selectedShop,
      visitDateTime,
      amount,
      category,
      memo,
      receiptImageId,
      purchaseTime,
    });
  };
  const handleScanReceipt = async () => {
    if (!isApp) return;
    const receipt = await onScanReceipt?.();
    if (!receipt) return;
    setReceiptImageId(receipt.receiptImageId);
    if (receipt.shop) onReceiptShopSelected?.(receipt.shop);
    const recognizedDateTime = parseReceiptVisitDateTime(
      receipt.purchaseDate,
      receipt.purchaseTime
    );
    if (recognizedDateTime) {
      setVisitDateTime(recognizedDateTime);
      setPurchaseTime(
        receipt.purchaseTime
          ? receipt.purchaseTime.length === 5
            ? `${receipt.purchaseTime}:00`
            : receipt.purchaseTime
          : undefined
      );
    }
    if (receipt.amount !== null && Number.isSafeInteger(receipt.amount))
      setAmount(String(receipt.amount));
  };

  return (
    <section className="flex min-h-dvh flex-1 flex-col bg-primary-50 text-neutral-700">
      <fieldset disabled={isSubmitting} className="contents">
        <header className="shrink-0 px-4 pt-8">
          <RecordNavigationHeader
            title={isEditing ? '기록 수정' : '기록하기'}
            onBack={onBack}
            onClose={onClose}
          />
        </header>

        <div className="flex flex-col items-center gap-4 pt-8 pb-10">
          <a
            href={sticker}
            download="chapchap-sticker.png"
            aria-label="스티커 PNG 다운로드"
            className="grid size-40 place-items-center"
          >
            <img
              src={sticker}
              alt="기록에 적용한 스티커"
              className={cn('object-contain', isDefaultSticker ? 'size-32' : 'size-40')}
            />
          </a>
          <button
            type="button"
            onClick={onChangeImage}
            disabled={isCapturing}
            className="flex h-8 items-center gap-2 rounded-full bg-neutral-00 px-3 text-body-02-medium text-neutral-600"
          >
            <CameraIcon
              aria-hidden="true"
              className="size-4 [--sticker-primary:var(--color-neutral-00)]"
            />
            {isDefaultSticker ? '이미지 변경' : '사진 변경'}
          </button>
          {isCapturing && (
            <p role="status" className="text-body-02-regular text-neutral-500">
              카메라를 열고 있어요
            </p>
          )}
          {imageError && (
            <p role="alert" className="px-4 text-body-02-regular text-red">
              {imageError}
            </p>
          )}
        </div>

        <div className="flex flex-1 flex-col rounded-t-32 bg-neutral-00 px-4 pt-8 pb-[max(32px,env(safe-area-inset-bottom))]">
          <h2 className="text-title-01-bold">소비정보를 입력해주세요</h2>
          {isApp && (
            <ReceiptScanPanel
              hasReceipt={receiptImageId !== undefined}
              isOpeningReceipt={isOpeningReceipt}
              error={receiptError}
              onScanReceipt={handleScanReceipt}
            />
          )}

          <form
            className="mt-8 flex flex-1 flex-col"
            onSubmit={handleSubmit}
            aria-busy={isSubmitting}
            aria-label="소비정보"
          >
            <div className="flex flex-col gap-8">
              <RecordField label="가게 정보" required>
                {selectedShop ? (
                  <div className="flex w-full items-center rounded-16 border border-neutral-300 p-2">
                    <div className="min-w-0 flex-1 overflow-hidden" data-mp-mask="">
                      <PlaceCard
                        thumbnailSrc={selectedShop.photoUrl}
                        title={selectedShop.name}
                        location={selectedShop.address}
                        showLocationIcon={false}
                      />
                    </div>
                    <button
                      type="button"
                      aria-label="가게 정보 검색"
                      onClick={onSearchShop}
                      className="ml-4 min-h-10 shrink-0 rounded-05 p-2 text-body-02-regular text-primary-500 outline-none hover:bg-primary-50 focus-visible:ring-2 focus-visible:ring-primary-300"
                    >
                      변경
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    aria-label="가게 정보 검색"
                    onClick={onSearchShop}
                    className="flex h-14 w-full items-center justify-between gap-3 rounded-08 border border-neutral-300 px-4 text-left text-body-01-regular"
                  >
                    <span className="truncate text-neutral-400">가게명 검색하기</span>
                    <SearchIcon aria-hidden="true" className="size-6 shrink-0 text-neutral-600" />
                  </button>
                )}
              </RecordField>

              <RecordField label="방문 일시" required>
                <button
                  type="button"
                  aria-label={`방문 일시 변경, ${formatVisitDateTime(visitDateTime)}`}
                  onClick={() => setIsDateSheetOpen(true)}
                  className="flex h-13.5 w-full items-center justify-between rounded-08 border border-neutral-300 px-4 text-body-01-regular"
                >
                  <span>{formatVisitDateTime(visitDateTime)}</span>
                  <CalendarIcon aria-hidden="true" className="size-6 text-neutral-400" />
                </button>
              </RecordField>

              <RecordField label="카테고리" required>
                <div className="flex flex-wrap gap-2">
                  {RECORD_CATEGORIES.map((item) => (
                    <CategoryChip
                      key={item}
                      selected={category === item}
                      onSelectedChange={(selected) => selected && setCategory(item)}
                      className="h-8.5 px-4"
                    >
                      {item}
                    </CategoryChip>
                  ))}
                </div>
              </RecordField>

              <RecordField label="금액">
                <label
                  className={cn(
                    'flex h-13 items-center rounded-08 border px-4 focus-within:ring-2 focus-within:ring-primary-300',
                    isAmountTooLarge ? 'border-red' : 'border-neutral-300'
                  )}
                >
                  <input
                    aria-label="금액"
                    inputMode="numeric"
                    type="text"
                    value={formatAmount(amount)}
                    onChange={(event) => setAmount(sanitizeAmount(event.target.value))}
                    placeholder="금액을 입력해주세요"
                    aria-invalid={isAmountTooLarge}
                    aria-describedby={isAmountTooLarge ? 'sticker-amount-error' : undefined}
                    className="min-w-0 flex-1 bg-transparent text-body-01-regular outline-none placeholder:text-neutral-400"
                  />
                  <span className="ml-2 text-body-01-semibold">원</span>
                </label>
                {isAmountTooLarge && (
                  <p
                    id="sticker-amount-error"
                    role="alert"
                    className="mt-2 text-body-02-regular text-red"
                  >
                    {formatAmount(String(MAX_RECORD_AMOUNT))}원 이하로 입력해주세요.
                  </p>
                )}
              </RecordField>

              <RecordField label="메모">
                <textarea
                  aria-label="메모"
                  placeholder="기록을 남겨주세요"
                  value={memo}
                  maxLength={1000}
                  onChange={(event) => setMemo(event.target.value)}
                  className="block h-32 w-full resize-none rounded-08 border border-neutral-300 p-4 text-body-01-regular outline-none placeholder:text-neutral-400 focus-visible:ring-2 focus-visible:ring-primary-300"
                />
              </RecordField>
            </div>
            <div className="mt-18 px-0.5">
              {submitError && (
                <p role="alert" className="mb-4 text-body-02-regular text-red">
                  {submitError}
                </p>
              )}
              <Button
                type="submit"
                isLoading={isSubmitting}
                disabled={!canSubmit}
                className="data-disabled:bg-neutral-400"
              >
                {isEditing ? '수정완료' : '기록하기'}
              </Button>
            </div>
          </form>
        </div>
        {isDateSheetOpen && (
          <VisitDateTimeSheet
            value={visitDateTime}
            onClose={() => setIsDateSheetOpen(false)}
            onConfirm={(value) => {
              if (
                value.period !== visitDateTime.period ||
                value.date.toDateString() !== visitDateTime.date.toDateString()
              )
                setPurchaseTime(undefined);
              setVisitDateTime(value);
              setIsDateSheetOpen(false);
            }}
          />
        )}
      </fieldset>
    </section>
  );
}
