import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';

import ReportPreferenceSection from './ReportPreferenceSection';

describe('ReportPreferenceSection', () => {
  it('내부 버튼이 없는 empty 카드에서도 캐러셀에 포커스해 키보드로 이동한다', () => {
    const onCardSelect = jest.fn();

    render(
      <ReportPreferenceSection
        captureRef={createRef<HTMLDivElement>()}
        cards={[
          {
            id: '2026-05',
            isUnavailable: true,
            month: { month: 5, year: 2026 },
          },
          {
            id: '2026-06',
            isUnavailable: true,
            month: { month: 6, year: 2026 },
          },
        ]}
        isFlipped={false}
        onCardSelect={onCardSelect}
        onCardTransitionChange={jest.fn()}
        onFlip={jest.fn()}
        onShare={jest.fn()}
        selectedCardIndex={0}
      />
    );

    const carousel = screen.getByRole('region', { name: '월별 소비 성향 카드' });

    expect(carousel).toHaveAttribute('tabindex', '0');

    carousel.focus();
    fireEvent.keyDown(carousel, { key: 'ArrowRight' });

    expect(carousel).toHaveFocus();
    expect(onCardSelect).toHaveBeenCalledWith(1);
  });
});
