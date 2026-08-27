import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useNavigate } from 'react-router-dom';

import NotificationPage from './NotificationPage';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

const mockUseNavigate = jest.mocked(useNavigate);

describe('<NotificationPage />', () => {
  it('최근 알림과 이전 알림을 구분해 표시한다', () => {
    mockUseNavigate.mockReturnValue(jest.fn());

    render(<NotificationPage />);

    expect(screen.getByRole('heading', { level: 1, name: '알림' })).toBeInTheDocument();
    expect(screen.getByRole('list', { name: '최근 알림' }).children).toHaveLength(4);
    expect(screen.getByRole('list', { name: '이전 알림 목록' }).children).toHaveLength(3);
    expect(screen.getByText('30일 전 알림까지 확인할 수 있어요')).toBeInTheDocument();
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
