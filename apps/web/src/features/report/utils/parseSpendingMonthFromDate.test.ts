import { parseSpendingMonthFromDate } from './parseSpendingMonthFromDate';

describe('parseSpendingMonthFromDate', () => {
  it('날짜 문자열에서 연도와 월을 추출한다', () => {
    expect(parseSpendingMonthFromDate('2026-08-22')).toEqual({ year: 2026, month: 8 });
  });

  it.each([undefined, '', '2026-13-22', '2026-8-22'])('잘못된 날짜는 null을 반환한다', (value) => {
    expect(parseSpendingMonthFromDate(value)).toBeNull();
  });
});
