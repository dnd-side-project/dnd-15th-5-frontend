import {
  createInitialVisitDateTime,
  formatAmount,
  formatVisitDateTime,
  RECORD_CATEGORIES,
  sanitizeAmount,
  validateRecordRequiredFields,
} from '@chapchap/shared/record';
import { useState } from 'react';

import { useCreateConsumptionMutation } from '@/features/record/apis/hooks/useCreateConsumptionMutation';
import { createConsumptionRequest } from '@/features/record/utils/createConsumptionRequest';
import { CalendarIcon } from '@/shared/assets/icons';
import { Button } from '@/shared/ui/button';
import { PlaceCard } from '@/shared/ui/card';
import { CategoryChip } from '@/shared/ui/category-chip';

import RecordNavigationHeader from './RecordNavigationHeader';
import VisitDateTimePicker from './VisitDateTimePicker';

import type { RecordCategory, VisitDateTimeValue } from '@chapchap/shared/record';
import type { ShopSearchResult } from '@chapchap/shared/shop';
import type { ChangeEvent, FormEvent, ReactNode } from 'react';

type ManualRecordFormProps = {
  selectedShop: ShopSearchResult | null;
  onBack: () => void;
  onClose: () => void;
  onChangeShop: () => void;
  onSelectShop: () => void;
};

type RequiredFieldProps = {
  children: ReactNode;
  label: string;
};

function RequiredField({ children, label }: RequiredFieldProps) {
  return (
    <fieldset>
      <legend className="text-body-02-medium text-neutral-700">
        <span className="mr-1 text-notification" aria-hidden="true">
          *
        </span>
        {label}
      </legend>
      <div className="mt-2">{children}</div>
    </fieldset>
  );
}

/** 선택한 가게에 방문 일시·금액·카테고리를 입력하는 웹 수기 기록 폼. */
export default function ManualRecordForm({
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
    createInitialVisitDateTime
  );
  const [isDateTimePickerOpen, setIsDateTimePickerOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<RecordCategory>(RECORD_CATEGORIES[0]);
  const { canSubmit } = validateRecordRequiredFields({ hasShop: hasShopLocation, amount });

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

  const handleDateTimeConfirm = (nextValue: VisitDateTimeValue) => {
    setVisitDateTime(nextValue);
    setIsDateTimePickerOpen(false);
  };

  return (
    <div className="min-h-screen-safe-bottom flex flex-col">
      <RecordNavigationHeader onBack={onBack} onClose={onClose} />

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
            onClick={onChangeShop}
            className="ml-4 shrink-0 rounded-05 p-2 text-body-02-regular text-primary-500 outline-none hover:bg-primary-50 focus-visible:ring-2 focus-visible:ring-primary-300"
          >
            변경
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onSelectShop}
          className="mt-6 h-19 rounded-16 border border-neutral-300 text-body-01-medium text-primary-500 outline-none hover:bg-primary-50 focus-visible:ring-2 focus-visible:ring-primary-300"
        >
          가게를 선택해주세요
        </button>
      )}

      <form className="mt-8 flex flex-1 flex-col" onSubmit={handleSubmit}>
        <RequiredField label="방문 일시">
          <button
            type="button"
            aria-label={`방문 일시 변경, ${formatVisitDateTime(visitDateTime)}`}
            onClick={() => setIsDateTimePickerOpen(true)}
            className="flex w-full items-center justify-between rounded-08 border border-neutral-300 p-4 text-body-01-regular text-neutral-700 outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
          >
            <span>{formatVisitDateTime(visitDateTime)}</span>
            <CalendarIcon className="size-5.5 text-neutral-400" aria-hidden="true" />
          </button>
        </RequiredField>

        <div className="mt-8">
          <RequiredField label="금액">
            <label className="flex items-center rounded-08 border border-neutral-300 p-4 focus-within:ring-2 focus-within:ring-primary-300">
              <input
                type="text"
                inputMode="numeric"
                aria-label="금액"
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

      {isDateTimePickerOpen && (
        <VisitDateTimePicker
          value={visitDateTime}
          onClose={() => setIsDateTimePickerOpen(false)}
          onConfirm={handleDateTimeConfirm}
        />
      )}
    </div>
  );
}
