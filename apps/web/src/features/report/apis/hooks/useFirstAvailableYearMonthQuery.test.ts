import { renderHook } from '@testing-library/react';

import { useFirstAvailableYearMonthQuery } from './useFirstAvailableYearMonthQuery';

const mockUseGetCurrentStatus = jest.fn();

jest.mock('@/features/report/apis/queries', () => ({
  useGetCurrentStatus: (...arguments_: unknown[]) => mockUseGetCurrentStatus(...arguments_),
}));

describe('useFirstAvailableYearMonthQuery', () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-08-25T12:00:00+09:00'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('현재 월을 조회하고 최초 조회 가능 연월을 화면 모델로 변환한다', () => {
    mockUseGetCurrentStatus.mockImplementation((_params, options) => ({
      data: options.query.select({ data: { firstAvailableYearMonth: '2025-11' } }),
    }));

    const { result } = renderHook(() => useFirstAvailableYearMonthQuery());

    expect(mockUseGetCurrentStatus).toHaveBeenCalledWith(
      { yearMonth: '2026-08' },
      expect.objectContaining({ query: expect.objectContaining({ select: expect.any(Function) }) })
    );
    expect(result.current.data).toEqual({ year: 2025, month: 11 });
  });
});
