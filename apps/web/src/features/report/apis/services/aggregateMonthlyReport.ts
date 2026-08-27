import { aggregateMonthlyReport as aggregateMonthlyReportRequest } from '@/features/report/apis/clients';
import { IS_DEVELOPMENT } from '@/shared/lib/env';

const MONTHLY_REPORT_BATCH_TIMEOUT_MS = 60_000;

/** 개발 서버에서 선택한 월의 리포트 배치를 즉시 실행합니다. */
export const aggregateMonthlyReport = (yearMonth: string, signal?: AbortSignal) => {
  if (!IS_DEVELOPMENT) {
    return Promise.reject(new Error('월간 리포트 배치는 개발 환경에서만 실행할 수 있습니다.'));
  }

  return aggregateMonthlyReportRequest(
    { yearMonth },
    { timeout: MONTHLY_REPORT_BATCH_TIMEOUT_MS },
    signal
  );
};
