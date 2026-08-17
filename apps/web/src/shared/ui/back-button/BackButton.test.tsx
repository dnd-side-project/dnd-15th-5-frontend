import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { BackButton } from '.';

describe('<BackButton />', () => {
  it('버튼을 누르면 전달받은 뒤로 가기 동작을 실행한다', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();

    render(<BackButton onClick={handleClick} />);

    await user.click(screen.getByRole('button', { name: '뒤로 가기' }));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('접근성 이름을 변경할 수 있다', () => {
    render(<BackButton onClick={jest.fn()} aria-label="검색 화면으로 돌아가기" />);

    expect(screen.getByRole('button', { name: '검색 화면으로 돌아가기' })).toBeInTheDocument();
  });
});
