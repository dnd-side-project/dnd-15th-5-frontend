import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { A11y } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import ReportPreferenceCard from '@/features/report/components/monthly-report/report-preference-card/ReportPreferenceCard';
import ReportPreferenceCardFront from '@/features/report/components/monthly-report/report-preference-card/ReportPreferenceCardFront';
import ReportPreferenceShareScreen from '@/features/report/components/monthly-report/report-preference-card/ReportPreferenceShareScreen';
import {
  REPORT_KAKAO_THUMBNAIL_SIZE,
  REPORT_PHOTO_CAPTURE_SIZE,
} from '@/features/report/constants';
import type { MonthlyReportPreferenceCard } from '@/features/report/types';
import { ReportCardFlipIcon, ShareIcon } from '@/shared/assets/icons';
import { usePrefersReducedMotion } from '@/shared/hooks/usePrefersReducedMotion';

import MonthlyReportUnavailableCard from './MonthlyReportUnavailableCard';

import type { KeyboardEvent, Ref } from 'react';
import type { Swiper as SwiperInstance } from 'swiper';

import 'swiper/css';

import './reportPreferenceSection.css';

const CARD_TRANSITION_DURATION = 640;
const CARD_WIDTH = 276;
const MIN_CARD_SIDE_GAP = 20;
const CARD_VIEWPORT_INSET = 23;

type ReportPreferenceSectionProps = {
  cards: readonly MonthlyReportPreferenceCard[];
  captureRef: Ref<HTMLDivElement>;
  isCurrentReportActionVisible: boolean;
  isFlipped: boolean;
  nickname: string;
  navigationRef?: Ref<ReportPreferenceSectionNavigation>;
  onCardPreview?: (index: number) => void;
  onCardSelect: (index: number) => void;
  onCardTransitionChange: (isTransitioning: boolean) => void;
  onFlip: () => void;
  onShare: () => void;
  onViewCurrentReport: () => void;
  selectedCardIndex: number;
  thumbnailCaptureRef: Ref<HTMLDivElement>;
};

export type ReportPreferenceSectionNavigation = {
  showNewerMonth: () => boolean;
  showOlderMonth: () => boolean;
};

