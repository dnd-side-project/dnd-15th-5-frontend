import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import FrequentShopList from './FrequentShopList';

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

const renderFrequentShopList = () =>
  render(
    <MemoryRouter>
      <FrequentShopList />
    </MemoryRouter>
  );

describe('FrequentShopList', () => {
  it('단골 가게의 순위와 이번 달 방문 횟수를 보여준다', () => {
    renderFrequentShopList();

    expect(screen.getByRole('heading', { name: '단골 리스트' })).toBeInTheDocument();
    expect(screen.getByLabelText('1위')).toBeInTheDocument();
    expect(screen.getByLabelText('2위')).toBeInTheDocument();
    expect(screen.getByLabelText('3위')).toBeInTheDocument();
    expect(screen.getByLabelText('12회 방문')).toBeInTheDocument();
    expect(screen.getAllByText('용산구')).toHaveLength(8);
  });

  it('카테고리 칩으로 목록을 필터링한다', async () => {
    const user = userEvent.setup();
    renderFrequentShopList();

    await user.click(screen.getByRole('button', { name: '편의점/마트' }));

    expect(screen.getByRole('button', { name: '편의점/마트' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(screen.queryByLabelText('1위')).not.toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: '아직 기록이 없어요' })
    ).toBeInTheDocument();
    expect(screen.getByText(/소비 기록을 작성해보세요/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '소비 기록 작성하기' })).toHaveAttribute(
      'href',
      '/record'
    );

    await user.click(screen.getByRole('button', { name: '카페' }));
    expect(screen.getByLabelText('1위')).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { level: 2, name: '아직 기록이 없어요' })
    ).not.toBeInTheDocument();
  });

  it('기간 필터에서 전체 기간을 선택하면 누적 방문 횟수로 바꾼다', async () => {
    const user = userEvent.setup();
    renderFrequentShopList();

    await user.click(screen.getByRole('button', { name: '기간 필터' }));

    expect(screen.getByRole('dialog', { name: '기간' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '이번달' })).toHaveAttribute('aria-pressed', 'true');

    await user.click(screen.getByRole('button', { name: '전체' }));

    expect(screen.queryByRole('dialog', { name: '기간' })).not.toBeInTheDocument();
    expect(screen.getByLabelText('28회 방문')).toBeInTheDocument();
  });

  it('필터 바깥을 누르면 바텀시트를 닫고 포커스를 복원한다', async () => {
    const user = userEvent.setup();
    const { container } = renderFrequentShopList();
    const filterButton = screen.getByRole('button', { name: '기간 필터' });

    await user.click(filterButton);
    const overlay = container.querySelector('[data-slot="overlay"]');
    expect(overlay).not.toBeNull();

    fireEvent.pointerDown(overlay!);

    expect(screen.queryByRole('dialog', { name: '기간' })).not.toBeInTheDocument();
    expect(filterButton).toHaveFocus();
    expect(document.body.style.overflow).toBe('');
  });

  it('기간 선택 시트를 아래로 드래그하면 닫는다', async () => {
    const user = userEvent.setup();
    renderFrequentShopList();

    await user.click(screen.getByRole('button', { name: '기간 필터' }));
    const handle = screen.getByRole('button', { name: '바텀시트 높이 조절' });
    const sheet = handle.parentElement as HTMLElement;
    jest.spyOn(sheet, 'getBoundingClientRect').mockReturnValue({
      ...sheet.getBoundingClientRect(),
      height: 222,
    });

    firePointerEvent(handle, 'pointerdown', 500);
    firePointerEvent(handle, 'pointermove', 700);
    firePointerEvent(handle, 'pointerup', 700);

    expect(screen.queryByRole('dialog', { name: '기간' })).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe('');
  });
});
