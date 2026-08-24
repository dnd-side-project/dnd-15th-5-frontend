import { Link } from 'react-router-dom';

import {
  ChevronRightIcon,
  RankFirstIcon,
  RankSecondIcon,
  RankThirdIcon,
} from '@/shared/assets/icons';
import {
  StickerCoffeeImage,
  StickerDonutImage,
  StickerIceCreamImage,
} from '@/shared/assets/images/stickers';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';

import ReportSectionTitle from './ReportSectionTitle';

const RANK_ICONS = [RankFirstIcon, RankSecondIcon, RankThirdIcon] as const;
const TOP_SHOP_LIMIT = 3;
const MAX_VISIBLE_SHOP_STICKERS = 5;
const SHOP_STICKERS = [
  StickerCoffeeImage,
  StickerIceCreamImage,
  StickerDonutImage,
  StickerDonutImage,
  StickerCoffeeImage,
  StickerDonutImage,
  StickerIceCreamImage,
  StickerCoffeeImage,
] as const;
const VISIBLE_SHOP_STICKERS = SHOP_STICKERS.slice(0, MAX_VISIBLE_SHOP_STICKERS);
const ADDITIONAL_SHOP_STICKER_COUNT = SHOP_STICKERS.length - VISIBLE_SHOP_STICKERS.length;

type TopShop = {
  id: string;
  months: number;
  name: string;
  rank: 1 | 2 | 3;
  visits: number;
};

type ReportTopShopsProps = {
  shops: readonly TopShop[];
};

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
                <Link
                  aria-label={`${shop.name} 상세보기`}
                  className="flex size-8 shrink-0 items-center justify-center rounded-full text-neutral-600 outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
                  to={ROUTE_PATHS.shopDetail(shop.id)}
                >
                  <ChevronRightIcon aria-hidden className="size-4" />
                </Link>
              </div>
              {shop.rank === 1 && (
                <div
                  aria-label={`1위 가게 스티커 ${VISIBLE_SHOP_STICKERS.length}개, 추가 ${ADDITIONAL_SHOP_STICKER_COUNT}개`}
                  className="grid items-center px-4 pb-4"
                  style={{
                    gridTemplateColumns: `repeat(${VISIBLE_SHOP_STICKERS.length}, minmax(0, 1fr)) ${ADDITIONAL_SHOP_STICKER_COUNT > 0 ? '36px' : ''}`,
                  }}
                >
                  {VISIBLE_SHOP_STICKERS.map((sticker, index) => (
                    <span className="min-w-0" key={`${sticker}-${index}`}>
                      <img
                        alt=""
                        aria-hidden
                        className="size-16 max-w-none object-contain"
                        src={sticker}
                      />
                    </span>
                  ))}
                  {ADDITIONAL_SHOP_STICKER_COUNT > 0 && (
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-body-02-semibold text-neutral-600">
                      +{ADDITIONAL_SHOP_STICKER_COUNT}
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
