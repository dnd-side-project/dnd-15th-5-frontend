import { act, fireEvent, render, screen } from '@testing-library/react';

import { useReportPreferenceCarousel } from './useReportPreferenceCarousel';

type CarouselHarnessProps = {
  cardCount?: number;
  onCardClick: () => void;
  onCardSelect: (index: number) => void;
  selectedCardIndex?: number;
};

function CarouselHarness({
  cardCount = 2,
  onCardClick,
  onCardSelect,
  selectedCardIndex = 0,
}: CarouselHarnessProps) {
  const {
    carouselRef,
    handleCarouselClickCapture,
    handleCarouselPointerCancel,
    handleCarouselPointerDown,
    handleCarouselPointerMove,
    handleCarouselPointerUp,
  } = useReportPreferenceCarousel({
    cardIds: Array.from({ length: cardCount }, (_, index) => String(index)),
    onCardSelect,
    selectedCardIndex,
  });

  return (
    <div
      onClickCapture={handleCarouselClickCapture}
      onPointerCancel={handleCarouselPointerCancel}
      onPointerDown={handleCarouselPointerDown}
      onPointerMove={handleCarouselPointerMove}
      onPointerUp={handleCarouselPointerUp}
      ref={carouselRef}
    >
      <button onClick={onCardClick} type="button">
        취향 카드
      </button>
      {Array.from({ length: cardCount - 1 }, (_, index) => (
        <div data-testid={`extra-card-slot-${index}`} key={index}>
          <div>추가 카드</div>
        </div>
      ))}
    </div>
  );
}

function CarouselSettleHarness({ onCardSelect }: Pick<CarouselHarnessProps, 'onCardSelect'>) {
  const {
    carouselRef,
    handleCarouselPointerDown,
    handleCarouselPointerMove,
    handleCarouselPointerUp,
  } = useReportPreferenceCarousel({
    cardIds: ['0', '1'],
    onCardSelect,
    selectedCardIndex: 0,
  });

  return (
    <div
      data-testid="settle-carousel"
      onPointerDown={handleCarouselPointerDown}
      onPointerMove={handleCarouselPointerMove}
      onPointerUp={handleCarouselPointerUp}
      ref={carouselRef}
    >
      <div data-testid="card-slot-0">
        <div>첫 번째 카드</div>
      </div>
      <div data-testid="card-slot-1">
        <div>두 번째 카드</div>
      </div>
    </div>
  );
}

function CarouselIdentityHarness({
  cardIds,
  selectedCardIndex,
}: {
  cardIds: readonly string[];
  selectedCardIndex: number;
}) {
  const { carouselRef } = useReportPreferenceCarousel({
    cardIds,
    onCardSelect: jest.fn(),
    selectedCardIndex,
  });

  return (
    <div ref={carouselRef}>
      {cardIds.map((cardId) => (
        <div data-testid={`identity-card-${cardId}`} key={cardId}>
          <div>{cardId}</div>
        </div>
      ))}
    </div>
  );
}

const setPointerCaptureMethods = (carousel: HTMLElement) => {
  let hasPointerCapture = false;
  const setPointerCapture = jest.fn(() => {
    hasPointerCapture = true;
  });
  const releasePointerCapture = jest.fn(() => {
    hasPointerCapture = false;
  });

  Object.assign(carousel, {
    hasPointerCapture: jest.fn(() => hasPointerCapture),
    releasePointerCapture,
    setPointerCapture,
  });

  return { releasePointerCapture, setPointerCapture };
};

const dispatchPointerEvent = (element: HTMLElement, type: string, clientX: number) => {
  const event = new MouseEvent(type, { bubbles: true, button: 0, clientX });

  Object.defineProperties(event, {
    isPrimary: { value: true },
    pointerId: { value: 1 },
  });
  fireEvent(element, event);
};

