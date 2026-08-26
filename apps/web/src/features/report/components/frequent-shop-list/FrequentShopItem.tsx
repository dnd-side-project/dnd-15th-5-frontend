import type { FrequentShop } from '@/features/report/types';
import {
  BlueLocationPinIcon,
  RankFirstIcon,
  RankSecondIcon,
  RankThirdIcon,
} from '@/shared/assets/icons';
import { PlaceTagCard } from '@/shared/ui/card';

type FrequentShopItemProps = {
  shop: FrequentShop;
};

const RANK_ICONS = [RankFirstIcon, RankSecondIcon, RankThirdIcon] as const;

/** 순위와 장소 정보, 방문 횟수를 한 행으로 표시합니다. */
export default function FrequentShopItem({ shop }: FrequentShopItemProps) {
  const RankIcon = RANK_ICONS[shop.rank - 1];

  return (
    <li className="grid grid-cols-[31px_minmax(0,1fr)] items-center gap-2 px-4">
      <div className="flex h-15 w-7.75 items-center justify-center text-body-02-semibold text-neutral-700">
        {RankIcon ? (
          <RankIcon aria-label={`${shop.rank}위`} className="h-8.25 w-7.75 drop-shadow-rank" />
        ) : (
          <span aria-label={`${shop.rank}위`}>{shop.rank}</span>
        )}
      </div>
      <div className="flex min-w-0 items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <PlaceTagCard
            thumbnailSrc={shop.thumbnailSrc}
            title={shop.name}
            tags={[{ label: shop.district, icon: BlueLocationPinIcon }, { label: shop.category }]}
          />
        </div>
        <p
          aria-label={`${shop.visitCount}회 방문`}
          className="flex shrink-0 items-end gap-1 px-1 text-neutral-700"
        >
          <strong className="text-heading-03-semibold tabular-nums">{shop.visitCount}</strong>
          <span className="pb-0.5 text-body-01-semibold">회</span>
        </p>
      </div>
    </li>
  );
}
