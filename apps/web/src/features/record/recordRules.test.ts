import {
  createInitialVisitDateTime,
  formatAmount,
  getVisitPeriodForHour,
  isSameOrAfterMonth,
  isValidRecordAmount,
  sanitizeAmount,
  validateRecordRequiredFields,
  WEEKDAY_LABELS,
} from '@chapchap/shared/record';

describe('shared record rules', () => {
  it('금액을 정제하고 세 자리마다 쉼표를 표시한다', () => {
    expect(sanitizeAmount('0012abc-000')).toBe('12000');
    expect(formatAmount('12345678901234567890')).toBe('12,345,678,901,234,567,890');
  });

  it('1원 이상의 금액만 유효하게 판단한다', () => {
    expect(isValidRecordAmount('')).toBe(false);
    expect(isValidRecordAmount('0')).toBe(false);
    expect(isValidRecordAmount('001')).toBe(true);
  });

  it.each([
    [4, 'night'],
    [5, 'morning'],
    [10, 'morning'],
    [11, 'afternoon'],
    [16, 'afternoon'],
    [17, 'evening'],
    [20, 'evening'],
    [21, 'night'],
  ] as const)('%i시는 %s 시간대로 분류한다', (hour, expectedPeriod) => {
    expect(getVisitPeriodForHour(hour)).toBe(expectedPeriod);
  });

  it('현재 시각으로 초기 방문 일시를 만들고 필수 항목을 함께 검증한다', () => {
    const now = new Date(2026, 7, 20, 13);

    expect(createInitialVisitDateTime(now)).toEqual({ date: now, period: 'afternoon' });
    expect(validateRecordRequiredFields({ hasShop: true, amount: '12000' })).toEqual({
      isShopValid: true,
      isAmountValid: true,
      canSubmit: true,
    });
    expect(validateRecordRequiredFields({ hasShop: false, amount: '12000' }).canSubmit).toBe(false);
  });

  it('달력의 7개 요일과 미래 월 이동 제한을 웹·앱에서 같은 규칙으로 계산한다', () => {
    expect(WEEKDAY_LABELS).toHaveLength(7);
    expect(isSameOrAfterMonth(new Date(2026, 7, 1), new Date(2026, 7, 20))).toBe(true);
    expect(isSameOrAfterMonth(new Date(2026, 8, 1), new Date(2026, 7, 20))).toBe(true);
    expect(isSameOrAfterMonth(new Date(2026, 6, 1), new Date(2026, 7, 20))).toBe(false);
  });
});
