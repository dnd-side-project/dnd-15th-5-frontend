import { renderHook } from '@testing-library/react';

import { useMonthlyStickerRecordsQuery } from './useMonthlyStickerRecordsQuery';

const mockUseGetCurrentStatus = jest.fn();

jest.mock('@/features/report/apis/queries', () => ({
  useGetCurrentStatus: (...arguments_: unknown[]) => mockUseGetCurrentStatus(...arguments_),
}));

describe('useMonthlyStickerRecordsQuery', () => {
  it('선택한 연월로 현재 리포트 현황을 조회한다', () => {
    mockUseGetCurrentStatus.mockReturnValue({ data: [] });

    renderHook(() => useMonthlyStickerRecordsQuery({ month: 8, year: 2026 }));

    expect(mockUseGetCurrentStatus).toHaveBeenCalledWith(
      { yearMonth: '2026-08' },
      { query: { select: expect.any(Function) } }
    );
  });
});
