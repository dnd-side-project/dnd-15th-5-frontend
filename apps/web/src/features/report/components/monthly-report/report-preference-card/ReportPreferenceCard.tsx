import type { ReportPreferenceCardVariant } from '@/features/report/types';
import { ReportCardTextureImage } from '@/shared/assets/images/preference-card';
import { cn } from '@/shared/lib/cn';

import { REPORT_PREFERENCE_CARD_VARIANTS } from './reportPreferenceCardVariants';
import ReportPreferenceMetricScale from './ReportPreferenceMetricScale';
import './reportPreferenceCard.css';

import type { ReportPreferenceCardMetric } from './ReportPreferenceMetricScale';
import type { KeyboardEvent } from 'react';

export type { ReportPreferenceCardMetric } from './ReportPreferenceMetricScale';

type ReportPreferenceCardProps = {
  description?: string;
  isFlipped?: boolean;
  metrics?: readonly ReportPreferenceCardMetric[];
  onFlip?: () => void;
  tags: readonly string[];
  title: string;
  variant: ReportPreferenceCardVariant;
};

/** 사용자의 월간 소비 성향을 종류별 앞·뒷면 한 세트로 보여주는 취향 카드입니다. */
export default function ReportPreferenceCard({
  description,
  isFlipped = false,
  metrics = [],
  onFlip,
  tags,
  title,
  variant,
}: ReportPreferenceCardProps) {
  const variantConfig = REPORT_PREFERENCE_CARD_VARIANTS[variant];

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!onFlip || (event.key !== 'Enter' && event.key !== ' ')) return;

    event.preventDefault();
    onFlip();
  };

  return (
    <article
      className={cn(
        'report-preference-card relative h-93.75 w-69',
        onFlip &&
          'cursor-pointer rounded-15 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:outline-none'
      )}
      aria-label={onFlip ? `취향 카드 ${isFlipped ? '앞면' : '뒷면'} 보기` : undefined}
      data-flipped={isFlipped}
      onClick={onFlip}
      onKeyDown={handleKeyDown}
      role={onFlip ? 'button' : undefined}
      tabIndex={onFlip ? 0 : undefined}
    >
      <div className="report-preference-card-inner relative size-full">
        <div
          aria-hidden={isFlipped}
          className={cn(
            'report-preference-card-face absolute inset-0 overflow-hidden rounded-15 shadow-report-preference-card',
            variantConfig.frontClassName
          )}
        >
          <img
            alt=""
            aria-hidden
            draggable={false}
            className={cn(
              'pointer-events-none absolute inset-0 size-full object-cover mix-blend-overlay select-none',
              variantConfig.textureClassName
            )}
            src={ReportCardTextureImage}
          />
          <div
            aria-hidden
            className={cn(
              'absolute top-23.25 left-17 h-46 w-35.25 rounded-full',
              variantConfig.spotClassName
            )}
          />
          <div
            className={cn(
              'absolute top-11.25 flex w-full items-center justify-center gap-2.75',
              variantConfig.titleClassName
            )}
          >
            <span aria-hidden className="text-xl">
              ✦
            </span>
            <h1 className="text-center font-waguri text-card-title">{title}</h1>
            <span aria-hidden className="text-xl">
              ✦
            </span>
          </div>
          <img
            alt={variantConfig.characterAlt}
            className={cn(
              'pointer-events-none absolute object-contain select-none',
              variantConfig.characterClassName
            )}
            draggable={false}
            src={variantConfig.characterImage}
          />
          <div className="absolute right-0 bottom-4.5 left-0 flex justify-center gap-1.5">
            {tags.map((tag) => (
              <span
                className="rounded-full bg-neutral-00/90 px-3 py-1.75 text-label-01-semibold text-neutral-700"
                key={tag}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div
          aria-hidden={!isFlipped}
          className={cn(
            'report-preference-card-face report-preference-card-face--back absolute inset-0 rounded-15 shadow-report-preference-card',
            variantConfig.backClassName
          )}
        >
          <div className="absolute inset-x-3.5 top-4 h-85.75 rounded-16 border border-neutral-900 bg-neutral-00 px-3.75 pt-5.25">
            <h1 className="text-center font-waguri text-card-back-title text-neutral-700">
              <span aria-hidden>✦ </span>
              {title}
              <span aria-hidden> ✦</span>
            </h1>
            {description && (
              <p className="mt-3 text-center text-body-medium-card break-keep text-neutral-600">
                {description}
              </p>
            )}
            <div className="absolute top-38.75 right-3.75 left-3.75 flex flex-col gap-1.5">
              {metrics.map((metric) => (
                <ReportPreferenceMetricScale key={metric.leftLabel} metric={metric} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