/** 소비 취향 카드를 탐색하고 뒤집거나 공유할 수 있는 영역입니다. */
export default function ReportPreferenceSection({
  cards,
  captureRef,
  isCurrentReportActionVisible,
  isFlipped,
  nickname,
  navigationRef,
  onCardPreview,
  onCardSelect,
  onCardTransitionChange,
  onFlip,
  onShare,
  onViewCurrentReport,
  selectedCardIndex,
  thumbnailCaptureRef,
}: ReportPreferenceSectionProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const selectedCard = cards[selectedCardIndex] ?? cards[0];
  const carouselRef = useRef<HTMLDivElement>(null);
  const pendingCardIndexRef = useRef<number | null>(null);
  const swiperRef = useRef<SwiperInstance | null>(null);
  const [cardSideGap, setCardSideGap] = useState(MIN_CARD_SIDE_GAP);
  const cardIdSignature = cards.map((card) => card.id).join('|');

  const handleSwiper = useCallback(
    (swiper: SwiperInstance) => {
      swiperRef.current = swiper;

      if (swiper.activeIndex !== selectedCardIndex) {
        swiper.slideTo(selectedCardIndex, 0, false);
      }
    },
    [selectedCardIndex]
  );

  const handleSlideChange = useCallback(
    (swiper: SwiperInstance) => {
      pendingCardIndexRef.current = swiper.activeIndex;
      onCardPreview?.(swiper.activeIndex);
    },
    [onCardPreview]
  );

  const handleSlideChangeTransitionStart = (swiper: SwiperInstance) => {
    swiper.el.dataset.settling = 'true';
    swiper.el.dataset.settlingDirection =
      swiper.activeIndex > swiper.previousIndex ? 'from-right' : 'from-left';
    onCardTransitionChange(true);
  };

  const handleSlideChangeTransitionEnd = (swiper: SwiperInstance) => {
    delete swiper.el.dataset.settling;
    delete swiper.el.dataset.settlingDirection;

    const pendingCardIndex = pendingCardIndexRef.current;
    pendingCardIndexRef.current = null;

    if (pendingCardIndex !== null && pendingCardIndex !== selectedCardIndex) {
      onCardSelect(pendingCardIndex);
    }

    onCardTransitionChange(false);
  };

  const handleSliderFirstMove = (swiper: SwiperInstance) => {
    swiper.el.dataset.dragging = 'true';
  };

  const handleTouchEnd = (swiper: SwiperInstance) => {
    delete swiper.el.dataset.dragging;
  };

  const handleCarouselKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;

    event.preventDefault();

    if (event.key === 'ArrowLeft') {
      swiperRef.current?.slidePrev();
      return;
    }

    swiperRef.current?.slideNext();
  };

  useEffect(() => {
    const swiper = swiperRef.current;
    if (!swiper || swiper.destroyed) return;

    swiper.update();

    if (swiper.activeIndex !== selectedCardIndex) {
      swiper.slideTo(selectedCardIndex);
    }
  }, [cardIdSignature, selectedCardIndex]);

  useLayoutEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const updateCardSideGap = () => {
      const nextCardSideGap = Math.max(
        MIN_CARD_SIDE_GAP,
        carousel.clientWidth / 2 - CARD_WIDTH / 2 - CARD_VIEWPORT_INSET
      );

      setCardSideGap(nextCardSideGap);
    };

    updateCardSideGap();

    if (typeof ResizeObserver === 'undefined') return;

    const resizeObserver = new ResizeObserver(updateCardSideGap);
    resizeObserver.observe(carousel);

    return () => resizeObserver.disconnect();
  }, []);

  useImperativeHandle(
    navigationRef,
    () => ({
      showNewerMonth: () => {
        const swiper = swiperRef.current;
        if (!swiper || swiper.destroyed || swiper.isEnd) return false;

        swiper.slideNext();
        return true;
      },
      showOlderMonth: () => {
        const swiper = swiperRef.current;
        if (!swiper || swiper.destroyed || swiper.isBeginning) return false;

        swiper.slidePrev();
        return true;
      },
    }),
    []
  );

  if (!selectedCard) return null;

  return (
    <section className="report-preference-section mt-4.5 flex flex-col items-center">
      <div
        aria-label="월별 소비 성향 카드"
        className="report-preference-carousel"
        onKeyDown={handleCarouselKeyDown}
        ref={carouselRef}
        role="region"
        tabIndex={0}
      >
        <Swiper
          a11y={{
            containerMessage: '월별 소비 성향 카드',
          }}
          centeredSlides
          className="report-preference-swiper"
          grabCursor
          initialSlide={selectedCardIndex}
          key={cardIdSignature}
          longSwipesRatio={0}
          modules={[A11y]}
          noSwiping={false}
          onSlideChange={handleSlideChange}
          onSlideChangeTransitionEnd={handleSlideChangeTransitionEnd}
          onSlideChangeTransitionStart={handleSlideChangeTransitionStart}
          onSliderFirstMove={handleSliderFirstMove}
          onSwiper={handleSwiper}
          onTouchEnd={handleTouchEnd}
          preventInteractionOnTransition
          slidesPerView="auto"
          spaceBetween={cardSideGap}
          speed={prefersReducedMotion ? 0 : CARD_TRANSITION_DURATION}
          touchEventsTarget="container"
          threshold={10}
        >
          {cards.map((card, index) => {
            const isSelected = index === selectedCardIndex;

            return (
              <SwiperSlide
                aria-current={isSelected ? 'true' : undefined}
                aria-hidden={!isSelected}
                className="report-preference-slide"
                key={card.id}
              >
                {card.isUnavailable ? (
                  <MonthlyReportUnavailableCard
                    isActionAvailable={isSelected}
                    isActionVisible={isCurrentReportActionVisible}
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
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
      {/* INFO: PNG 변환을 위해 공유용 카드를 display: none 없이 화면 밖에 렌더링한다. */}
      {!selectedCard.isUnavailable && (
        <div aria-hidden className="pointer-events-none fixed top-0 left-[-9999px]">
          <div ref={captureRef} style={REPORT_PHOTO_CAPTURE_SIZE}>
            <ReportPreferenceShareScreen
              description={selectedCard.description}
              isPhotoCapture
              metrics={selectedCard.metrics}
              nickname={nickname}
              tags={selectedCard.tags}
              title={selectedCard.title}
              variant={selectedCard.variant}
            />
          </div>
          <div
            className="overflow-hidden rounded-15"
            ref={thumbnailCaptureRef}
            style={REPORT_KAKAO_THUMBNAIL_SIZE}
          >
            <ReportPreferenceCardFront
              isStandalone
              tags={selectedCard.tags}
              title={selectedCard.title}
              variant={selectedCard.variant}
            />
          </div>
        </div>
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
