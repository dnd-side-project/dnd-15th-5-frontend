import { fireEvent, render, screen } from '@testing-library/react';

import ManualRecordForm from './ManualRecordForm';

describe('ManualRecordForm', () => {
  it('하단 입력 필드와 제출 버튼을 렌더링한다', () => {
    const handleSubmit = jest.fn();

    render(<ManualRecordForm onBack={jest.fn()} onSubmit={handleSubmit} />);

    expect(screen.getByPlaceholderText('금액을 입력해주세요')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '식비' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '기록하기' }));
    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });

  it('카테고리 칩을 하나 선택한다', () => {
    render(<ManualRecordForm onBack={jest.fn()} onSubmit={jest.fn()} />);

    const cafeChip = screen.getByRole('button', { name: '카페' });
    const shoppingChip = screen.getByRole('button', { name: '쇼핑' });

    fireEvent.click(cafeChip);
    expect(cafeChip).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(shoppingChip);
    expect(cafeChip).toHaveAttribute('aria-pressed', 'false');
    expect(shoppingChip).toHaveAttribute('aria-pressed', 'true');
  });

  it('금액 인풋을 포커스한 동안 폼을 위로 이동한다', () => {
    render(<ManualRecordForm onBack={jest.fn()} onSubmit={jest.fn()} />);

    const amountInput = screen.getByPlaceholderText('금액을 입력해주세요');
    const form = amountInput.closest('form');

    fireEvent.focus(amountInput);
    expect(form).toHaveClass('-translate-y-16');

    fireEvent.blur(amountInput);
    expect(form).toHaveClass('translate-y-0');
  });
});
