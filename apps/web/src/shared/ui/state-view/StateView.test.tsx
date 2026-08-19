import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { StateView } from './StateView';

jest.mock('@/shared/assets/images/state', () => ({
  EmptyStateImage: 'img-empty.png',
  ErrorStateImage: 'img-error.png',
}));

describe('StateView', () => {
  it('empty 상태를 표시하고 액션을 실행한다', async () => {
    const user = userEvent.setup();
    const handleAction = jest.fn();

    const { container } = render(
      <StateView
        variant="empty"
        title="아직 기록이 없어요"
        description={'소비 기록을 작성해보세요.\n빈 공간이 채워질 거예요.'}
        actionLabel="소비 기록 작성하기"
        headingAs="h1"
        onAction={handleAction}
      />
    );

    expect(
      screen.getByRole('heading', { level: 1, name: '아직 기록이 없어요' })
    ).toBeInTheDocument();
    expect(container.querySelector('img')).toHaveClass('mix-blend-luminosity');

    await user.click(screen.getByRole('button', { name: '소비 기록 작성하기' }));
    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it('error 상태를 표시하고 이미지에는 luminosity를 적용하지 않는다', () => {
    const { container } = render(
      <StateView
        variant="error"
        title="에러가 발생했어요"
        description={'잠시 후에\n다시 시도해주세요'}
        actionLabel="다시 시도하기"
        headingAs="h2"
        onAction={jest.fn()}
      />
    );

    expect(
      screen.getByRole('heading', { level: 2, name: '에러가 발생했어요' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '다시 시도하기' })).toBeInTheDocument();
    expect(container.querySelector('img')).not.toHaveClass('mix-blend-luminosity');
  });

  it('home 액션을 선택하면 홈 링크를 표시한다', () => {
    render(
      <MemoryRouter>
        <StateView
          variant="error"
          title="에러가 발생했어요"
          description="요청하신 화면을 불러오지 못했어요."
          actionLabel="홈으로 가기"
          headingAs="h3"
          to="/home"
        />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: '홈으로 가기' })).toHaveAttribute('href', '/home');
  });
});
