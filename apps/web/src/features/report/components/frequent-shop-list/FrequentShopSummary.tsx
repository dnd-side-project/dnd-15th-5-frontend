import { Link } from 'react-router-dom';

import { MOCK_FREQUENT_SHOPS } from '@/features/report/mockData';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';

import FrequentShopItem from './FrequentShopItem';

import type { ReactNode } from 'react';

type FrequentShopSummaryProps = {
  headerContent?: ReactNode;
};

const SUMMARY_SHOP_COUNT = 7;

/** 홈 바텀시트에 이번 달 방문 횟수 기준 상위 단골 가게를 요약해 보여줍니다. */
export default function FrequentShopSummary({ headerContent }: FrequentShopSummaryProps) {
  const frequentShops = MOCK_FREQUENT_SHOPS.slice(0, SUMMARY_SHOP_COUNT);

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-sticky-header bg-neutral-00 pt-1">{headerContent}</header>

      <h1 className="sr-only">자주 소비한 곳</h1>
      <p className="mt-4 text-center text-body-02-medium text-neutral-500">
        이번달 가장 많이 방문했어요!
      </p>
      <ol className="-mx-4 flex flex-col gap-6 pt-4">
        {frequentShops.map((shop, index) => (
          <FrequentShopItem
            key={shop.id}
            category={shop.category}
            dongname={shop.district}
            placeName={shop.name}
            rank={index + 1}
            thumbnailSrc={shop.thumbnailSrc}
            visitCount={shop.monthlyVisitCount}
          />
        ))}
      </ol>

      <Link
        to={ROUTE_PATHS.frequentShopList}
        className="mt-4 mb-28 inline-flex h-8 self-center items-center justify-center rounded-full bg-neutral-100 px-4 text-body-02-medium text-neutral-600 outline-none hover:bg-neutral-200 focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-1 active:bg-neutral-300"
      >
        누적기록 보기
      </Link>
    </div>
  );
}
