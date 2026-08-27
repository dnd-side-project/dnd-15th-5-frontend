import type { ReportPreferenceCardVariant, ReportPreferenceMetric } from '@/features/report/types';
import { ReportCardTextureImage } from '@/shared/assets/images/preference-card';
import { cn } from '@/shared/lib/cn';

import { REPORT_PREFERENCE_CARD_VARIANTS } from './reportPreferenceCardVariants';
import ReportPreferenceMetricScale from './ReportPreferenceMetricScale';

export type ReportPreferenceSharedCardProps = {
  description: string;
  hasShadow?: boolean;
  metrics: readonly ReportPreferenceMetric[];
  tags: readonly string[];
  title: string;
  variant: ReportPreferenceCardVariant;
};

/** 공유 페이지와 이미지 저장에서 함께 사용하는 설명 포함 소비 성향 카드입니다. */
export default function ReportPreferenceSharedCard({
  description,
  hasShadow = true,
  metrics,
  tags,
  title,
  variant,
}: ReportPreferenceSharedCardProps) {
  const variantConfig = REPORT_PREFERENCE_CARD_VARIANTS[variant];
  const titleClassName =
    variant === 'night-watch' || variant === 'local-regular'
      ? 'text-neutral-00'
      : 'text-neutral-700';
  const descriptionClassName =
    variant === 'night-watch' || variant === 'local-regular'
      ? 'text-neutral-00'
      : 'text-neutral-600';

  return (
    <article
      aria-label={`${title} 공유 카드`}
      className={cn(
        'relative w-61 overflow-hidden rounded-15',
        hasShadow && 'shadow-report-preference-share-card',
        variantConfig.frontClassName
      )}
    >
      <img
        alt=""
        aria-hidden
        className={cn(
          'absolute inset-x-0 top-0 h-100 w-full object-cover mix-blend-overlay',
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
          titleClassName
        )}
      >
        <span aria-hidden className="text-base">
          ✦
        </span>
        <h2 className="text-center font-waguri text-card-title-03-regular">{title}</h2>
        <span aria-hidden className="text-base">
          ✦
        </span>
      </div>
      <img
        alt={variantConfig.characterAlt}
        className={cn('absolute object-contain', variantConfig.saveCharacterClassName)}
        src={variantConfig.characterImage}
      />

      <div className="pt-69">
        <div className="flex justify-center gap-1.25">
          {tags.map((tag) => (
            <span
              className="rounded-full bg-neutral-00/90 px-2.75 py-1.5 text-label-01-semibold text-neutral-700"
              key={tag}
            >
              {tag}
            </span>
          ))}
        </div>
        <p
          className={cn(
            'mx-4.5 mt-3.5 text-center text-caption-02-medium break-keep',
            descriptionClassName
          )}
        >
          {description}
        </p>
        <div className="relative mt-3.5 h-49.5 rounded-15 bg-neutral-00">
          <div className="absolute top-5.25 left-6.5 flex w-48.25 flex-col gap-1.25">
            {metrics.map((metric) => (
              <ReportPreferenceMetricScale compact key={metric.leftLabel} metric={metric} />
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
