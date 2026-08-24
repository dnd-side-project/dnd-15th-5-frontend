import { mapCurrentStatusToReportPageData } from './currentReport';

describe('mapCurrentStatusToReportPageData', () => {
  it('현재 리포트 응답을 화면 데이터로 변환한다', () => {
    const report = mapCurrentStatusToReportPageData(
      {
        date: '2026-08-20',
        monthlyCount: 7,
        monthlyStickers: [
          { itemName: '커피' },
          { itemName: '피자' },
          { itemName: '다트' },
          { itemName: '아이스크림' },
          { itemName: 'LP' },
          { itemName: '도넛' },
          { itemName: '마이크' },
        ],
        recentDiscoveryMessage: '밤 활동 비중이 늘었어요',
        weeklyCounts: [1, 0, 2, 0, 3, 0, 0],
      },
      '2026-08'
    );

    expect(report.monthLabel).toBe('8월');
    expect(report.monthlyRecordCount).toBe(7);
    expect(report.monthlyStickerImages).toHaveLength(5);
    expect(report.monthlyAdditionalStickerCount).toBe(2);
    expect(report.recentDiscovery).toBe('밤 활동 비중이 늘었어요');
    expect(report.weeklyPeriodLabel).toBe('8월 16일부터 22일까지');
    expect(report.weeklyRecords).toEqual([
      expect.objectContaining({ count: 1, date: 16, day: '일' }),
      expect.objectContaining({ date: 17, day: '월' }),
      expect.objectContaining({ count: 2, date: 18, day: '화' }),
      expect.objectContaining({ date: 19, day: '수' }),
      expect.objectContaining({ count: 3, date: 20, day: '목', isToday: true }),
      expect.objectContaining({ date: 21, day: '금', isFuture: true }),
      expect.objectContaining({ date: 22, day: '토', isFuture: true }),
    ]);
  });

  it('응답 데이터가 없으면 요청 월을 기준으로 빈 화면 데이터를 만든다', () => {
    const report = mapCurrentStatusToReportPageData(undefined, '2026-09', new Date(2026, 7, 25));

    expect(report.monthLabel).toBe('9월');
    expect(report.monthlyRecordCount).toBe(0);
    expect(report.monthlyStickerImages).toEqual([]);
    expect(report.recentDiscovery).toBe('');
    expect(report.weeklyRecords).toHaveLength(7);
  });

  it('추가 개수는 소비 기록 수가 아닌 지원되는 스티커 수를 기준으로 계산한다', () => {
    const report = mapCurrentStatusToReportPageData(
      {
        date: '2026-08-20',
        monthlyCount: 7,
        monthlyStickers: [
          { itemName: '커피' },
          { itemName: '피자' },
          { itemName: '다트' },
          { itemName: '아이스크림' },
          { itemName: 'LP' },
          { itemName: '도넛' },
          { itemName: '스페셜' },
        ],
      },
      '2026-08'
    );

    expect(report.monthlyStickerImages).toHaveLength(5);
    expect(report.monthlyAdditionalStickerCount).toBe(1);
  });
});
