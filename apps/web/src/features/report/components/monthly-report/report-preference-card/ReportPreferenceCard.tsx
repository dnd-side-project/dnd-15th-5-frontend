import type { ReportPreferenceCardVariant } from '@/features/report/types';
import {
  ReportCardAlleyExplorerImage,
  ReportCardFoodNomadImage,
  ReportCardLocalRegularImage,
  ReportCardNightWatchImage,
  ReportCardTextureImage,
} from '@/shared/assets/images/preference-card';
import { cn } from '@/shared/lib/cn';

export type ReportPreferenceCardMetric = {
  leftLabel: string;
  rightLabel: string;
  value: number;
};

type ReportPreferenceCardProps = {
  description?: string;
  isFlipped?: boolean;
  metrics?: readonly ReportPreferenceCardMetric[];
  tags: readonly string[];
  title: string;
  variant: ReportPreferenceCardVariant;
};

type ReportPreferenceCardVariantConfig = {
  backClassName: string;
  characterAlt: string;
  characterClassName: string;
  characterImage: string;
  frontClassName: string;
  spotClassName: string;
  textureClassName: string;
  titleClassName: string;
};

const REPORT_PREFERENCE_CARD_VARIANTS: Record<
  ReportPreferenceCardVariant,
  ReportPreferenceCardVariantConfig
> = {
  'night-watch': {
    backClassName: 'bg-report-card-night-back',
    characterAlt: '손으로 브이 표시를 하는 방패 캐릭터',
    characterClassName: 'top-[97px] left-[47.5px] h-[194px] w-[181px]',
    characterImage: ReportCardNightWatchImage,
    frontClassName: 'bg-report-card-night-front',
    spotClassName: 'bg-report-card-night-spot',
    textureClassName: 'opacity-40',
    titleClassName: 'text-neutral-00',
  },
  'food-nomad': {
    backClassName: 'bg-report-card-nomad-back',
    characterAlt: '소시지를 맛보는 요리사 캐릭터',
    characterClassName: 'top-[65px] left-[52px] h-[254px] w-[169px]',
    characterImage: ReportCardFoodNomadImage,
    frontClassName: 'bg-report-card-nomad-front',
    spotClassName: 'bg-report-card-nomad-spot',
    textureClassName: 'opacity-40',
    titleClassName: 'text-neutral-700',
  },
  'local-regular': {
    backClassName: 'bg-report-card-regular-back',
    characterAlt: '왕관과 망토를 두르고 왕좌에 앉은 캐릭터',
    characterClassName: 'top-[72px] left-[30.5px] h-[230px] w-[215px]',
    characterImage: ReportCardLocalRegularImage,
    frontClassName: 'bg-report-card-regular-front',
    spotClassName: 'bg-report-card-regular-spot',
    textureClassName: 'opacity-30',
    titleClassName: 'text-primary-50',
  },
  'alley-explorer': {
    backClassName: 'bg-report-card-explorer-back',
    characterAlt: '망원경으로 골목을 살펴보는 탐험가 캐릭터',
    characterClassName: 'top-[85px] left-[55px] h-[223px] w-[188px]',
    characterImage: ReportCardAlleyExplorerImage,
    frontClassName: 'bg-report-card-explorer-front',
    spotClassName: 'bg-report-card-explorer-spot',
    textureClassName: 'opacity-55',
    titleClassName: 'text-neutral-700',
  },
};

function PreferenceMetricScale({ metric }: { metric: ReportPreferenceCardMetric }) {
  const markerPosition = Math.min(Math.max(metric.value, 0), 100);

  return (
    <div className="flex h-9.75 flex-col gap-0.5">
      <div className="flex justify-between text-label-01-medium text-neutral-500">
        <span>{metric.leftLabel}</span>
        <span>{metric.rightLabel}</span>
      </div>
      <div className="relative mt-1.25 h-1.5 rounded-full bg-primary-300">
        <span
          aria-hidden
          className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-primary-500 bg-neutral-00"
          style={{ left: `${markerPosition}%` }}
        />
      </div>
    </div>
  );
}

/** 사용자의 월간 소비 성향을 종류별 앞·뒷면 한 세트로 보여주는 취향 카드입니다. */
export default function ReportPreferenceCard({
  description,
  isFlipped = false,
  metrics = [],
  tags,
  title,
  variant,
}: ReportPreferenceCardProps) {
  const variantConfig = REPORT_PREFERENCE_CARD_VARIANTS[variant];

  if (isFlipped) {
    return (
      <article
        className={cn(
          'relative h-93.75 w-69 rounded-15 shadow-report-preference-card',
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
          <div className="absolute top-[155px] right-3.75 left-3.75 flex flex-col gap-1.5">
            {metrics.map((metric) => (
              <PreferenceMetricScale key={metric.leftLabel} metric={metric} />
            ))}
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      className={cn(
        'relative h-93.75 w-69 overflow-hidden rounded-15 shadow-report-preference-card',
        variantConfig.frontClassName
      )}
    >
      <img
        alt=""
        aria-hidden
        className={cn(
          'absolute inset-0 size-full object-cover mix-blend-overlay',
          variantConfig.textureClassName
        )}
        src={ReportCardTextureImage}
      />
      <div
        aria-hidden
        className={cn(
          'absolute top-23.25 left-[67.5px] h-46 w-35.25 rounded-full',
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
        className={cn('absolute object-contain', variantConfig.characterClassName)}
        src={variantConfig.characterImage}
      />
      <div className="absolute right-0 bottom-[18px] left-0 flex justify-center gap-1.5">
        {tags.map((tag) => (
          <span
            className="rounded-full bg-neutral-00/90 px-3 py-1.75 text-label-01-semibold text-neutral-700"
            key={tag}
          >
            {tag}
          </span>
        ))}
      </div>
    </article>
  );
}
