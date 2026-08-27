import type { MonthlyReportSummaryItem } from '@/features/report/types';

import ReportSectionTitle from './ReportSectionTitle';

type ReportActivitySummaryProps = {
  items: readonly MonthlyReportSummaryItem[];
};

/** 방문 횟수 등 월간 활동의 핵심 수치를 요약해 표시합니다. */
export default function ReportActivitySummary({ items }: ReportActivitySummaryProps) {
  return (
    <section>
      <ReportSectionTitle title="활동 요약" />
      <dl className="mt-3 grid grid-cols-3 rounded-15 bg-neutral-50 py-5.5 text-center">
        {items.map((item, index) => (
          <div className={index === 0 ? '' : 'border-l border-neutral-300'} key={item.label}>
            <dt className="text-body-02-medium text-neutral-500">{item.label}</dt>
            <dd className="mt-2 text-title-01-semibold text-neutral-900">{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
