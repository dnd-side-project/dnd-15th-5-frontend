import { useRef } from 'react';

import type { PlaceDetailResponse } from '@/features/shop/apis/dto';
import { useShopStickerCollapse } from '@/features/shop/hooks/useShopStickerCollapse';
import { useVisitHistoryRestore } from '@/features/shop/hooks/useVisitHistoryRestore';
import { LocationPinIcon } from '@/shared/assets/icons';
import { cn } from '@/shared/lib/cn';
import type { RecordLocationState } from '@/shared/types/recordNavigation';
import { Chip } from '@/shared/ui/chip';
import { RegularShopBadge } from '@/shared/ui/regular-shop-badge';

import ShopStickerHero from './ShopStickerHero';
import VisitHistoryList from './VisitHistoryList';
import VisitSummaryCard from './VisitSummaryCard';

import type { ComponentProps, ReactNode } from 'react';

const HEADER_CORNER_TRANSITION_DISTANCE = 96;
const HEADER_CORNER_CLASS = 'rounded-t-[calc(var(--radius-30)*var(--shop-header-rounding,1))]';

type ShopDetailViewProps = {
  headerContent: ReactNode;
  onViewOnMap: () => void;
  placeId: number;
  place: PlaceDetailResponse;
  recordLocationState?: RecordLocationState;
  stickerImages: readonly string[];
  scrollToDate?: string;
  scrollToConsumptionId?: number;
  isRestoreTargetPending?: boolean;
  visitHistory: Omit<ComponentProps<typeof VisitHistoryList>, 'scrollRootRef'>;
  loadedVisitPageCount: number;
};

/** 가게 정보와 방문 기록, 획득한 스티커를 표시하는 상세 화면입니다. */
export default function ShopDetailView({
  headerContent,
  onViewOnMap,
  placeId,
  place,
  recordLocationState,
  stickerImages,
  visitHistory,
  loadedVisitPageCount,
  scrollToDate,
  scrollToConsumptionId,
  isRestoreTargetPending,
}: ShopDetailViewProps) {
  const scrollRootRef = useRef<HTMLDivElement>(null);
  const informationPanelRef = useRef<HTMLDivElement>(null);
  const stickyHeaderRef = useRef<HTMLDivElement>(null);
  useShopStickerCollapse({ scrollRootRef, informationPanelRef });
  useVisitHistoryRestore({
    ...visitHistory,
    scrollRootRef,
    stickyHeaderRef,
    scrollToDate,
    scrollToConsumptionId,
    isRestoreTargetPending,
    loadedPageCount: loadedVisitPageCount,
  });
  const hasRecordedVisits =
    (place.stats?.totalVisitCount ?? 0) > 0 || visitHistory.visits.length > 0;

  return (
    <article className="-mx-4 flex h-dvh flex-col overflow-hidden bg-neutral-00">
      <header className="relative z-30 h-14.5 shrink-0 bg-neutral-00 px-4">{headerContent}</header>
      <div
        ref={scrollRootRef}
        role="region"
        aria-label="방문 요약과 방문 기록"
        onScroll={(event) => {
          const panel = informationPanelRef.current;
          if (!panel) return;
          const distanceToTop =
            panel.getBoundingClientRect().top - event.currentTarget.getBoundingClientRect().top;
          const progress = Math.min(
            1,
            Math.max(0, distanceToTop / HEADER_CORNER_TRANSITION_DISTANCE)
          );
          // NOTE: 스크롤 위치는 CSS 변수로 전달해 스티커와 방문 목록의 재렌더링을 줄입니다.
          panel.style.setProperty('--shop-header-rounding', String(progress));
        }}
        className="scrollbar-hidden pb-safe-bottom min-h-0 flex-1 overflow-y-auto overscroll-y-contain scroll-auto"
      >
        <ShopStickerHero
          key={placeId}
          emptyMessage={hasRecordedVisits ? '기록한 이미지를 아직 표시할 수 없어요' : undefined}
          headerContent={null}
          placeId={placeId}
          stickerImages={stickerImages}
        />
        <div
          ref={informationPanelRef}
          className={cn('relative z-10 -mt-8.25 min-h-full bg-neutral-00', HEADER_CORNER_CLASS)}
        >
          <div
            ref={stickyHeaderRef}
            className={cn('sticky top-0 z-20 bg-neutral-00 px-4 pt-8 pb-6', HEADER_CORNER_CLASS)}
          >
            <div className="flex min-w-0 items-center gap-2">
              <h1
                className="min-w-0 truncate text-title-01-semibold text-neutral-700"
                data-mp-mask=""
              >
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
          </div>
          <div className="px-4">
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
      </div>
    </article>
  );
}
