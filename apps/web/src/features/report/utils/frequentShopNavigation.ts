import type { FrequentShopPeriod } from '@/features/report/types';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';

const FREQUENT_SHOP_PERIOD_SEARCH_PARAM = 'period';

/** 선택한 집계 기간이 포함된 단골 리스트 경로를 생성합니다. */
export const createFrequentShopListPath = (period: FrequentShopPeriod) => {
  const searchParams = new URLSearchParams({
    [FREQUENT_SHOP_PERIOD_SEARCH_PARAM]: period,
  });

  return `${ROUTE_PATHS.frequentShopList}?${searchParams.toString()}`;
};

/** URL에서 단골 리스트의 집계 기간을 읽으며, 유효하지 않으면 이번 달을 반환합니다. */
export const getFrequentShopPeriod = (searchParams: URLSearchParams): FrequentShopPeriod =>
  searchParams.get(FREQUENT_SHOP_PERIOD_SEARCH_PARAM) === 'all' ? 'all' : 'currentMonth';

/** 기존 검색 파라미터를 유지하면서 단골 리스트의 집계 기간을 갱신합니다. */
export const updateFrequentShopPeriodSearchParams = (
  searchParams: URLSearchParams,
  period: FrequentShopPeriod
) => {
  const nextSearchParams = new URLSearchParams(searchParams);
  nextSearchParams.set(FREQUENT_SHOP_PERIOD_SEARCH_PARAM, period);

  return nextSearchParams;
};
