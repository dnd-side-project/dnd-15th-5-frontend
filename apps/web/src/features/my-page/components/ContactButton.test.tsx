import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { useToast } from '@/shared/ui/toast';

import ContactButton from './ContactButton';

jest.mock('@/shared/ui/toast', () => ({ useToast: jest.fn() }));

const mockShowToast = jest.fn();

describe('ContactButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useToast).mockReturnValue({ showToast: mockShowToast, closeToast: jest.fn() });
  });

  it('문의 팝업에서 메일 앱 링크와 이메일 주소 복사를 제공한다', async () => {
    const user = userEvent.setup();
    const writeText = jest.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);
    render(
      <MemoryRouter>
        <ContactButton />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: '문의하기' }));

    expect(screen.getByRole('dialog', { name: '문의하기' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '메일 앱 열기' })).toHaveAttribute(
      'href',
      'mailto:contact@chapchap.kr?subject=%5BChapChap%5D%20%EB%AC%B8%EC%9D%98'
    );

    await user.click(screen.getByRole('button', { name: '주소 복사' }));

    expect(writeText).toHaveBeenCalledWith('contact@chapchap.kr');
    expect(mockShowToast).toHaveBeenCalledWith({
      type: 'success',
      message: '이메일 주소를 복사했어요.',
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('복사에 실패하면 오류를 안내하고 팝업을 유지한다', async () => {
    const user = userEvent.setup();
    jest.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('복사 실패'));
    render(
      <MemoryRouter>
        <ContactButton />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: '문의하기' }));
    await user.click(screen.getByRole('button', { name: '주소 복사' }));

    expect(mockShowToast).toHaveBeenCalledWith({
      type: 'error',
      message: '이메일 주소를 복사하지 못했어요.',
    });
    expect(screen.getByRole('dialog', { name: '문의하기' })).toBeInTheDocument();
  });
});
