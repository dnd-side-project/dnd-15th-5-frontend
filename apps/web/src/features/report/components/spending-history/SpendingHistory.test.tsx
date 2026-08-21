import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import SpendingHistory from './SpendingHistory';

const firePointerEvent = (element: Element, type: string, clientY: number) => {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'clientY', { value: clientY, configurable: true });
  Object.defineProperty(event, 'pointerId', { value: 1, configurable: true });
  fireEvent(element, event);
};

describe('SpendingHistory', () => {
  it('날짜별 소비 기록과 금액을 보여준다', () => {
    render(<SpendingHistory onBack={jest.fn()} />);

    expect(screen.getByRole('heading', { level: 1, name: '7월 소비 내역' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '월 선택' })).toHaveTextContent('7월');
    expect(screen.getByRole('heading', { name: '22일 목요일' })).toBeInTheDocument();
    expect(screen.getAllByText('투썸플레이스')).toHaveLength(7);
    expect(screen.getAllByText('5,500 원')).toHaveLength(7);
  });

  it('월 선택 바텀시트에서 월을 바꾸고 시트를 닫는다', async () => {
    const user = userEvent.setup();
    render(<SpendingHistory onBack={jest.fn()} />);

    await user.click(screen.getByRole('button', { name: '월 선택' }));

    expect(screen.getByRole('dialog', { name: '월 선택하기' })).toBeInTheDocument();
    const selectedMonthButton = screen.getByRole('button', { name: '2026년 7월' });
    expect(selectedMonthButton).toHaveAttribute('aria-pressed', 'true');
    expect(selectedMonthButton).toHaveFocus();

    screen.getByRole('button', { name: '2025년 10월' }).focus();
    await user.tab();
    expect(screen.getByRole('button', { name: '바텀시트 높이 조절' })).toHaveFocus();

    await user.click(screen.getByRole('button', { name: '2026년 6월' }));

    expect(screen.queryByRole('dialog', { name: '월 선택하기' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '월 선택' })).toHaveTextContent('6월');
    expect(screen.getByText('소비 기록이 없어요')).toBeInTheDocument();
  });

  it('월 선택 바텀시트 바깥을 누르면 시트를 닫고 스크롤 잠금을 해제한다', async () => {
    const user = userEvent.setup();
    const { container } = render(<SpendingHistory onBack={jest.fn()} />);

    await user.click(screen.getByRole('button', { name: '월 선택' }));
    expect(document.body.style.overflow).toBe('hidden');

    const overlay = container.querySelector('[data-slot="overlay"]');
    expect(overlay).not.toBeNull();
    fireEvent.pointerDown(overlay!);

    expect(screen.queryByRole('dialog', { name: '월 선택하기' })).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe('');
    expect(screen.getByRole('button', { name: '월 선택' })).toHaveFocus();
  });

  it('월 선택 바텀시트를 위로 드래그하면 확장하고 아래로 드래그하면 닫는다', async () => {
    const user = userEvent.setup();
    render(<SpendingHistory onBack={jest.fn()} />);

    await user.click(screen.getByRole('button', { name: '월 선택' }));
    const handle = screen.getByRole('button', { name: '바텀시트 높이 조절' });
    const sheet = handle.parentElement as HTMLElement;

    expect(sheet).toHaveStyle({ height: '70dvh' });

    firePointerEvent(handle, 'pointerdown', 500);
    firePointerEvent(handle, 'pointermove', 350);
    firePointerEvent(handle, 'pointerup', 350);

    expect(sheet).toHaveStyle({ height: '92dvh' });

    firePointerEvent(handle, 'pointerdown', 300);
    firePointerEvent(handle, 'pointermove', 1000);
    firePointerEvent(handle, 'pointerup', 1000);

    expect(screen.queryByRole('dialog', { name: '월 선택하기' })).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe('');
  });

  it('월 목록 내부를 스크롤하면 바텀시트를 전체 높이로 확장한다', async () => {
    const user = userEvent.setup();
    render(<SpendingHistory onBack={jest.fn()} />);

    await user.click(screen.getByRole('button', { name: '월 선택' }));
    const dialog = screen.getByRole('dialog', { name: '월 선택하기' });
    const sheet = dialog.parentElement?.parentElement as HTMLElement;
    const monthList = dialog.querySelector('ul') as HTMLUListElement;

    expect(sheet).toHaveStyle({ height: '70dvh' });

    Object.defineProperty(monthList, 'scrollTop', { configurable: true, value: 1 });
    fireEvent.scroll(monthList);

    expect(sheet).toHaveStyle({ height: '92dvh' });
  });

  it('뒤로 가기 버튼을 누르면 전달받은 동작을 실행한다', async () => {
    const user = userEvent.setup();
    const onBack = jest.fn();
    render(<SpendingHistory onBack={onBack} />);

    await user.click(screen.getByRole('button', { name: '뒤로 가기' }));

    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
