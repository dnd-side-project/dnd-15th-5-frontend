import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import AppErrorFallback from './AppErrorFallback';

jest.mock('@/shared/assets/images/state', () => ({
  EmptyStateImage: 'img-empty.png',
  ErrorStateImage: 'img-error.png',
}));

describe('<AppErrorFallback />', () => {
  it('오류 안내를 표시하고 다시 시도 동작을 실행한다', async () => {
    const user = userEvent.setup();
    const handleRetry = jest.fn();

    render(<AppErrorFallback onRetry={handleRetry} />);

    expect(
      screen.getByRole('heading', { level: 1, name: '화면을 불러오지 못했어요' })
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '다시 시도하기' }));
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });
});
