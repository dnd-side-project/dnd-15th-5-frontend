import ReportPreferenceCard from '@/features/report/components/monthly-report/report-preference-card/ReportPreferenceCard';
import type { ReportPreferenceCardMetric } from '@/features/report/components/monthly-report/report-preference-card/ReportPreferenceCard';
import ReportPreferenceShareCard from '@/features/report/components/monthly-report/report-preference-card/ReportPreferenceShareCard';
import { useReportPreferenceCarousel } from '@/features/report/hooks/useReportPreferenceCarousel';
import type { ReportPreferenceCardVariant } from '@/features/report/types';
import { ReportCardFlipIcon, ShareIcon } from '@/shared/assets/icons';
import { cn } from '@/shared/lib/cn';

import type { Ref } from 'react';

import './reportPreferenceSection.css';

type ReportPreferenceSectionProps = {
  cards: readonly ReportPreferenceCarouselCard[];
  captureRef: Ref<HTMLDivElement>;
  isFlipped: boolean;
  onCardSelect: (index: number) => void;
  onFlip: () => void;
  onShare: () => void;
  selectedCardIndex: number;
};

type ReportPreferenceCarouselCard = {
  description: string;
  id: string;
  metrics: readonly ReportPreferenceCardMetric[];
  tags: readonly string[];
  title: string;
  variant: ReportPreferenceCardVariant;
};

export default function ReportPreferenceSection({
  cards,
  captureRef,
  isFlipped,
  onCardSelect,
  onFlip,
  onShare,
  selectedCardIndex,
}: ReportPreferenceSectionProps) {
  const selectedCard = cards[selectedCardIndex] ?? cards[0];
  const {
    carouselRef,
    handleCarouselClickCapture,
    handleCarouselKeyDown,
    handleCarouselPointerCancel,
    handleCarouselPointerDown,
    handleCarouselPointerMove,
    handleCarouselPointerUp,
  } = useReportPreferenceCarousel({
    cardCount: cards.length,
    onCardSelect,
    selectedCardIndex,
  });

  if (!selectedCard) return null;

  return (
    <section className="report-preference-section mt-4.5 flex flex-col items-center">
      <div
        aria-label="월별 소비 성향 카드"
        className="report-preference-carousel scrollbar-hidden"
        onClickCapture={handleCarouselClickCapture}
        onKeyDown={handleCarouselKeyDown}
        onPointerCancel={handleCarouselPointerCancel}
        onPointerDown={handleCarouselPointerDown}
        onPointerMove={handleCarouselPointerMove}
        onPointerUp={handleCarouselPointerUp}
        ref={carouselRef}
        role="region"
      >
        {cards.map((card, index) => {
          const isSelected = index === selectedCardIndex;

          return (
            <div
              aria-current={isSelected ? 'true' : undefined}
              aria-hidden={!isSelected}
              className={cn(
                'report-preference-carousel-card',
                isSelected
                  ? 'report-preference-carousel-card--current'
                  : index < selectedCardIndex
                    ? 'report-preference-carousel-card--left'
                    : 'report-preference-carousel-card--right'
              )}
              key={card.id}
            >
              <ReportPreferenceCard
                description={card.description}
                isFlipped={isSelected && isFlipped}
                metrics={card.metrics}
                onFlip={isSelected ? onFlip : undefined}
                tags={card.tags}
                title={card.title}
                variant={card.variant}
              />
            </div>
          );
        })}
      </div>
      {/* INFO: PNG 변환을 위해 저장용 카드를 display: none 없이 화면 밖에 렌더링한다. */}
      <div aria-hidden className="pointer-events-none fixed top-0 left-[-9999px]">
        <div ref={captureRef}>
          <ReportPreferenceShareCard
            metrics={selectedCard.metrics}
            tags={selectedCard.tags}
            title={selectedCard.title}
            variant={selectedCard.variant}
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
          <ReportCardFlipIcon aria-hidden className="h-3.25 w-3" />
        </button>
      </div>
    </section>
  );
}
