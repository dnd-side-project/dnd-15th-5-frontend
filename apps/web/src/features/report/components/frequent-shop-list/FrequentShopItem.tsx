import type { FrequentPlaceItem } from '@/features/report/apis/dto';
import {
  BlueLocationPinIcon,
  RankFirstIcon,
  RankSecondIcon,
  RankThirdIcon,
} from '@/shared/assets/icons';
import { PlaceTagCard } from '@/shared/ui/card';

type FrequentShopItemProps = {
  category?: FrequentPlaceItem['category'];
  dongname?: FrequentPlaceItem['dongname'];
  onSelect?: () => void;
  placeName?: FrequentPlaceItem['placeName'];
  rank: number;
  thumbnailSrc?: string | null;
  visitCount?: FrequentPlaceItem['visitCount'];
};

const RANK_ICONS = [RankFirstIcon, RankSecondIcon, RankThirdIcon] as const;

/** 순위와 장소 정보, 방문 횟수를 표시하고 선택 동작이 있으면 행 전체를 버튼으로 만듭니다. */
export default function FrequentShopItem({
  category,
  dongname,
  onSelect,
  placeName,
  rank,
  thumbnailSrc = null,
  visitCount,
}: FrequentShopItemProps) {
  const RankIcon = RANK_ICONS[rank - 1];
  const visibleVisitCount = visitCount ?? 0;
  const visiblePlaceName = placeName?.trim() || '이름 없는 장소';
  const content = (
    <>
      <span className="flex h-15 w-7.75 items-center justify-center text-body-02-semibold text-neutral-700">
        {RankIcon ? (
          <RankIcon aria-label={`${rank}위`} className="h-8.25 w-7.75 drop-shadow-rank" />
        ) : (
          <span aria-label={`${rank}위`}>{rank}</span>
        )}
      </span>
      <span className="flex min-w-0 items-center justify-between gap-2">
        <span className="min-w-0 flex-1">
          <PlaceTagCard
            thumbnailSrc={thumbnailSrc}
            title={visiblePlaceName}
            tags={[
              { label: dongname?.trim() || '지역 정보 없음', icon: BlueLocationPinIcon },
              { label: category?.trim() || '기타' },
            ]}
          />
        </span>
        <span
          aria-label={`${visibleVisitCount}회 방문`}
          className="flex shrink-0 items-end gap-1 px-1 text-neutral-700"
        >
          <strong className="text-heading-03-semibold tabular-nums">{visibleVisitCount}</strong>
          <span className="pb-0.5 text-body-01-semibold">회</span>
        </span>
      </span>
    </>
  );

  return (
    <li className="px-4">
      {onSelect ? (
        <button
          type="button"
          aria-label={`${visiblePlaceName} 지도에서 보기`}
          onClick={onSelect}
          className="grid w-full grid-cols-[31px_minmax(0,1fr)] items-center gap-2 rounded-08 text-left outline-none transition-colors hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-1 active:bg-neutral-100"
        >
          {content}
        </button>
      ) : (
        <div className="grid grid-cols-[31px_minmax(0,1fr)] items-center gap-2">{content}</div>
      )}
    </li>
  );
}
