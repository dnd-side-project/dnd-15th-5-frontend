import {
  createInitialVisitDateTime,
  formatAmount,
  formatVisitDateTime,
  isSameDate,
  MAX_RECORD_AMOUNT,
  RECORD_CATEGORIES,
  sanitizeAmount,
  validateRecordRequiredFields,
} from '@chapchap/shared/record';
import { useState } from 'react';

import { useCreateConsumptionMutation } from '@/features/record/apis/hooks/useCreateConsumptionMutation';
import type { ManualRecordDraft } from '@/features/record/types';
import { createConsumptionRequest } from '@/features/record/utils/createConsumptionRequest';
import { CalendarIcon } from '@/shared/assets/icons';
import { Button } from '@/shared/ui/button';
import { PlaceCard } from '@/shared/ui/card';
import { CategoryChip } from '@/shared/ui/category-chip';

import RecordNavigationHeader from './RecordNavigationHeader';
import VisitDateTimeSheet from './visit-date-time-sheet/VisitDateTimeSheet';

import type { RecordCategory, VisitDateTimeValue } from '@chapchap/shared/record';
import type { ShopSearchResult } from '@chapchap/shared/shop';
import type { ChangeEvent, FormEvent, ReactNode } from 'react';

type ManualRecordFormProps = {
  /** 라우트 이동 전 작성하던 초안을 복원한 경우처럼, 최초 렌더부터 변경사항이 있는지 여부입니다. */
  initialDraftDirty?: boolean;
  initialVisitDateTimeSheetOpen?: boolean;
  initialVisitDateTime?: VisitDateTimeValue;
  initialAmount?: string;
  initialCategory?: RecordCategory;
  selectedShop: ShopSearchResult | null;
  onBack: () => void;
  onClose: () => void;
  onChangeShop: (draft: ManualRecordDraft) => void;
  onSelectShop: (draft: ManualRecordDraft, isDraftDirty: boolean) => void;
};

type RequiredFieldProps = {
  children: ReactNode;
  errorId?: string;
  errorMessage?: string;
  label: string;
};

function RequiredField({ children, errorId, errorMessage, label }: RequiredFieldProps) {
  return (
    <fieldset>
      <legend className="text-body-02-medium text-neutral-700">
        <span className="mr-1 text-notification" aria-hidden="true">
          *
        </span>
        {label}
      </legend>
      <div className="mt-2">{children}</div>
      {errorMessage && (
        <p id={errorId} role="alert" className="mt-2 text-label-01-medium text-notification">
          {errorMessage}
        </p>
      )}
    </fieldset>
  );
}

