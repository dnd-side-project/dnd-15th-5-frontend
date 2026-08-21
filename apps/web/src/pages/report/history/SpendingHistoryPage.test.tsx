import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import SpendingHistoryPage from './SpendingHistoryPage';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('@/features/report', () => ({
  SpendingHistory: () => <div>소비내역</div>,
}));

describe('SpendingHistoryPage', () => {
  it('뒤로 가기 버튼과 소비내역을 조립하고 이전 페이지 이동을 연결한다', async () => {
    const user = userEvent.setup();
    render(<SpendingHistoryPage />);

    expect(screen.getByText('소비내역')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '뒤로 가기' }));
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});
