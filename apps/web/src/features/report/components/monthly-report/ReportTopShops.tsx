import { RankFirstIcon, RankSecondIcon, RankThirdIcon } from '@/shared/assets/icons';

import ReportSectionTitle from './ReportSectionTitle';

const RANK_ICONS = [RankFirstIcon, RankSecondIcon, RankThirdIcon] as const;
const TOP_SHOP_LIMIT = 3;
const MAX_VISIBLE_SHOP_STICKERS = 5;
const SHOP_STICKER_SIZE = 60;
const SHOP_STICKER_MORE_BADGE_SIZE = 30;

type TopShop = {
  id: string;
  months: number;
  name: string;
  rank: 1 | 2 | 3;
  stickerImages: readonly string[];
  visits: number;
};

type ReportTopShopsProps = {
  shops: readonly TopShop[];
};

/** 월간 방문 횟수가 많은 가게를 최대 3위까지 표시합니다. */
export default function ReportTopShops({ shops }: ReportTopShopsProps) {
  return (
    <section>
      <ReportSectionTitle
        description="가장 많이 방문한 단골 가게를 3위까지 보여줘요"
        title="이번달의 가게"
      />
      <div className="mt-3 flex flex-col gap-3.75">
        {shops.slice(0, TOP_SHOP_LIMIT).map((shop) => {
          const RankIcon = RANK_ICONS[shop.rank - 1];
          const visibleStickerImages = shop.stickerImages.slice(0, MAX_VISIBLE_SHOP_STICKERS);
          const additionalStickerCount = shop.stickerImages.length - visibleStickerImages.length;
          const stickerItemCount =
            visibleStickerImages.length + (additionalStickerCount > 0 ? 1 : 0);
          const stickerNaturalWidth =
            visibleStickerImages.length * SHOP_STICKER_SIZE +
            (additionalStickerCount > 0 ? SHOP_STICKER_MORE_BADGE_SIZE : 0);
          const stickerGapCount = Math.max(stickerItemCount - 1, 1);

          return (
            <article
              className={`overflow-hidden rounded-16 ${shop.rank === 1 ? 'bg-primary-50' : 'bg-neutral-50'}`}
              key={shop.id}
            >
              <div className="flex w-full items-center gap-3 p-4 text-left">
                <RankIcon aria-label={`${shop.rank}위`} className="h-10 w-9.5 shrink-0" />
                <span className="min-w-0 flex-1">
                  <strong className="block truncate text-title-02-semibold text-neutral-900">
                    {shop.name}
                  </strong>
                  <span className="mt-1 flex items-center gap-1.5 whitespace-nowrap text-body-02-medium text-neutral-500">
                    이번 달 <em className="not-italic text-primary-400">{shop.visits}번</em> 방문
                    <span aria-hidden className="size-1 rounded-full bg-neutral-400" />
                    함께한 지 <em className="not-italic text-primary-400">{shop.months}개월째</em>
                  </span>
                </span>
              </div>
              {shop.rank === 1 && visibleStickerImages.length > 0 && (
                <div
                  aria-label={`1위 가게 스티커 ${visibleStickerImages.length}개, 추가 ${additionalStickerCount}개`}
                  className="grid items-center px-4 pb-4"
                  style={{
                    columnGap: `max(0px, calc((100% - ${stickerNaturalWidth}px) / ${stickerGapCount}))`,
                    gridTemplateColumns: `repeat(${Math.max(visibleStickerImages.length - 1, 0)}, minmax(0, 1fr)) ${SHOP_STICKER_SIZE}px ${additionalStickerCount > 0 ? `${SHOP_STICKER_MORE_BADGE_SIZE}px` : ''}`,
                  }}
                >
                  {visibleStickerImages.map((sticker, index) => (
                    <span className="min-w-0" key={`${sticker}-${index}`}>
                      <img
                        alt=""
                        aria-hidden
                        className="size-[60px] max-w-none object-contain"
                        src={sticker}
                      />
                    </span>
                  ))}
                  {additionalStickerCount > 0 && (
                    <span className="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-neutral-200 text-label-01-medium text-neutral-600">
                      +{additionalStickerCount}
                    </span>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
