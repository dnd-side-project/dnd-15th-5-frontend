import { renderHook } from '@testing-library/react';

import { getGetMonthlyReportQueryOptions } from '@/features/report/apis/queries';

import { useAdjacentMonthlyReportPrefetch } from './useAdjacentMonthlyReportPrefetch';
import { MONTHLY_REPORT_CACHE_TIME } from './useMonthlyReportQuery';

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
        query: {
          gcTime: MONTHLY_REPORT_CACHE_TIME,
          staleTime: MONTHLY_REPORT_CACHE_TIME,
        },
      }
    );
    expect(mockPrefetchQuery).toHaveBeenCalledTimes(1);
  });
});
