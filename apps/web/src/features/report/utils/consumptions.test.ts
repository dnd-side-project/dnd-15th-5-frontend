import {
  createRecentSpendingMonths,
  formatSpendingYearMonth,
  groupConsumptionsByDate,
} from './consumptions';

describe('consumptions', () => {
  it('API 소비내역을 날짜별로 묶고 화면 표시값을 채운다', () => {
    const groups = groupConsumptionsByDate([
      {
        id: 1,
        placeName: '아오이 카페',
        category: '카페',
        amount: 5_500,
        purchaseDate: '2026-08-22',
        purchaseTime: '09:30:00',
      },
      {
        id: 2,
        placeName: '장승마라탕',
        category: '음식점',
        amount: 12_000,
        purchaseDate: '2026-08-22',
        purchaseTime: '18:10:00',
      },
    ]);

    expect(groups).toEqual([
      {
        dateValue: '2026-08-22',
        dateLabel: '22일 토요일',
        records: [
          {
            id: '1',
            shopName: '아오이 카페',
            category: '카페',
            amount: 5_500,
            paidAtLabel: '2026.08.22 · 오전',
          },
          {
            id: '2',
            shopName: '장승마라탕',
            category: '음식점',
            amount: 12_000,
            paidAtLabel: '2026.08.22 · 오후',
          },
        ],
      },
    ]);
  });

  it('유효하지 않은 날짜나 식별자가 없는 항목을 제외한다', () => {
    expect(
      groupConsumptionsByDate([{ id: 1, purchaseDate: 'invalid' }, { purchaseDate: '2026-08-22' }])
    ).toEqual([]);
  });

  it('연월을 API 형식으로 만들고 연도를 넘어 최근 월 목록을 계산한다', () => {
    expect(formatSpendingYearMonth({ year: 2026, month: 8 })).toBe('2026-08');
    expect(createRecentSpendingMonths(3, new Date(2026, 0, 15))).toEqual([
      { year: 2026, month: 1 },
      { year: 2025, month: 12 },
      { year: 2025, month: 11 },
    ]);
  });
});
