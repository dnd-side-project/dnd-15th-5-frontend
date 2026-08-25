import { cn } from '@/shared/lib/cn';

const STICKER_COLUMN_COUNT = 5;

type StickerCollectionProps = {
  ariaLabel?: string;
  className?: string;
  maxItems?: number;
  stickers: readonly string[];
};

/** 지도 장소 시트에서 스티커를 5열 슬롯으로 표시합니다. */
export default function StickerCollection({
  ariaLabel = '스티커 목록',
  className,
  maxItems,
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

  return (
    <ul
      aria-label={ariaLabel}
      className={cn(
        'grid grid-cols-5 items-center gap-y-4 rounded-16 bg-neutral-50 p-4',
        className
      )}
    >
      {stickerSlots.map((stickerImage, index) => (
        <li key={`sticker-slot-${index}`} className="flex w-18 justify-self-center justify-center">
          {stickerImage ? (
            <img src={stickerImage} alt="" className="size-18 object-contain" />
          ) : (
            <span
              aria-label="빈 스티커 자리"
              className="block size-12 rounded-full border border-dashed border-neutral-400 bg-neutral-100"
            />
          )}
        </li>
      ))}
    </ul>
  );
}
