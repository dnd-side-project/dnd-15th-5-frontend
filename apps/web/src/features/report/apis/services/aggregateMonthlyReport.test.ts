import { aggregateMonthlyReport as aggregateMonthlyReportRequest } from '@/features/report/apis/clients';

import { aggregateMonthlyReport } from './aggregateMonthlyReport';

jest.mock('@/features/report/apis/clients', () => ({
  aggregateMonthlyReport: jest.fn(),
}));

const mockAggregateMonthlyReportRequest = jest.mocked(aggregateMonthlyReportRequest);
let mockIsDevelopment = true;

jest.mock('@/shared/lib/env', () => ({
  get IS_DEVELOPMENT() {
    return mockIsDevelopment;
  },
}));

describe('aggregateMonthlyReport', () => {
  beforeEach(() => {
    mockAggregateMonthlyReportRequest.mockClear();
  });

  afterEach(() => {
    mockIsDevelopment = true;
  });

  it('선택한 연월로 개발용 리포트 배치를 실행한다', async () => {
    mockAggregateMonthlyReportRequest.mockResolvedValue({
      data: { lockAcquired: true, succeededCount: 1, targetUserCount: 1 },
    });

    await aggregateMonthlyReport('2026-06');

    expect(mockAggregateMonthlyReportRequest).toHaveBeenCalledWith(
      { yearMonth: '2026-06' },
      { timeout: 60_000 },
      undefined
    );
  });

  it('개발 환경이 아니면 배치를 호출하지 않는다', async () => {
    mockIsDevelopment = false;

    await expect(aggregateMonthlyReport('2026-06')).rejects.toThrow(
      '월간 리포트 배치는 개발 환경에서만 실행할 수 있습니다.'
    );
    expect(mockAggregateMonthlyReportRequest).not.toHaveBeenCalled();
  });
});
