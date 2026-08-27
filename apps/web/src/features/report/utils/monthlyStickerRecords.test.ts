import { createMonthlyStickerRecordGroups, formatAcquiredDateLabel } from './monthlyStickerRecords';

describe('monthlyStickerRecords', () => {
  it('스티커 API 응답을 획득일 내림차순으로 묶는다', () => {
    expect(
      createMonthlyStickerRecordGroups([
        { acquiredDate: '2026-08-21', itemName: '감자튀김' },
        { acquiredDate: '2026-08-23', itemName: '피자' },
        { acquiredDate: '2026-08-21', itemName: '커피' },
      ])
    ).toEqual([
      {
        acquiredDate: '2026-08-23',
        monthlyStickers: [{ acquiredDate: '2026-08-23', itemName: '피자' }],
      },
      {
        acquiredDate: '2026-08-21',
        monthlyStickers: [
          { acquiredDate: '2026-08-21', itemName: '감자튀김' },
          { acquiredDate: '2026-08-21', itemName: '커피' },
        ],
      },
    ]);
  });

  it('획득일이 없는 스티커는 날짜 그룹에서 제외한다', () => {
    expect(createMonthlyStickerRecordGroups([{ itemName: '감자튀김' }])).toEqual([]);
  });

  it('지원하지 않는 스티커도 API 응답 그대로 날짜 그룹에 유지한다', () => {
    expect(
      createMonthlyStickerRecordGroups([{ acquiredDate: '2026-08-21', itemName: '미지원' }])
    ).toEqual([
      {
        acquiredDate: '2026-08-21',
        monthlyStickers: [{ acquiredDate: '2026-08-21', itemName: '미지원' }],
      },
    ]);
  });

  it('획득일을 요일이 포함된 표시 문구로 변환한다', () => {
    expect(formatAcquiredDateLabel('2026-08-23')).toBe('23일 일요일');
    expect(formatAcquiredDateLabel('invalid')).toBe('invalid');
  });
});
