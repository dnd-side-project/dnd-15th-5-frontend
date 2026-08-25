import { cn } from '@/shared/lib/cn';

const STICKER_COLUMN_COUNT = 5;

type StickerCollectionProps = {
  ariaLabel?: string;
  className?: string;
  maxItems?: number;
  size?: 'default' | 'compact';
  stickers: readonly string[];
};

/** 스티커를 5열 슬롯에 표시하고 마지막 줄의 남은 자리를 빈 슬롯으로 채웁니다. */
export default function StickerCollection({
  ariaLabel = '스티커 목록',
  className,
  maxItems,
  size = 'default',
  stickers,
}: StickerCollectionProps) {
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
            <img
              src={stickerImage}
              alt=""
              className={cn('object-contain', isCompact ? 'size-13.75' : 'size-18')}
            />
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