/** 선택한 가게에 방문 일시·금액·카테고리를 입력하는 웹 수기 기록 폼. */
export default function ManualRecordForm({
  initialDraftDirty = false,
  initialVisitDateTimeSheetOpen = false,
  initialVisitDateTime,
  initialAmount,
  initialCategory,
  selectedShop,
  onBack,
  onClose,
  onChangeShop,
  onSelectShop,
}: ManualRecordFormProps) {
  const hasSelectedShop = selectedShop !== null;
  const hasShopLocation =
    selectedShop !== null &&
    Number.isFinite(selectedShop.latitude) &&
    Number.isFinite(selectedShop.longitude);
  const { createConsumption, isCreatingConsumption } = useCreateConsumptionMutation();
  const [visitDateTime, setVisitDateTime] = useState<VisitDateTimeValue>(
    () => initialVisitDateTime ?? createInitialVisitDateTime()
  );
  const [isVisitDateTimeSheetOpen, setIsVisitDateTimeSheetOpen] = useState(
    initialVisitDateTimeSheetOpen
  );
  const [amount, setAmount] = useState(() => initialAmount ?? '');
  const [category, setCategory] = useState<RecordCategory>(
    () => initialCategory ?? RECORD_CATEGORIES[0]
  );
  const [initialDraft] = useState<ManualRecordDraft>({ amount, category, visitDateTime });
  const { isAmountValid, canSubmit } = validateRecordRequiredFields({
    hasShop: hasShopLocation,
    amount,
  });
  const isDraftDirty =
    initialDraftDirty ||
    amount !== initialDraft.amount ||
    category !== initialDraft.category ||
    visitDateTime.period !== initialDraft.visitDateTime.period ||
    !isSameDate(visitDateTime.date, initialDraft.visitDateTime.date);
  // NOTE: 아직 아무것도 입력하지 않은 빈 금액은 오류로 안내하지 않고, 잘못된 값을 입력했을 때만 안내한다.
  const showAmountError = amount !== '' && !isAmountValid;
  const showShopLocationError = hasSelectedShop && !hasShopLocation;

  const handleAmountChange = (event: ChangeEvent<HTMLInputElement>) => {
    setAmount(sanitizeAmount(event.target.value));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedShop || !canSubmit || isCreatingConsumption) {
      return;
    }

    createConsumption(
      createConsumptionRequest({ shop: selectedShop, visitDateTime, amount, category })
    );
  };

  const handleVisitDateTimeConfirm = (nextValue: VisitDateTimeValue) => {
    setVisitDateTime(nextValue);
    setIsVisitDateTimeSheetOpen(false);
  };

  return (
    <div className="min-h-screen-safe-bottom flex flex-col">
      <RecordNavigationHeader
        onBack={onBack}
        onClose={onClose}
        confirmBeforeBack={isDraftDirty}
        confirmBeforeClose={isDraftDirty}
      />

      <h1 className="mt-6 text-heading-01-bold text-neutral-700">소비 정보를 입력해주세요</h1>

      {hasSelectedShop ? (
        <div className="mt-6 flex items-center rounded-16 border border-neutral-300 p-2">
          <div className="min-w-0 flex-1 overflow-hidden">
            <PlaceCard
              thumbnailSrc={selectedShop.photoUrl}
              title={selectedShop.name}
              location={selectedShop.address}
            />
          </div>
          <button
            type="button"
            onClick={() => onChangeShop({ visitDateTime, amount, category })}
            aria-describedby={
              showShopLocationError ? 'manual-record-shop-location-error' : undefined
            }
            className="ml-4 shrink-0 rounded-05 p-2 text-body-02-regular text-primary-500 outline-none hover:bg-primary-50 focus-visible:ring-2 focus-visible:ring-primary-300"
          >
            변경
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => onSelectShop({ visitDateTime, amount, category }, isDraftDirty)}
          className="mt-6 h-19 rounded-16 border border-neutral-300 text-body-01-medium text-primary-500 outline-none hover:bg-primary-50 focus-visible:ring-2 focus-visible:ring-primary-300"
        >
          가게를 선택해주세요
        </button>
      )}
      {showShopLocationError && (
        <p
          id="manual-record-shop-location-error"
          role="alert"
          className="mt-2 text-label-01-medium text-notification"
        >
          선택한 가게의 위치 정보가 없어 기록할 수 없어요. 다른 가게를 선택해주세요.
        </p>
      )}

      <form className="mt-8 flex flex-1 flex-col" onSubmit={handleSubmit}>
        <RequiredField label="방문 일시">
          <button
            type="button"
            aria-label={`방문 일시 변경, ${formatVisitDateTime(visitDateTime)}`}
            onClick={() => setIsVisitDateTimeSheetOpen(true)}
            className="flex w-full items-center justify-between rounded-08 border border-neutral-300 p-4 text-body-01-regular text-neutral-700 outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
          >
            <span>{formatVisitDateTime(visitDateTime)}</span>
            <CalendarIcon className="size-5.5 text-neutral-400" aria-hidden="true" />
          </button>
        </RequiredField>

        <div className="mt-8">
          <RequiredField
            label="금액"
            errorId="manual-record-amount-error"
            errorMessage={
              showAmountError
                ? `1원 이상 ${formatAmount(String(MAX_RECORD_AMOUNT))}원 이하로 입력해주세요.`
                : undefined
            }
          >
            <label
              className={`flex items-center rounded-08 border p-4 focus-within:ring-2 focus-within:ring-primary-300 ${
                showAmountError ? 'border-notification' : 'border-neutral-300'
              }`}
            >
              <input
                type="text"
                inputMode="numeric"
                aria-label="금액"
                aria-invalid={showAmountError}
                aria-describedby={showAmountError ? 'manual-record-amount-error' : undefined}
                placeholder="금액을 입력해주세요"
                value={formatAmount(amount)}
                onChange={handleAmountChange}
                className="min-w-0 flex-1 text-body-01-regular text-neutral-700 outline-none placeholder:text-neutral-400"
              />
              <span className="ml-2 text-body-01-semibold text-neutral-700">원</span>
            </label>
          </RequiredField>
        </div>

        <div className="mt-8">
          <RequiredField label="카테고리">
            <div className="flex flex-wrap gap-2">
              {RECORD_CATEGORIES.map((recordCategory) => (
                <CategoryChip
                  key={recordCategory}
                  selected={category === recordCategory}
                  onSelectedChange={(selected) => selected && setCategory(recordCategory)}
                >
                  {recordCategory}
                </CategoryChip>
              ))}
            </div>
          </RequiredField>
        </div>

        <div className="mt-auto mb-8 px-1">
          <Button type="submit" disabled={!canSubmit} isLoading={isCreatingConsumption}>
            기록하기
          </Button>
        </div>
      </form>

      {isVisitDateTimeSheetOpen && (
        <VisitDateTimeSheet
          value={visitDateTime}
          onClose={() => setIsVisitDateTimeSheetOpen(false)}
          onConfirm={handleVisitDateTimeConfirm}
        />
      )}
    </div>
  );
}
