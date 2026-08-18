import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CategoryChip } from '.';

describe('<CategoryChip />', () => {
  it('선택 상태를 변경하고 변경된 값을 전달한다', async () => {
    const user = userEvent.setup();
    const handleSelectedChange = jest.fn();

    render(
      <CategoryChip defaultSelected onSelectedChange={handleSelectedChange}>
        카페
      </CategoryChip>
    );

    const chip = screen.getByRole('button', { name: '카페', pressed: true });

    await user.click(chip);

    expect(screen.getByRole('button', { name: '카페', pressed: false })).toBeInTheDocument();
    expect(handleSelectedChange).toHaveBeenCalledWith(false);
  });

  it('controlled 상태에서는 부모가 값을 변경하기 전까지 기존 상태를 유지한다', async () => {
    const user = userEvent.setup();
    const handleSelectedChange = jest.fn();

    render(
      <CategoryChip selected={false} onSelectedChange={handleSelectedChange}>
        운동
      </CategoryChip>
    );

    await user.click(screen.getByRole('button', { name: '운동' }));

    expect(handleSelectedChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole('button', { name: '운동', pressed: false })).toBeInTheDocument();
  });

  it('추천 아이콘을 표시하되 접근성 이름에서는 제외한다', () => {
    const { container } = render(
      <CategoryChip variant="compact" hasRecommendationIcon>
        가게 추천
      </CategoryChip>
    );

    expect(screen.getByRole('button', { name: '가게 추천' })).toBeInTheDocument();
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });
});
