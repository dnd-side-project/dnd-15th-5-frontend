import type { ReactNode } from 'react';

const ALIGNMENT_CLASS_NAMES = {
  center: 'left-1/2 -translate-x-1/2',
  end: 'right-0',
  start: 'left-0',
} as const;

type ReportChartTooltipProps = {
  alignment?: keyof typeof ALIGNMENT_CLASS_NAMES;
  children: ReactNode;
};

/** 월간 리포트 차트에서 hover와 키보드 focus 시 표시하는 값 안내입니다. */
export default function ReportChartTooltip({
  alignment = 'center',
  children,
}: ReportChartTooltipProps) {
  return (
    <span
      aria-hidden
      className={`invisible absolute bottom-full z-chart-tooltip mb-2 rounded-lg border border-neutral-700 bg-neutral-900 px-2.5 py-1.5 text-label-01-semibold whitespace-nowrap text-neutral-00 shadow-chart-tooltip group-hover:visible group-focus-visible:visible ${ALIGNMENT_CLASS_NAMES[alignment]}`}
    >
      {children}
    </span>
  );
}
