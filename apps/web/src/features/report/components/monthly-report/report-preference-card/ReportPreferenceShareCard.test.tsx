import { render, screen } from '@testing-library/react';

import ReportPreferenceShareCard from './ReportPreferenceShareCard';
import ReportPreferenceSharedCard from './ReportPreferenceSharedCard';

const CARD_PROPS = {
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

describe('ReportPreferenceShareCard', () => {
  it('이미지 저장용 카드는 설명 없이 기존 244×516 크기와 제목 색상을 유지한다', () => {
    render(<ReportPreferenceShareCard {...CARD_PROPS} />);

    const card = screen.getByRole('article', { name: '동네 터줏대감 이미지 저장 카드' });
    const titleGroup = screen.getByRole('heading', { name: '동네 터줏대감' }).parentElement;

    expect(card).toHaveClass('h-129', 'w-61');
    expect(titleGroup).toHaveClass('text-primary-50');
    expect(screen.queryByText(/익숙한 동네/)).not.toBeInTheDocument();
  });

  it('설명은 공유 화면에서 전달한 경우에만 표시한다', () => {
    render(
      <ReportPreferenceSharedCard
        {...CARD_PROPS}
        description="익숙한 동네와 단골 가게를 자주 찾아요."
      />
    );

    expect(screen.getByText('익숙한 동네와 단골 가게를 자주 찾아요.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '동네 터줏대감' }).parentElement).toHaveClass(
      'text-neutral-00'
    );
  });
});
