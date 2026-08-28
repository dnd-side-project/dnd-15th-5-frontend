import { render, screen } from '@testing-library/react';

import ReportPreferenceShareScreen from './ReportPreferenceShareScreen';

describe('ReportPreferenceShareScreen', () => {
  it('URL로 변경할 수 있는 월 없이 공유 사용자의 취향 카드 제목을 표시한다', () => {
    render(
      <ReportPreferenceShareScreen
        description="익숙한 동네와 단골 가게를 자주 찾아요."
        metrics={[]}
        nickname="이앤더"
        tags={['낮 활동파', '단골형', '규칙적']}
        title="동네 터줏대감"
        variant="local-regular"
      />
    );

    const title = screen.getByRole('heading', { level: 1 });

    expect(title).toHaveTextContent('이앤더님의 취향 카드');
    expect(title).not.toHaveTextContent(/\d+월/);
    expect(title).toHaveClass('report-preference-share-title-enter');
    expect(document.querySelector('.report-preference-share-card-enter')).toBeInTheDocument();
  });
});
