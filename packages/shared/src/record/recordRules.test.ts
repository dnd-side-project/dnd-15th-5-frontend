import {
  createInitialVisitDateTime,
  formatAmount,
  formatPurchaseDateTime,
  formatVisitDateTime,
  formatVisitDateTimeConfirmLabel,
  getCalendarWeekCount,
  getVisitPeriodForHour,
  isSameOrAfterMonth,
  isValidRecordAmount,
  MAX_RECORD_AMOUNT,
  sanitizeAmount,
  validateRecordRequiredFields,
  WEEKDAY_LABELS,
} from './index';

describe('shared record rules', () => {
  it('금액을 정제하고 세 자리마다 쉼표를 표시한다', () => {
    expect(sanitizeAmount('0012abc-000')).toBe('12000');
    expect(formatAmount('12345678901234567890')).toBe('12,345,678,901,234,567,890');
  });

  it('1원 이상 최댓값 이하의 안전한 정수 금액만 유효하게 판단한다', () => {
    expect(isValidRecordAmount('')).toBe(false);
    expect(isValidRecordAmount('0')).toBe(false);
    expect(isValidRecordAmount('001')).toBe(true);
    expect(isValidRecordAmount(String(MAX_RECORD_AMOUNT))).toBe(true);
    expect(isValidRecordAmount(String(MAX_RECORD_AMOUNT + 1))).toBe(false);
    expect(isValidRecordAmount('9'.repeat(30))).toBe(false);
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

  it('선택한 날짜와 시간대를 소비 등록 API 형식으로 변환한다', () => {
    expect(formatPurchaseDateTime({ date: new Date(2026, 6, 5), period: 'evening' })).toEqual({
      purchaseDate: '2026-07-05',
      purchaseTime: '17:00:00',
    });

    expect(
      formatPurchaseDateTime({ date: new Date(2026, 6, 5, 19, 30, 15), period: 'evening' })
    ).toEqual({
      purchaseDate: '2026-07-05',
      purchaseTime: '19:30:15',
    });
  });

  it('방문 일시는 올해면 월일부터, 다른 연도면 연도부터 표시한다', () => {
    const now = new Date(2026, 7, 20);

    expect(formatVisitDateTime({ date: new Date(2026, 6, 5), period: 'evening' }, now)).toBe(
      '7월 5일 (일) · 저녁'
    );
    expect(formatVisitDateTime({ date: new Date(2025, 6, 5), period: 'evening' }, now)).toBe(
      '2025년 7월 5일 (토) · 저녁'
    );
  });

  it('방문 일시 확인 버튼은 다른 연도의 날짜에만 연도를 표시한다', () => {
    const now = new Date(2026, 7, 20);

    expect(
      formatVisitDateTimeConfirmLabel({ date: new Date(2026, 6, 5), period: 'evening' }, now)
    ).toBe('7월 5일 저녁');
    expect(
      formatVisitDateTimeConfirmLabel({ date: new Date(2025, 6, 5), period: 'evening' }, now)
    ).toBe('2025년 7월 5일 저녁');
  });

  it('달력의 7개 요일과 미래 월 이동 제한을 웹·앱에서 같은 규칙으로 계산한다', () => {
    expect(WEEKDAY_LABELS).toHaveLength(7);
    expect(isSameOrAfterMonth(new Date(2026, 7, 1), new Date(2026, 7, 20))).toBe(true);
    expect(isSameOrAfterMonth(new Date(2026, 8, 1), new Date(2026, 7, 20))).toBe(true);
    expect(isSameOrAfterMonth(new Date(2026, 6, 1), new Date(2026, 7, 20))).toBe(false);
  });

  it('월별 달력의 주 수를 계산한다', () => {
    expect(getCalendarWeekCount(new Date(2026, 1, 1))).toBe(4);
    expect(getCalendarWeekCount(new Date(2026, 2, 1))).toBe(5);
    expect(getCalendarWeekCount(new Date(2026, 7, 1))).toBe(6);
  });
});
