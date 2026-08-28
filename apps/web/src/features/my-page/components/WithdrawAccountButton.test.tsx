import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useWithdrawAccount } from '@/features/my-page/apis/hooks/useWithdrawAccount';

import WithdrawAccountButton from './WithdrawAccountButton';

jest.mock('@/features/my-page/apis/hooks/useWithdrawAccount', () => ({
  useWithdrawAccount: jest.fn(),
}));

const mockWithdraw = jest.fn();

describe('WithdrawAccountButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useWithdrawAccount).mockReturnValue({
      isLoading: false,
      withdraw: mockWithdraw,
    });
  });

  it('확인 다이얼로그에서 탈퇴를 선택하면 회원 탈퇴를 요청한다', async () => {
    const user = userEvent.setup();
    render(<WithdrawAccountButton />);

    await user.click(screen.getByRole('button', { name: '회원탈퇴' }));
    expect(screen.getByRole('dialog', { name: '정말 탈퇴하시겠어요?' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '탈퇴하기' }));

    expect(mockWithdraw).toHaveBeenCalledTimes(1);
  });

  it('취소를 선택하면 탈퇴 요청 없이 다이얼로그를 닫는다', async () => {
    const user = userEvent.setup();
    render(<WithdrawAccountButton />);

    await user.click(screen.getByRole('button', { name: '회원탈퇴' }));
    await user.click(screen.getByRole('button', { name: '취소' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(mockWithdraw).not.toHaveBeenCalled();
  });
});
