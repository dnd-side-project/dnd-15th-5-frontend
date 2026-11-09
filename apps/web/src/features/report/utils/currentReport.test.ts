import { mapCurrentStatusToReportPageData } from './currentReport';

describe('mapCurrentStatusToReportPageData', () => {
  it('서버 기준일의 월을 반환한다', () => {
    const report = mapCurrentStatusToReportPageData({ date: '2026-08-20' }, '2026-09');

    expect(report.monthLabel).toBe('8월');
  });

  it('응답 데이터가 없으면 요청 월을 반환한다', () => {
    const report = mapCurrentStatusToReportPageData(undefined, '2026-09', new Date(2026, 7, 25));

    expect(report.monthLabel).toBe('9월');
  });
});
