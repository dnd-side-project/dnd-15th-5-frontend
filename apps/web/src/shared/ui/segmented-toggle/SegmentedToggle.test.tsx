import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SegmentedToggle } from '.';

const OPTIONS = [
  { label: '자주 소비한 곳', value: 'frequentShops' },
  { label: '소비 기록', value: 'history' },
] as const;

describe('SegmentedToggle', () => {
  it('현재 값에 해당하는 옵션을 선택된 상태로 표시한다', () => {
    render(<SegmentedToggle options={OPTIONS} value="frequentShops" onValueChange={jest.fn()} />);

    expect(screen.getByRole('button', { name: '자주 소비한 곳' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(screen.getByRole('button', { name: '소비 기록' })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
  });

  it('다른 옵션을 누르면 그 값으로 변경을 알린다', async () => {
    const user = userEvent.setup();
    const onValueChange = jest.fn();
    render(
      <SegmentedToggle options={OPTIONS} value="frequentShops" onValueChange={onValueChange} />
    );

    await user.click(screen.getByRole('button', { name: '소비 기록' }));

    expect(onValueChange).toHaveBeenCalledWith('history');
  });

  it('이미 선택된 옵션을 다시 눌러도 변경을 알리지 않는다', async () => {
    const user = userEvent.setup();
    const onValueChange = jest.fn();
    render(
      <SegmentedToggle options={OPTIONS} value="frequentShops" onValueChange={onValueChange} />
    );

    await user.click(screen.getByRole('button', { name: '자주 소비한 곳' }));

    expect(onValueChange).not.toHaveBeenCalled();
  });
});
