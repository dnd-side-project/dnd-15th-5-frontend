import { keepPreviousData } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';

import { MONTHLY_REPORT_QUERY_CACHE_OPTIONS } from '@/features/report/apis/cacheOptions';

import { useMonthlyReportQuery } from './useMonthlyReportQuery';

const mockUseGetMonthlyReport = jest.fn();

jest.mock('@/features/report/apis/queries', () => ({
  useGetMonthlyReport: (...arguments_: unknown[]) => mockUseGetMonthlyReport(...arguments_),
}));

describe('useMonthlyReportQuery', () => {
  it('선택한 연월로 월간 리포트를 조회한다', () => {
    mockUseGetMonthlyReport.mockReturnValue({ data: undefined });

    renderHook(() => useMonthlyReportQuery({ month: 7, year: 2026 }));

    expect(mockUseGetMonthlyReport).toHaveBeenCalledWith(
      { yearMonth: '2026-07' },
      {
        query: {
          ...MONTHLY_REPORT_QUERY_CACHE_OPTIONS,
          placeholderData: keepPreviousData,
          select: expect.any(Function),
        },
      }
    );
  });
});
