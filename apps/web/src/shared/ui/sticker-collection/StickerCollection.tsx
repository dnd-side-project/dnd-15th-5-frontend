import { useState } from 'react';

import { cn } from '@/shared/lib/cn';

import '@/shared/styles/stickerStamp.css';
import './StickerCollection.css';

const STICKER_COLUMN_COUNT = 5;
const STAMP_PLAYING_CLASS = 'sticker-collection__stamp--playing';

type StampPlayback = {
  index: number;
  isPlaying: boolean;
  sequence: number;
};

type StickerCollectionProps = {
  ariaLabel?: string;
  className?: string;
  maxItems?: number;
  replayStampAnimationOnClick?: boolean;
  size?: 'default' | 'compact';
  stickers: readonly string[];
};

/** 스티커를 5열 슬롯에 표시하고 마지막 줄의 남은 자리를 빈 슬롯으로 채웁니다. */
export default function StickerCollection({
  ariaLabel = '스티커 목록',
  className,
  maxItems,
  replayStampAnimationOnClick = false,
  size = 'default',
  stickers,
}: StickerCollectionProps) {
  const [stampPlayback, setStampPlayback] = useState<StampPlayback | null>(null);
  const visibleStickers = maxItems === undefined ? stickers : stickers.slice(0, maxItems);
  const slotCount = Math.max(
    STICKER_COLUMN_COUNT,
    Math.ceil(visibleStickers.length / STICKER_COLUMN_COUNT) * STICKER_COLUMN_COUNT
  );
  const stickerSlots = Array.from(
    { length: slotCount },
    (_, index) => visibleStickers[index] ?? null
  );
  const isCompact = size === 'compact';
  const playStampAnimation = (index: number) => {
    setStampPlayback((current) => ({
      index,
      isPlaying: true,
      sequence: (current?.sequence ?? 0) + 1,
    }));
  };

  return (
    <ul
      aria-label={ariaLabel}
      className={cn(
        'grid grid-cols-5 items-center rounded-16 bg-neutral-50 py-4',
        isCompact ? 'gap-x-4 gap-y-8 px-2.75' : 'gap-y-4 px-4',
        className
      )}
    >
      {stickerSlots.map((stickerImage, index) => (
        <li
          key={`sticker-slot-${index}`}
          className={cn('flex justify-self-center justify-center', isCompact ? 'w-13.75' : 'w-18')}
        >
          {stickerImage ? (
            replayStampAnimationOnClick ? (
              <button
                type="button"
                aria-label={`${index + 1}번째 스티커 붙이기`}
                onClick={() => playStampAnimation(index)}
                className="rounded-full outline-none hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2 active:bg-neutral-200"
              >
                <img
                  key={
                    stampPlayback?.index === index
                      ? `${index}-${stampPlayback.sequence}`
                      : `${index}-idle`
                  }
                  src={stickerImage}
                  alt=""
                  className={cn(
                    'sticker-collection__stamp object-contain',
                    isCompact ? 'size-13.75' : 'size-18',
                    stampPlayback?.index === index && stampPlayback.isPlaying && STAMP_PLAYING_CLASS
                  )}
                  onAnimationEnd={() =>
                    setStampPlayback((current) =>
                      current?.index === index ? { ...current, isPlaying: false } : current
                    )
                  }
                />
              </button>
            ) : (
              <img
                src={stickerImage}
                alt=""
                className={cn('object-contain', isCompact ? 'size-13.75' : 'size-18')}
              />
            )
          ) : (
            <span
              aria-label="빈 스티커 자리"
              className={cn(
                'block rounded-full border border-dashed border-neutral-400 bg-neutral-100',
                isCompact ? 'size-11.25' : 'size-12'
              )}
            />
          )}
        </li>
      ))}
    </ul>
  );
}
