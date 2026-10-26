import { useRef } from 'react';

import type { PlaceDetailResponse } from '@/features/shop/apis/dto';
import { LocationPinIcon } from '@/shared/assets/icons';
import type { RecordLocationState } from '@/shared/types/recordNavigation';
import { Chip } from '@/shared/ui/chip';
import { RegularShopBadge } from '@/shared/ui/regular-shop-badge';

import ShopStickerHero from './ShopStickerHero';
import VisitHistoryList from './VisitHistoryList';
import VisitSummaryCard from './VisitSummaryCard';

import type { ComponentProps, ReactNode } from 'react';

type ShopDetailViewProps = {
  headerContent: ReactNode;
  onViewOnMap: () => void;
  placeId: number;
  place: PlaceDetailResponse;
  recordLocationState?: RecordLocationState;
  stickerImages: readonly string[];
  newestStickerIndex?: number;
  visitHistory: Omit<ComponentProps<typeof VisitHistoryList>, 'scrollRootRef'>;
};

/** 실제 장소 상세와 스티커 미리보기에서 공통으로 사용하는 상세 화면입니다. */
export default function ShopDetailView({
  headerContent,
  onViewOnMap,
  placeId,
  place,
  recordLocationState,
  stickerImages,
  newestStickerIndex,
  visitHistory,
}: ShopDetailViewProps) {
  const scrollRootRef = useRef<HTMLDivElement>(null);

  return (
    <article className="-mx-4 flex h-dvh flex-col overflow-hidden bg-neutral-00">
      <ShopStickerHero
        key={placeId}
        headerContent={headerContent}
        placeId={placeId}
        stickerImages={stickerImages}
        newestStickerIndex={newestStickerIndex}
      />
      <div className="relative z-10 -mt-8.25 flex min-h-0 flex-1 flex-col rounded-t-30 bg-neutral-00 px-4 pt-8">
        <div className="flex min-w-0 items-center gap-2">
          <h1 className="min-w-0 truncate text-title-01-semibold text-neutral-700" data-mp-mask="">
            {place.placeName}
          </h1>
          {place.isRegular && <RegularShopBadge />}
        </div>

        <div className="mt-2 flex min-w-0 items-center gap-2" data-mp-mask="">
          <Chip>{place.category ?? '기타'}</Chip>
          <span aria-hidden="true" className="text-caption-01-regular text-neutral-300">
            |
          </span>
          <p className="flex min-w-0 items-start gap-1 text-caption-01-regular text-neutral-500">
            <LocationPinIcon aria-hidden="true" className="mt-0.5 shrink-0" />
            <span className="line-clamp-2">{place.address}</span>
          </p>
        </div>

        <div
          ref={scrollRootRef}
          role="region"
          aria-label="방문 요약과 방문 기록"
          className="scrollbar-hidden pb-safe-bottom -mx-4 mt-6 min-h-0 flex-1 overflow-y-auto px-4"
        >
          <VisitSummaryCard
            firstVisitedDate={place.stats?.firstVisitedDate}
            monthlyVisitCount={place.stats?.monthlyVisitCount ?? 0}
            onViewOnMap={onViewOnMap}
            placeId={placeId}
            recordLocationState={recordLocationState}
            totalVisitCount={place.stats?.totalVisitCount ?? visitHistory.visits.length}
          />
          <VisitHistoryList {...visitHistory} scrollRootRef={scrollRootRef} />
        </div>
      </div>
    </article>
  );
}
