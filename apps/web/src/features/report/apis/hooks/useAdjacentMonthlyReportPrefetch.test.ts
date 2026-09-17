import { renderHook } from '@testing-library/react';

import { getGetMonthlyReportQueryOptions } from '@/features/report/apis/queries';
import type { MonthlyReportData } from '@/features/report/types';

import { useAdjacentMonthlyReportPrefetch } from './useAdjacentMonthlyReportPrefetch';

const prefetchedReport: MonthlyReportData = {
  adjacentCards: [],
  isUnavailable: true,
  month: { month: 6, year: 2026 },
};
const mockUseQueries = jest.fn((_options?: unknown) => [
  { data: prefetchedReport },
  { data: undefined },
]);

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQueries: (options: unknown) => mockUseQueries(options),
}));

jest.mock('@/features/report/apis/queries', () => ({
  getGetMonthlyReportQueryOptions: jest.fn((params, options) => ({ params, ...options.query })),
}));

describe('useAdjacentMonthlyReportPrefetch', () => {
  beforeEach(() => {
    mockUseQueries.mockClear();
    jest.mocked(getGetMonthlyReportQueryOptions).mockClear();
  });

  it('빈 달을 포함한 양옆 달을 미리 조회하고 완료된 응답을 반환한다', () => {
    const { result } = renderHook(() =>
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
        query: expect.objectContaining({ select: expect.any(Function) }),
      }
    );
    expect(getGetMonthlyReportQueryOptions).toHaveBeenCalledWith(
      { yearMonth: '2026-08' },
      {
        query: expect.objectContaining({ select: expect.any(Function) }),
      }
    );
    expect(result.current).toEqual([prefetchedReport]);
  });
});
