import { fireEvent, render, screen } from '@testing-library/react';

import { useReportPreferenceCarousel } from './useReportPreferenceCarousel';

type CarouselHarnessProps = {
  onCardClick: () => void;
  onCardSelect: (index: number) => void;
};

function CarouselHarness({ onCardClick, onCardSelect }: CarouselHarnessProps) {
  const {
    carouselRef,
    handleCarouselClickCapture,
    handleCarouselPointerCancel,
    handleCarouselPointerDown,
    handleCarouselPointerMove,
    handleCarouselPointerUp,
  } = useReportPreferenceCarousel({
    cardCount: 2,
    onCardSelect,
    selectedCardIndex: 0,
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

    dispatchPointerEvent(card, 'pointerdown', 100);
    dispatchPointerEvent(card, 'pointermove', 90);
    dispatchPointerEvent(card, 'pointerup', 90);
    fireEvent.click(card);

    expect(setPointerCapture).toHaveBeenCalledWith(1);
    expect(releasePointerCapture).toHaveBeenCalledWith(1);
    expect(onCardClick).not.toHaveBeenCalled();
  });
});
