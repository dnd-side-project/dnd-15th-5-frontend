import {
  formatPurchaseDateTimeLabel,
  formatSpendingYearMonth,
  groupConsumptionsByDate,
} from './consumptions';

describe('consumptions', () => {
  it.each([undefined, '', 'invalid', '24:00:00', '09:60:00'])(
    '유효한 시각이 없으면 오전·오후를 임의로 표시하지 않는다: %s',
    (time) => {
      expect(formatPurchaseDateTimeLabel('2026-11-03', time)).toBe('2026.11.03');
    }
  );

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
        purchaseDate: '2026-08-22',
        consumptions: [
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
        ],
      },
    ]);
  });

  it('유효하지 않은 날짜나 식별자가 없는 항목을 제외한다', () => {
    expect(
      groupConsumptionsByDate([{ id: 1, purchaseDate: 'invalid' }, { purchaseDate: '2026-08-22' }])
    ).toEqual([]);
  });

  it('연월을 API 형식으로 만든다', () => {
    expect(formatSpendingYearMonth({ year: 2026, month: 8 })).toBe('2026-08');
  });
});