describe('useReportPreferenceCarousel', () => {
  it('탭할 때 포인터를 캡처하지 않고 카드 클릭을 전달한다', () => {
    const onCardClick = jest.fn();
    render(<CarouselHarness onCardClick={onCardClick} onCardSelect={jest.fn()} />);
    const card = screen.getByRole('button', { name: '취향 카드' });
    const carousel = card.parentElement as HTMLElement;
    const { setPointerCapture } = setPointerCaptureMethods(carousel);

    dispatchPointerEvent(card, 'pointerdown', 100);
    dispatchPointerEvent(card, 'pointerup', 100);
    fireEvent.click(card);

    expect(setPointerCapture).not.toHaveBeenCalled();
    expect(onCardClick).toHaveBeenCalledTimes(1);
  });

  it('실제 드래그가 시작된 경우에만 포인터를 캡처하고 클릭을 차단한다', () => {
    const onCardClick = jest.fn();
    render(<CarouselHarness onCardClick={onCardClick} onCardSelect={jest.fn()} />);
    const card = screen.getByRole('button', { name: '취향 카드' });
    const carousel = card.parentElement as HTMLElement;
    const { releasePointerCapture, setPointerCapture } = setPointerCaptureMethods(carousel);
    Object.defineProperty(carousel, 'clientWidth', { configurable: true, value: 300 });

    dispatchPointerEvent(card, 'pointerdown', 100);
    dispatchPointerEvent(card, 'pointermove', 90);
    dispatchPointerEvent(card, 'pointerup', 90);
    fireEvent.click(card);

    expect(setPointerCapture).toHaveBeenCalledWith(1);
    expect(releasePointerCapture).toHaveBeenCalledWith(1);
    expect(onCardClick).not.toHaveBeenCalled();
  });

  it('드래그를 놓으면 선택을 변경하고 카드가 안착할 때까지 전환 상태를 유지한다', () => {
    jest.useFakeTimers();
    const onCardSelect = jest.fn();

    render(<CarouselSettleHarness onCardSelect={onCardSelect} />);
    const carousel = screen.getByTestId('settle-carousel');
    const firstSlot = screen.getByTestId('card-slot-0');
    const secondSlot = screen.getByTestId('card-slot-1');
    setPointerCaptureMethods(carousel);

    Object.defineProperties(carousel, {
      clientWidth: { configurable: true, value: 300 },
    });

    dispatchPointerEvent(carousel, 'pointerdown', 100);
    dispatchPointerEvent(carousel, 'pointermove', 0);
    dispatchPointerEvent(carousel, 'pointerup', 0);

    expect(secondSlot).toHaveClass('report-preference-carousel-card--current');
    expect(firstSlot).toHaveClass('report-preference-carousel-card--left');
    expect(onCardSelect).toHaveBeenCalledWith(1);

    act(() => jest.advanceTimersByTime(459));
    expect(onCardSelect).toHaveBeenCalledTimes(1);

    act(() => jest.advanceTimersByTime(1));
    expect(onCardSelect).toHaveBeenCalledTimes(1);

    dispatchPointerEvent(carousel, 'pointerdown', 50);
    expect(secondSlot).toHaveClass('report-preference-carousel-card--current');
    expect(firstSlot).toHaveClass('report-preference-carousel-card--left');

    jest.useRealTimers();
  });

  it('마지막 카드에서는 다음 카드 방향의 빈 영역으로 드래그되지 않는다', () => {
    render(
      <CarouselHarness
        cardCount={2}
        onCardClick={jest.fn()}
        onCardSelect={jest.fn()}
        selectedCardIndex={1}
      />
    );
    const card = screen.getByText('취향 카드');
    const carousel = card.parentElement as HTMLElement;
    setPointerCaptureMethods(carousel);

    Object.defineProperties(carousel, {
      clientWidth: { configurable: true, value: 300 },
    });

    dispatchPointerEvent(carousel, 'pointerdown', 100);
    dispatchPointerEvent(carousel, 'pointermove', 0);

    expect(carousel).not.toHaveAttribute('data-dragging');
    expect(carousel.style.getPropertyValue('--report-card-drag-offset')).toBe('');
  });

  it('카드 배열 앞에 항목이 추가돼도 같은 월 카드를 중앙에 유지한다', () => {
    const { rerender } = render(
      <CarouselIdentityHarness cardIds={['2026-06', '2026-07']} selectedCardIndex={0} />
    );

    rerender(
      <CarouselIdentityHarness cardIds={['2026-05', '2026-06', '2026-07']} selectedCardIndex={1} />
    );

    expect(screen.getByTestId('identity-card-2026-06')).toHaveClass(
      'report-preference-carousel-card--current'
    );
    expect(screen.getByTestId('identity-card-2026-05')).toHaveClass(
      'report-preference-carousel-card--left'
    );
    expect(screen.getByTestId('identity-card-2026-07')).toHaveClass(
      'report-preference-carousel-card--right'
    );
  });
});
