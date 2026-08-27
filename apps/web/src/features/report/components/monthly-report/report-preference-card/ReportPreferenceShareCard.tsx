import type { ReportPreferenceCardVariant, ReportPreferenceMetric } from '@/features/report/types';
import { ReportCardTextureImage } from '@/shared/assets/images/preference-card';
import { cn } from '@/shared/lib/cn';

import { REPORT_PREFERENCE_CARD_VARIANTS } from './reportPreferenceCardVariants';
import ReportPreferenceMetricScale from './ReportPreferenceMetricScale';

type ReportPreferenceShareCardProps = {
  metrics: readonly ReportPreferenceMetric[];
  tags: readonly string[];
  title: string;
  variant: ReportPreferenceCardVariant;
};

/** PNG 저장 결과에 사용하는 앞면과 지표가 결합된 소비 성향 카드입니다. */
export default function ReportPreferenceShareCard({
  metrics,
  tags,
  title,
  variant,
}: ReportPreferenceShareCardProps) {
  const variantConfig = REPORT_PREFERENCE_CARD_VARIANTS[variant];

  return (
    <article
      aria-label={`${title} 이미지 저장 카드`}
      className={cn(
        'relative h-129 w-61 overflow-hidden rounded-15 shadow-report-preference-save-card',
        variantConfig.frontClassName
      )}
    >
      <img
        alt=""
        aria-hidden
        className={cn(
          'absolute inset-x-0 top-0 h-82.75 w-full object-cover mix-blend-overlay',
          variantConfig.textureClassName
        )}
        src={ReportCardTextureImage}
      />
      <div
        aria-hidden
        className={cn(
          'absolute top-20.5 left-15 h-40.75 w-31.25 rounded-full',
          variantConfig.spotClassName
        )}
      />
      <div
        className={cn(
          'absolute top-10 flex w-full items-center justify-center gap-2.5',
          variantConfig.titleClassName
        )}
      >
        <span aria-hidden className="text-base">
          ✦
        </span>
        <h1 className="text-center font-waguri text-card-title-03-regular">{title}</h1>
        <span aria-hidden className="text-base">
          ✦
        </span>
      </div>
      <img
        alt={variantConfig.characterAlt}
        className={cn('absolute object-contain', variantConfig.saveCharacterClassName)}
        src={variantConfig.characterImage}
      />
      <div className="absolute top-69 right-0 left-0 flex justify-center gap-1.25">
        {tags.map((tag) => (
          <span
            className="rounded-full bg-neutral-00/90 px-2.75 py-1.5 text-label-01-semibold text-neutral-700"
            key={tag}
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="absolute inset-x-0 top-79.5 h-49.5 rounded-15 bg-neutral-00" />
      <div className="absolute top-84.75 left-6.5 flex w-48.25 flex-col gap-1.25">
        {metrics.map((metric) => (
          <ReportPreferenceMetricScale compact key={metric.leftLabel} metric={metric} />
        ))}
      </div>
    </article>
  );
}
