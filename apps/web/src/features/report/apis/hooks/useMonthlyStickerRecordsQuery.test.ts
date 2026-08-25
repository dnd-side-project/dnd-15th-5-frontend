import { renderHook } from '@testing-library/react';

import { getStickerImageByName } from '@/shared/assets/images/stickers';

import {
  createMonthlyStickerRecordGroups,
  useMonthlyStickerRecordsQuery,
} from './useMonthlyStickerRecordsQuery';

const mockUseGetCurrentStatus = jest.fn();

jest.mock('@/features/report/apis/queries', () => ({
  useGetCurrentStatus: (...arguments_: unknown[]) => mockUseGetCurrentStatus(...arguments_),
}));

describe('createMonthlyStickerRecordGroups', () => {
  it('스티커를 획득일 내림차순으로 묶고 이미지로 변환한다', () => {
    expect(
      createMonthlyStickerRecordGroups([
        { acquiredDate: '2026-08-21', itemName: '감자튀김' },
        { acquiredDate: '2026-08-23', itemName: '피자' },
        { acquiredDate: '2026-08-21', itemName: '커피' },
      ])
    ).toEqual([
      {
        dateLabel: '23일 일요일',
        dateValue: '2026-08-23',
        stickerImages: [getStickerImageByName('피자')],
      },
      {
        dateLabel: '21일 금요일',
        dateValue: '2026-08-21',
        stickerImages: [getStickerImageByName('감자튀김'), getStickerImageByName('커피')],
      },
    ]);
  });

  it('획득일이 없는 스티커는 날짜 그룹에서 제외한다', () => {
    expect(createMonthlyStickerRecordGroups([{ itemName: '감자튀김' }])).toEqual([]);
  });

  it('선택한 연월로 현재 리포트 현황을 조회한다', () => {
    mockUseGetCurrentStatus.mockReturnValue({ data: [] });

    renderHook(() => useMonthlyStickerRecordsQuery({ month: 8, year: 2026 }));

    expect(mockUseGetCurrentStatus).toHaveBeenCalledWith(
      { yearMonth: '2026-08' },
      { query: { select: expect.any(Function) } }
    );
  });
});
