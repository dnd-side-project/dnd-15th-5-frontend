import { MOCK_EMPTY_REPORT_PAGE, MOCK_REPORT_PAGE, MOCK_SPENDING_RECORD_GROUPS } from './mockData';

describe('report mock data', () => {
  it('월간 집계와 주간 기록 수가 소비내역 그룹과 일치한다', () => {
    const monthlyRecordCount = MOCK_SPENDING_RECORD_GROUPS.reduce(
      (total, { records }) => total + records.length,
      0
    );

    expect(MOCK_REPORT_PAGE.monthlyRecordCount).toBe(monthlyRecordCount);
    expect(
      MOCK_REPORT_PAGE.monthlyStickerImages.length + MOCK_REPORT_PAGE.monthlyAdditionalStickerCount
    ).toBe(monthlyRecordCount);

    MOCK_REPORT_PAGE.weeklyRecords.forEach((weeklyRecord) => {
      const count = 'count' in weeklyRecord ? weeklyRecord.count : undefined;
      const recordGroup = MOCK_SPENDING_RECORD_GROUPS.find(
        (group) => group.dateValue === weeklyRecord.dateValue
      );

      expect(count).toBe(recordGroup?.records.length);
    });
  });

  it('빈 상태에는 월간 및 주간 소비 기록이 없다', () => {
    expect(MOCK_EMPTY_REPORT_PAGE.monthlyRecordCount).toBe(0);
    expect(MOCK_EMPTY_REPORT_PAGE.weeklyRecords).toHaveLength(0);
  });
});
