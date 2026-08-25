import { parseReceiptVisitDateTime } from './parseReceiptVisitDateTime';

describe('parseReceiptVisitDateTime', () => {
  const now = new Date(2026, 7, 20, 15);

  it('OCR 날짜와 시각을 방문 일시와 시간대로 변환한다', () => {
    expect(parseReceiptVisitDateTime('2026-07-25', '19:30:00', now)).toEqual({
      date: new Date(2026, 6, 25, 19, 30),
      period: 'evening',
    });
  });

  it('시각을 인식하지 못하면 현재 시간대로 날짜만 복원한다', () => {
    expect(parseReceiptVisitDateTime('2026-07-25', null, now)).toEqual({
      date: new Date(2026, 6, 25, 15),
      period: 'afternoon',
    });
  });

  it('잘못됐거나 미래인 날짜는 사용하지 않는다', () => {
    expect(parseReceiptVisitDateTime('2026-02-30', '11:00:00', now)).toBeUndefined();
    expect(parseReceiptVisitDateTime('2026-08-21', '11:00:00', now)).toBeUndefined();
  });
});
