import { render, screen } from '@testing-library/react';

import ReportPreferenceSharedCard from './ReportPreferenceSharedCard';

const CARD_PROPS = {
  description: '익숙한 동네와 단골 가게를 자주 찾아요.',
  metrics: [
    { leftLabel: '신규 탐색형', rightLabel: '단골 반복형', value: 78 },
    { leftLabel: '동네 확장형', rightLabel: '동네 집중형', value: 67 },
    { leftLabel: '낮소비형', rightLabel: '밤소비형', value: 19 },
    { leftLabel: '즉흥형', rightLabel: '규칙형', value: 79 },
  ],
  tags: ['낮 활동파', '단골형', '규칙적'],
  title: '동네 터줏대감',
  variant: 'local-regular',
} as const;

describe('ReportPreferenceSharedCard', () => {
  it('이미지 저장과 공유 페이지에서 함께 사용하는 설명 포함 카드를 표시한다', () => {
    render(<ReportPreferenceSharedCard {...CARD_PROPS} />);

    const card = screen.getByRole('article', { name: '동네 터줏대감 공유 카드' });
    const titleGroup = screen.getByRole('heading', { name: '동네 터줏대감' }).parentElement;

    expect(card).toHaveClass('w-61', 'shadow-report-preference-share-card');
    expect(titleGroup).toHaveClass('text-neutral-00');
    expect(screen.getByText(CARD_PROPS.description)).toBeInTheDocument();
  });

  it('이미지 저장용으로 렌더링하면 그림자를 제외한다', () => {
    render(<ReportPreferenceSharedCard {...CARD_PROPS} hasShadow={false} />);

    expect(screen.getByRole('article', { name: '동네 터줏대감 공유 카드' })).not.toHaveClass(
      'shadow-report-preference-share-card'
    );
  });
});
