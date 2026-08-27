import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import VisitDateTimeSheet from './VisitDateTimeSheet';

describe('<VisitDateTimeSheet />', () => {
  it('시간대 선택 버튼 아래 여백으로 4주와 5주 달을 6주 높이에 맞춘다', async () => {
    const user = userEvent.setup();

    render(
      <VisitDateTimeSheet
        onClose={jest.fn()}
        onConfirm={jest.fn()}
        value={{ date: new Date(2015, 1, 15), period: 'afternoon' }}
      />
    );

    expect(screen.getByTestId('calendar-height-spacer')).toHaveStyle({ height: '80px' });

    await user.click(screen.getByRole('button', { name: '다음 달' }));

    expect(screen.getByTestId('calendar-height-spacer')).toHaveStyle({ height: '40px' });

    await user.click(screen.getByRole('button', { name: '다음 달' }));
    await user.click(screen.getByRole('button', { name: '다음 달' }));

    expect(screen.queryByTestId('calendar-height-spacer')).not.toBeInTheDocument();
  });
});
