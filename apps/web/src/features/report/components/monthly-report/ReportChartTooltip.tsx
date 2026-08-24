import type { ReactNode } from 'react';

const ALIGNMENT_CLASS_NAMES = {
  center: 'left-1/2 -translate-x-1/2',
  end: 'right-0',
  start: 'left-0',
} as const;

type ReportChartTooltipProps = {
  alignment?: keyof typeof ALIGNMENT_CLASS_NAMES;
  children: ReactNode;
  markerClassName?: string;
};

/** 월간 리포트 차트에서 hover와 키보드 focus 시 표시하는 값 안내입니다. */
export default function ReportChartTooltip({
  alignment = 'center',
  children,
  markerClassName,
}: ReportChartTooltipProps) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none invisible absolute bottom-full z-chart-tooltip mb-2 inline-flex origin-bottom translate-y-1 scale-95 items-center gap-1.5 rounded-16 border border-neutral-600 bg-neutral-700 px-3 py-2 text-label-01-semibold whitespace-nowrap text-neutral-00 opacity-0 shadow-chart-tooltip transition duration-150 group-hover:visible group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100 group-focus-visible:visible group-focus-visible:translate-y-0 group-focus-visible:scale-100 group-focus-visible:opacity-100 motion-reduce:transform-none motion-reduce:transition-none ${ALIGNMENT_CLASS_NAMES[alignment]}`}
    >
      {markerClassName && (
        <span aria-hidden className={`size-2 shrink-0 rounded-full ${markerClassName}`} />
      )}
      {children}
    </span>
  );
}
