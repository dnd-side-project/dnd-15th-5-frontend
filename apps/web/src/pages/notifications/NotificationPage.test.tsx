import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useNavigate } from 'react-router-dom';

import NotificationPage from './NotificationPage';

jest.mock('@/features/notification', () => ({
  NotificationFeed: () => <div>알림 목록</div>,
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

const mockUseNavigate = jest.mocked(useNavigate);

describe('<NotificationPage />', () => {
  it('알림 제목과 목록을 표시한다', () => {
    mockUseNavigate.mockReturnValue(jest.fn());

    render(<NotificationPage />);

    expect(screen.getByRole('heading', { level: 1, name: '알림' })).toBeInTheDocument();
    expect(screen.getByText('알림 목록')).toBeInTheDocument();
  });

  it('뒤로 가기 버튼을 누르면 이전 화면으로 이동한다', async () => {
    const user = userEvent.setup();
    const navigate = jest.fn();
    mockUseNavigate.mockReturnValue(navigate);

    render(<NotificationPage />);
    await user.click(screen.getByRole('button', { name: '이전 화면으로 돌아가기' }));

    expect(navigate).toHaveBeenCalledWith(-1);
  });
});
