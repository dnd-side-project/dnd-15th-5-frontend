import { useState } from 'react';

import { CheckIcon, CloseIcon } from '@/shared/assets/icons';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/button';
import { CategoryChip } from '@/shared/ui/category-chip';

import { DEFAULT_STICKER_CATEGORIES, DEFAULT_STICKERS } from './defaultStickers';

import type { DefaultStickerCategory } from './defaultStickers';

type DefaultStickerPickerProps = {
  onClose: () => void;
  onConfirm: (sticker: string) => void;
  isProcessing: boolean;
  error: string;
};

export default function DefaultStickerPicker({
  onClose,
  onConfirm,
  isProcessing,
  error,
}: DefaultStickerPickerProps) {
  const [category, setCategory] = useState<DefaultStickerCategory>('카페');
  const [selectedId, setSelectedId] = useState<string | null>('coffee');
  const stickers = DEFAULT_STICKERS.filter((sticker) => sticker.category === category);
  const selectedSticker = stickers.find((sticker) => sticker.id === selectedId);

  const handleCategoryChange = (nextCategory: DefaultStickerCategory) => {
    setCategory(nextCategory);
    setSelectedId(null);
  };

  return (
    <section className="flex min-h-dvh flex-col bg-neutral-00 text-neutral-700">
      <header className="relative h-32 shrink-0">
        <button
          type="button"
          aria-label="닫기"
          onClick={onClose}
          className="absolute top-19.5 left-4 grid size-6 place-items-center"
        >
          <CloseIcon aria-hidden="true" className="size-4" />
        </button>
      </header>

      <h1 className="mx-4 mt-2.5 text-heading-02-semibold">스티커를 골라주세요</h1>

      <div
        role="group"
        aria-label="스티커 카테고리"
        inert={isProcessing}
        className="scrollbar-hidden mt-9 flex gap-2 overflow-x-auto px-4 py-0.5"
      >
        {DEFAULT_STICKER_CATEGORIES.map((item) => (
          <CategoryChip
            key={item}
            selected={category === item}
            onSelectedChange={(selected) => selected && handleCategoryChange(item)}
            className="h-8.5 px-4"
          >
            {item}
          </CategoryChip>
        ))}
      </div>

      <div
        role="group"
        aria-label={`${category} 스티커`}
        inert={isProcessing}
        className="mt-7.5 grid grid-cols-4 gap-x-3.5 gap-y-4 px-4"
      >
        {stickers.map((sticker) => {
          const isSelected = selectedId === sticker.id;
          return (
            <button
              key={sticker.id}
              type="button"
              aria-label={`${sticker.name} 스티커`}
              aria-pressed={isSelected}
              onClick={() => setSelectedId(sticker.id)}
              className={cn(
                'relative flex h-21 items-center justify-center rounded-16 border bg-primary-50',
                isSelected ? 'border-primary-500' : 'border-transparent'
              )}
            >
              <img src={sticker.image} alt="" className="size-9 object-contain" />
              {isSelected && (
                <span className="absolute top-2 right-2 grid size-4.5 place-items-center rounded-full bg-primary-500 text-neutral-00">
                  <CheckIcon aria-hidden="true" className="h-2 w-2.5" />
                </span>
              )}
            </button>
          );
        })}
      </div>
      {stickers.length === 0 && (
        <p role="status" className="px-4 py-10 text-center text-body-02-regular text-neutral-500">
          준비 중인 스티커예요
        </p>
      )}

      <footer className="mt-auto px-5 pt-8 pb-[max(32px,env(safe-area-inset-bottom))]">
        {error && (
          <p role="alert" className="mb-4 text-body-02-regular text-notification">
            {error}
          </p>
        )}
        <Button
          isLoading={isProcessing}
          disabled={!selectedSticker}
          onClick={() => selectedSticker && onConfirm(selectedSticker.image)}
        >
          이 스티커로 기록하기
        </Button>
      </footer>
    </section>
  );
}
