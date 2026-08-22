import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import SpendingHistory from './SpendingHistory';

jest.mock('@/shared/assets/images/state', () => ({
  EmptyStateImage: 'img-empty.png',
  ErrorStateImage: 'img-error.png',
}));

const firePointerEvent = (element: Element, type: string, clientY: number) => {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'clientY', { value: clientY, configurable: true });
  Object.defineProperty(event, 'pointerId', { value: 1, configurable: true });
  fireEvent(element, event);
};

const renderSpendingHistory = (initialDate?: string) =>
  render(
    <MemoryRouter>
      <SpendingHistory initialDate={initialDate} />
    </MemoryRouter>
  );

describe('SpendingHistory', () => {
  it('날짜별 소비 기록과 금액을 보여준다', () => {
    renderSpendingHistory();

    expect(screen.getByRole('heading', { level: 1, name: '8월 소비 내역' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '월 선택' })).toHaveTextContent('8월');
    expect(screen.getByRole('heading', { name: '22일 목요일' })).toBeInTheDocument();
    expect(screen.getAllByText('투썸플레이스')).toHaveLength(7);
    expect(screen.getAllByText('5,500 원')).toHaveLength(7);
    expect(screen.getAllByText('2026.08.22 · 오전 · 카페')).toHaveLength(3);
  });

  it('초기 날짜가 있으면 해당 날짜의 소비 기록만 보여준다', () => {
    renderSpendingHistory('2026-08-21');

    expect(screen.getByRole('heading', { level: 1, name: '8월 소비 내역' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '21일 수요일' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '22일 목요일' })).not.toBeInTheDocument();
    expect(screen.getAllByText('투썸플레이스')).toHaveLength(1);
  });

  it('초기 날짜가 변경되면 선택 월과 기록 목록을 동기화한다', () => {
    const { rerender } = renderSpendingHistory('2026-08-21');

    expect(screen.getByRole('heading', { level: 1, name: '8월 소비 내역' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '21일 수요일' })).toBeInTheDocument();

    rerender(
      <MemoryRouter>
        <SpendingHistory initialDate="2026-07-01" />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { level: 1, name: '7월 소비 내역' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '21일 수요일' })).not.toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: '아직 기록이 없어요' })
    ).toBeInTheDocument();
  });

  it('월 선택 바텀시트에서 월을 바꾸고 시트를 닫는다', async () => {
    const user = userEvent.setup();
    renderSpendingHistory();

    await user.click(screen.getByRole('button', { name: '월 선택' }));

    expect(screen.getByRole('dialog', { name: '월 선택하기' })).toBeInTheDocument();
    const selectedMonthButton = screen.getByRole('button', { name: '2026년 8월' });
    expect(selectedMonthButton).toHaveAttribute('aria-pressed', 'true');
    expect(selectedMonthButton).toHaveFocus();

    screen.getByRole('button', { name: '2025년 11월' }).focus();
    await user.tab();
    expect(screen.getByRole('button', { name: '바텀시트 높이 조절' })).toHaveFocus();

    await user.click(screen.getByRole('button', { name: '2026년 7월' }));

    expect(screen.queryByRole('dialog', { name: '월 선택하기' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '월 선택' })).toHaveTextContent('7월');
    expect(
      screen.getByRole('heading', { level: 2, name: '아직 기록이 없어요' })
    ).toBeInTheDocument();
    expect(screen.getByText(/소비 기록을 작성해보세요/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '소비 기록 작성하기' })).toHaveAttribute(
      'href',
      '/record'
    );
  });

  it('월 선택 바텀시트 바깥을 누르면 시트를 닫고 스크롤 잠금을 해제한다', async () => {
    const user = userEvent.setup();
    const { container } = renderSpendingHistory();

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
    renderSpendingHistory();

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
    renderSpendingHistory();

    await user.click(screen.getByRole('button', { name: '월 선택' }));
    const dialog = screen.getByRole('dialog', { name: '월 선택하기' });
    const sheet = dialog.parentElement?.parentElement as HTMLElement;
    const monthList = dialog.querySelector('ul') as HTMLUListElement;

    expect(sheet).toHaveStyle({ height: '70dvh' });

    Object.defineProperty(monthList, 'scrollTop', { configurable: true, value: 1 });
    fireEvent.scroll(monthList);

    expect(sheet).toHaveStyle({ height: '92dvh' });
  });
});
