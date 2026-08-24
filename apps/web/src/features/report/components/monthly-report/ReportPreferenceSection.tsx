import ReportPreferenceCard from '@/features/report/components/monthly-report/report-preference-card/ReportPreferenceCard';
import type { ReportPreferenceCardMetric } from '@/features/report/components/monthly-report/report-preference-card/ReportPreferenceCard';
import ReportPreferenceShareCard from '@/features/report/components/monthly-report/report-preference-card/ReportPreferenceShareCard';
import type { ReportPreferenceCardVariant } from '@/features/report/types';
import { ReportCardFlipIcon, ShareIcon } from '@/shared/assets/icons';

import type { Ref } from 'react';

type ReportPreferenceSectionProps = {
  captureRef: Ref<HTMLDivElement>;
  description: string;
  isFlipped: boolean;
  metrics: readonly ReportPreferenceCardMetric[];
  onFlip: () => void;
  onShare: () => void;
  tags: readonly string[];
  title: string;
  variant: ReportPreferenceCardVariant;
};

export default function ReportPreferenceSection({
  captureRef,
  description,
  isFlipped,
  metrics,
  onFlip,
  onShare,
  tags,
  title,
  variant,
}: ReportPreferenceSectionProps) {
  return (
    <section className="mt-4.5 flex flex-col items-center">
      <div>
        <ReportPreferenceCard
          description={description}
          isFlipped={isFlipped}
          metrics={metrics}
          tags={tags}
          title={title}
          variant={variant}
        />
      </div>
      {/* INFO: PNG 변환을 위해 저장용 카드를 display: none 없이 화면 밖에 렌더링한다. */}
      <div aria-hidden className="pointer-events-none fixed top-0 left-[-9999px]">
        <div ref={captureRef}>
          <ReportPreferenceShareCard
            description={description}
            metrics={metrics}
            tags={tags}
            title={title}
            variant={variant}
          />
        </div>
      </div>
      <div className="mt-6.25 flex items-center gap-3.75">
        <button
          className="flex h-9.25 items-center gap-2 rounded-full bg-neutral-200 px-5 text-body-02-medium text-neutral-700"
          onClick={onShare}
          type="button"
        >
          <ShareIcon aria-hidden className="size-4" />
          취향 카드 공유하기
        </button>
        <button
          aria-label="취향 카드 뒤집기"
          className="flex size-10 items-center justify-center rounded-full bg-neutral-200 text-lg text-neutral-600"
          onClick={onFlip}
          type="button"
        >
          <ReportCardFlipIcon aria-hidden className="h-[13px] w-[12.34px]" />
        </button>
      </div>
    </section>
  );
}
