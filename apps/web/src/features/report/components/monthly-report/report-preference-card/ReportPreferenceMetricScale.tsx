import { cn } from '@/shared/lib/cn';

export type ReportPreferenceCardMetric = {
  leftLabel: string;
  rightLabel: string;
  value: number;
};

type ReportPreferenceMetricScaleProps = {
  compact?: boolean;
  metric: ReportPreferenceCardMetric;
};

/** 소비 성향의 양극 지표와 현재 위치를 표시합니다. */
export default function ReportPreferenceMetricScale({
  compact = false,
  metric,
}: ReportPreferenceMetricScaleProps) {
  const markerPosition = Math.min(Math.max(metric.value, 0), 100);

  return (
    <div className={cn('flex flex-col', compact ? 'h-8.5' : 'h-9.75 gap-0.5')}>
      <div
        className={cn(
          'flex justify-between text-neutral-500',
          compact ? 'text-caption-01-medium' : 'text-label-01-medium'
        )}
      >
        <span>{metric.leftLabel}</span>
        <span>{metric.rightLabel}</span>
      </div>
      <div
        className={cn(
          'relative rounded-full bg-primary-300',
          compact ? 'mt-1 h-1.25' : 'mt-1.25 h-1.5'
        )}
      >
        <span
          aria-hidden
          className={cn(
            'absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-primary-500 bg-neutral-00',
            compact ? 'size-3.5 border-4' : 'size-4 border-4'
          )}
          style={{ left: `${markerPosition}%` }}
        />
      </div>
    </div>
  );
}
