import ReportPreferenceCard from '@/features/report/components/monthly-report/report-preference-card/ReportPreferenceCard';
import ReportPreferenceCardFront from '@/features/report/components/monthly-report/report-preference-card/ReportPreferenceCardFront';
import ReportPreferenceSharedCard from '@/features/report/components/monthly-report/report-preference-card/ReportPreferenceSharedCard';
import { useReportPreferenceCarousel } from '@/features/report/hooks/useReportPreferenceCarousel';
import type { MonthlyReportPreferenceCard } from '@/features/report/types';
import { ReportCardFlipIcon, ShareIcon } from '@/shared/assets/icons';
import { cn } from '@/shared/lib/cn';

import MonthlyReportUnavailableCard from './MonthlyReportUnavailableCard';

import type { Ref } from 'react';

import './reportPreferenceSection.css';

type ReportPreferenceSectionProps = {
  cards: readonly MonthlyReportPreferenceCard[];
  captureRef: Ref<HTMLDivElement>;
  isFlipped: boolean;
  onCardSelect: (index: number) => void;
  onCardTransitionChange: (isTransitioning: boolean) => void;
  onFlip: () => void;
  onShare: () => void;
  onViewCurrentReport: () => void;
  selectedCardIndex: number;
  thumbnailCaptureRef: Ref<HTMLDivElement>;
};

/** 소비 취향 카드를 탐색하고 뒤집거나 공유할 수 있는 영역입니다. */
export default function ReportPreferenceSection({
  cards,
  captureRef,
  isFlipped,
  onCardSelect,
  onCardTransitionChange,
  onFlip,
  onShare,
  onViewCurrentReport,
  selectedCardIndex,
  thumbnailCaptureRef,
}: ReportPreferenceSectionProps) {
  const selectedCard = cards[selectedCardIndex] ?? cards[0];
  const {
    carouselRef,
    carouselStyle,
    handleCarouselClickCapture,
    handleCarouselKeyDown,
    handleCarouselLostPointerCapture,
    handleCarouselPointerCancel,
    handleCarouselPointerDown,
    handleCarouselPointerMove,
    handleCarouselPointerUp,
    handleCarouselTransitionEnd,
  } = useReportPreferenceCarousel({
    cardIds: cards.map((card) => card.id),
    onCardSelect,
    onTransitionChange: onCardTransitionChange,
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
        onLostPointerCapture={handleCarouselLostPointerCapture}
        onPointerCancel={handleCarouselPointerCancel}
        onPointerDown={handleCarouselPointerDown}
        onPointerMove={handleCarouselPointerMove}
        onPointerUp={handleCarouselPointerUp}
        onTransitionEnd={handleCarouselTransitionEnd}
        ref={carouselRef}
        role="region"
        style={carouselStyle}
        tabIndex={0}
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
              {card.isUnavailable ? (
                <MonthlyReportUnavailableCard
                  isActionAvailable={isSelected}
                  onViewCurrentReport={onViewCurrentReport}
                  selectedMonth={card.month}
                />
              ) : (
                <ReportPreferenceCard
                  description={card.description}
                  isFlipped={isSelected && isFlipped}
                  metrics={card.metrics}
                  onFlip={isSelected ? onFlip : undefined}
                  tags={card.tags}
                  title={card.title}
                  variant={card.variant}
                />
              )}
            </div>
          );
        })}
      </div>
      {!selectedCard.isUnavailable && (
        <>
          {/* INFO: PNG 변환을 위해 공유용 카드를 display: none 없이 화면 밖에 렌더링한다. */}
          <div aria-hidden className="pointer-events-none fixed top-0 left-[-9999px]">
            <div ref={captureRef}>
              <ReportPreferenceSharedCard
                description={selectedCard.description}
                hasShadow={false}
                metrics={selectedCard.metrics}
                tags={selectedCard.tags}
                title={selectedCard.title}
                variant={selectedCard.variant}
              />
            </div>
            <div ref={thumbnailCaptureRef}>
              <ReportPreferenceCardFront
                isStandalone
                tags={selectedCard.tags}
                title={selectedCard.title}
                variant={selectedCard.variant}
              />
            </div>
          </div>
        </>
      )}
      <div className="mt-6.25 flex items-center gap-3.75">
        <button
          className="flex h-9.25 items-center gap-2 rounded-full bg-neutral-200 px-5 text-body-02-medium text-neutral-700 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400"
          disabled={selectedCard.isUnavailable}
          onClick={onShare}
          type="button"
        >
          <ShareIcon aria-hidden className="size-4" />
          취향 카드 공유하기
        </button>
        <button
          aria-label="취향 카드 뒤집기"
          className="flex size-10 items-center justify-center rounded-full bg-neutral-200 text-lg text-neutral-600 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400 disabled:[&_path]:fill-neutral-200 disabled:[&_path]:stroke-neutral-400"
          disabled={selectedCard.isUnavailable}
          onClick={onFlip}
          type="button"
        >
          <ReportCardFlipIcon aria-hidden className="h-3.25 w-3" />
        </button>
      </div>
      {selectedCard.isUnavailable && (
        <p className="mt-30 text-center text-title-02-semibold text-neutral-400">
          해당 월에 생성된 리포트가 없어요
        </p>
      )}
    </section>
  );
}
