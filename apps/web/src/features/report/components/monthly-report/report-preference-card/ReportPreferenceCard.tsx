import {
  ReportCardCharacterImage,
  ReportCardTextureImage,
} from '@/shared/assets/images/preference-card';

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
};

/** 사용자의 월간 소비 성향을 앞·뒷면으로 보여주는 취향 카드입니다. */
export default function ReportPreferenceCard({
  description,
  isFlipped = false,
  metrics = [],
  tags,
  title,
}: ReportPreferenceCardProps) {
  if (isFlipped) {
    return (
      <article className="h-93.75 w-69 rounded-15 bg-report-preference-card-back p-3.5 shadow-report-preference-card">
        <div className="flex h-full flex-col items-center rounded-16 border border-neutral-900 bg-neutral-00 px-4 py-5">
          <h1 className="text-center text-heading-03-bold text-neutral-700">✦ {title} ✦</h1>
          {description && (
            <p className="mt-3 text-center text-body-02-medium leading-[1.5] whitespace-pre-line text-neutral-600">
              {description}
            </p>
          )}
          <div className="mt-7.5 flex w-full flex-col gap-1.5">
            {metrics.map((metric) => (
              <div key={metric.leftLabel}>
                <div className="flex justify-between text-label-01-medium text-neutral-500">
                  <span>{metric.leftLabel}</span>
                  <span>{metric.rightLabel}</span>
                </div>
                <div className="relative mt-1.25 h-1.5 rounded-full bg-primary-300">
                  <span
                    className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-primary-500 bg-neutral-00"
                    style={{ left: `${metric.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="relative h-93.75 w-69 overflow-hidden rounded-15 bg-report-preference-card-front shadow-report-preference-card">
      <img
        alt=""
        aria-hidden
        className="absolute inset-0 size-full object-cover opacity-30 mix-blend-overlay"
        src={ReportCardTextureImage}
      />
      <div className="absolute top-11.25 flex w-full items-center justify-center gap-2.75 text-primary-50">
        <span aria-hidden className="text-xl">
          ✦
        </span>
        <h1 className="text-center text-heading-01-bold">{title}</h1>
        <span aria-hidden className="text-xl">
          ✦
        </span>
      </div>
      <div className="absolute top-23.25 left-1/2 h-46 w-35.25 -translate-x-1/2 rounded-full bg-primary-500" />
      <img
        alt="왕관과 망토를 두른 캐릭터"
        className="absolute top-18 left-1/2 h-57.5 w-53.75 -translate-x-1/2 object-contain"
        src={ReportCardCharacterImage}
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
    </article>
  );
}
