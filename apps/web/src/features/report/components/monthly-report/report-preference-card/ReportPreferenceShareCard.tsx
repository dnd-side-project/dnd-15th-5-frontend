import type { ReportPreferenceCardVariant } from '@/features/report/types';

import ReportPreferenceCard from './ReportPreferenceCard';

import type { ReportPreferenceCardMetric } from './ReportPreferenceCard';

type ReportPreferenceShareCardProps = {
  description: string;
  metrics: readonly ReportPreferenceCardMetric[];
  tags: readonly string[];
  title: string;
  variant: ReportPreferenceCardVariant;
};

/** PNG 저장 시 화면 상태와 무관하게 동일한 뒷면을 제공하는 취향 카드입니다. */
export default function ReportPreferenceShareCard({
  description,
  metrics,
  tags,
  title,
  variant,
}: ReportPreferenceShareCardProps) {
  return (
    <ReportPreferenceCard
      description={description}
      isFlipped
      metrics={metrics}
      tags={tags}
      title={title}
      variant={variant}
    />
  );
}
