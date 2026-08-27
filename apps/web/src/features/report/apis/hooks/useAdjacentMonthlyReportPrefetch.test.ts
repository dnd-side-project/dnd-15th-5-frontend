import { renderHook } from '@testing-library/react';

import { MONTHLY_REPORT_QUERY_CACHE_OPTIONS } from '@/features/report/apis/cacheOptions';
import { getGetMonthlyReportQueryOptions } from '@/features/report/apis/queries';

import { useAdjacentMonthlyReportPrefetch } from './useAdjacentMonthlyReportPrefetch';

const mockPrefetchQuery = jest.fn();

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQueryClient: () => ({ prefetchQuery: mockPrefetchQuery }),
}));

jest.mock('@/features/report/apis/queries', () => ({
  getGetMonthlyReportQueryOptions: jest.fn((params, options) => ({ params, ...options.query })),
}));

describe('useAdjacentMonthlyReportPrefetch', () => {
  beforeEach(() => {
    mockPrefetchQuery.mockClear();
  });

  it('리포트가 존재하는 양옆 달만 미리 조회한다', () => {
    renderHook(() =>
      useAdjacentMonthlyReportPrefetch([
        {
          description: '설명',
          isUnavailable: false,
          metrics: [],
          month: { month: 6, year: 2026 },
          tags: [],
          title: '골목 발굴러',
          variant: 'alley-explorer',
        },
        { isUnavailable: true, month: { month: 8, year: 2026 } },
      ])
    );

    expect(getGetMonthlyReportQueryOptions).toHaveBeenCalledWith(
      { yearMonth: '2026-06' },
      {
        query: MONTHLY_REPORT_QUERY_CACHE_OPTIONS,
      }
    );
    expect(mockPrefetchQuery).toHaveBeenCalledTimes(1);
  });
});
