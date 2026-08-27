import type { ReportPreferenceCardVariant } from '@/features/report/types';
import { ReportCardTextureImage } from '@/shared/assets/images/preference-card';
import { cn } from '@/shared/lib/cn';

import { REPORT_PREFERENCE_CARD_VARIANTS } from './reportPreferenceCardVariants';

type ReportPreferenceCardFrontProps = {
  isHidden?: boolean;
  isStandalone?: boolean;
  tags: readonly string[];
  title: string;
  variant: ReportPreferenceCardVariant;
};

/** 캐릭터와 태그가 있는 취향 카드 앞면을 표시합니다. */
export default function ReportPreferenceCardFront({
  isHidden,
  isStandalone = false,
  tags,
  title,
  variant,
}: ReportPreferenceCardFrontProps) {
  const variantConfig = REPORT_PREFERENCE_CARD_VARIANTS[variant];

  return (
    <div
      aria-hidden={isHidden}
      data-report-preference-card-front
      className={cn(
        'overflow-hidden rounded-15 shadow-report-preference-card',
        isStandalone ? 'relative h-93.75 w-69' : 'report-preference-card-face absolute inset-0',
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
        <h1 className="text-center font-waguri text-card-title-01-regular">{title}</h1>
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
  );
}
