import { renderHook } from '@testing-library/react';

import { useMonthlyStickerRecordsQuery } from './useMonthlyStickerRecordsQuery';

const mockUseGetStickerBoard = jest.fn();

jest.mock('@/features/report/apis/queries', () => ({
  useGetStickerBoard: (...arguments_: unknown[]) => mockUseGetStickerBoard(...arguments_),
}));

describe('useMonthlyStickerRecordsQuery', () => {
  it('선택한 연월로 스티커보드를 조회한다', () => {
    mockUseGetStickerBoard.mockReturnValue({ data: [] });

    renderHook(() => useMonthlyStickerRecordsQuery({ month: 8, year: 2026 }));

    expect(mockUseGetStickerBoard).toHaveBeenCalledWith(
      { yearMonth: '2026-08' },
      { query: { select: expect.any(Function) } }
    );
  });
});
