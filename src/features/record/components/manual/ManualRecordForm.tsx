import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { useEffect, useState } from 'react';

import type { FocusEvent, FormEvent } from 'react';

type ManualRecordFormProps = {
  onBack: () => void;
  onSubmit: () => void;
};

type FieldProps = {
  label: string;
  name: string;
  placeholder?: string;
  type?: 'date' | 'text' | 'time';
  inputMode?: 'decimal' | 'text';
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  onFocus?: (event: FocusEvent<HTMLInputElement>) => void;
  required?: boolean;
};

const CATEGORY_OPTIONS = ['식비', '카페', '쇼핑', '교통', '생활'] as const;
type Category = (typeof CATEGORY_OPTIONS)[number];

function BackIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-6 w-6">
      <path
        d="m15 18-6-6 6-6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="m16 16 4 4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
    </svg>
  );
}

function Field({
  inputMode = 'text',
  label,
  name,
  onBlur,
  onFocus,
  placeholder,
  required = false,
  type = 'text',
}: FieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold text-neutral-700">
        {required && <span className="mr-0.5 text-red-500">*</span>}
        {label}
      </span>
      <input
        name={name}
        type={type}
        inputMode={inputMode}
        onBlur={onBlur}
        onFocus={onFocus}
        placeholder={placeholder}
        className="h-12 w-full rounded-lg bg-neutral-50 px-4 text-base text-neutral-900 outline-none placeholder:text-neutral-400 focus:ring-2 focus:ring-orange-400"
      />
    </label>
  );
}

export default function ManualRecordForm({ onBack, onSubmit }: ManualRecordFormProps) {
  const [isAmountFocused, setIsAmountFocused] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    const listenerPromise = Keyboard.addListener('keyboardWillHide', () => {
      setIsAmountFocused(false);
    });

    return () => {
      void listenerPromise.then((listener) => listener.remove()).catch(() => undefined);
    };
  }, []);

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
  };

  const handleAmountFocus = () => {
    setIsAmountFocused(true);
  };

  const handleAmountBlur = () => {
    setIsAmountFocused(false);
  };

  return (
    <form
      onSubmit={handleFormSubmit}
      className={`flex min-h-full flex-col px-5 pt-3 pb-4 transition-transform duration-200 ease-out ${
        isAmountFocused ? '-translate-y-16' : 'translate-y-0'
      }`}
    >
      <header className="mb-7">
        <button
          type="button"
          onClick={onBack}
          aria-label="뒤로 가기"
          className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full text-neutral-800 active:bg-neutral-100"
        >
          <BackIcon />
        </button>
        <h1 className="mt-4 text-xl font-bold text-neutral-900">소비 정보를 입력해주세요</h1>
      </header>

      <div className="space-y-5">
        <div>
          <span className="mb-2 block text-xs font-semibold text-neutral-700">
            <span className="mr-0.5 text-red-500">*</span>가게명
          </span>
          <button
            type="button"
            className="flex h-12 w-full items-center justify-between rounded-lg bg-neutral-50 px-4 text-left text-sm text-neutral-700"
          >
            <span>뚜셰플레이스 신촌현점</span>
            <SearchIcon />
          </button>
        </div>

        <Field
          label="위치"
          name="location"
          placeholder="서울특별시 강남구 봉은사로 125 1층"
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Field label="날짜" name="date" type="date" required />
          <Field label="시간" name="time" type="time" />
        </div>

        <Field
          label="금액"
          name="amount"
          placeholder="금액을 입력해주세요"
          inputMode="decimal"
          onBlur={handleAmountBlur}
          onFocus={handleAmountFocus}
          required
        />

        <fieldset>
          <legend className="mb-2 text-xs font-semibold text-neutral-700">
            <span className="mr-0.5 text-red-500">*</span>카테고리
          </legend>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_OPTIONS.map((category) => {
              const isSelected = selectedCategory === category;

              return (
                <button
                  type="button"
                  aria-pressed={isSelected}
                  className={`h-10 rounded-full border px-4 text-sm font-medium transition-colors ${
                    isSelected
                      ? 'border-orange-500 bg-orange-500 text-white'
                      : 'border-neutral-200 bg-white text-neutral-600 active:bg-neutral-100'
                  }`}
                  key={category}
                  onClick={() => handleCategorySelect(category)}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </fieldset>
      </div>

      <button
        type="submit"
        className="mt-auto h-14 w-full shrink-0 rounded-xl bg-neutral-300 text-base font-semibold text-white active:bg-neutral-400"
      >
        기록하기
      </button>
    </form>
  );
}
