import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';

import ReportPreferenceSection from './ReportPreferenceSection';

describe('ReportPreferenceSection', () => {
  it('이미지 저장은 전체 공유 카드를, 카카오 썸네일은 앞면 카드를 캡처한다', () => {
    const captureRef = createRef<HTMLDivElement>();
    const thumbnailCaptureRef = createRef<HTMLDivElement>();

    render(
      <ReportPreferenceSection
        captureRef={captureRef}
        cards={[
          {
            description: '익숙한 동네와 단골 가게를 자주 찾아요.',
            id: '2026-08',
            isUnavailable: false,
            metrics: [],
            month: { month: 8, year: 2026 },
            tags: ['낮 활동파', '단골형', '규칙적'],
            title: '동네 터줏대감',
            variant: 'local-regular',
          },
        ]}
        isFlipped={false}
        onCardSelect={jest.fn()}
        onCardTransitionChange={jest.fn()}
        onFlip={jest.fn()}
        onShare={jest.fn()}
        selectedCardIndex={0}
        thumbnailCaptureRef={thumbnailCaptureRef}
      />
    );

    expect(captureRef.current).toHaveTextContent('익숙한 동네와 단골 가게를 자주 찾아요.');
    expect(thumbnailCaptureRef.current).toHaveTextContent('동네 터줏대감');
    expect(thumbnailCaptureRef.current).not.toHaveTextContent(
      '익숙한 동네와 단골 가게를 자주 찾아요.'
    );
    expect(
      thumbnailCaptureRef.current?.querySelector('[data-report-preference-card-front]')
    ).not.toBeNull();
    expect(
      thumbnailCaptureRef.current?.querySelector('.report-preference-card-face--back')
    ).toBeNull();
  });

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
        thumbnailCaptureRef={createRef<HTMLDivElement>()}
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
