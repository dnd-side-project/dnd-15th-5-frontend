import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { useConsumptionsInfiniteQuery } from '@/features/report/apis/hooks/useConsumptionsInfiniteQuery';
import { MOCK_SPENDING_RECORD_GROUPS } from '@/features/report/mockData';

import SpendingHistory from './SpendingHistory';

jest.mock('@/features/report/apis/hooks/useConsumptionsInfiniteQuery');

jest.mock('@/shared/assets/images/state', () => ({
  EmptyStateImage: 'img-empty.png',
  ErrorStateImage: 'img-error.png',
}));

const mockedUseConsumptionsInfiniteQuery = jest.mocked(useConsumptionsInfiniteQuery);
const fetchNextPage = jest.fn();
const refetch = jest.fn();

const consumptions = MOCK_SPENDING_RECORD_GROUPS.flatMap((group) =>
  group.records.map((record, index) => ({
    id: Number(record.id.replace('record-', '')),
    placeName: record.shopName,
    amount: record.amount,
    category: record.category,
    purchaseDate: group.dateValue,
    purchaseTime: index === 0 ? '09:00:00' : '10:00:00',
  }))
);

const createQueryResult = (yearMonth: string) =>
  ({
    data: { pages: [{ data: { consumptions: yearMonth === '2026-08' ? consumptions : [] } }] },
    fetchNextPage,
    refetch,
    hasNextPage: false,
    isPending: false,
    isError: false,
    isFetchNextPageError: false,
    isFetchingNextPage: false,
  }) as unknown as ReturnType<typeof useConsumptionsInfiniteQuery>;

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
  beforeEach(() => {
    fetchNextPage.mockReset();
    refetch.mockReset();
    mockedUseConsumptionsInfiniteQuery.mockImplementation(createQueryResult);
  });

  it('날짜별 소비 기록과 금액을 보여준다', () => {
    renderSpendingHistory();

    expect(screen.getByRole('heading', { level: 1, name: '8월 소비 내역' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '월 선택' })).toHaveTextContent('8월');
    expect(screen.getByRole('heading', { name: '22일 토요일' })).toBeInTheDocument();
    expect(screen.getAllByText('투썸플레이스')).toHaveLength(7);
    expect(screen.getAllByText('5,500 원')).toHaveLength(7);
    expect(screen.getAllByText('2026.08.22 · 오전 · 카페')).toHaveLength(3);
  });

  it('상단 안내 문구를 전달하면 월 선택 대신 안내를 보여준다', () => {
    render(
      <MemoryRouter>
        <SpendingHistory headerDescription="이번달 작성한 소비기록을 확인해보세요" />
      </MemoryRouter>
    );

    const description = screen.getByText('이번달 작성한 소비기록을 확인해보세요');
    expect(description).toBeInTheDocument();
    expect(description.closest('header')).toBeNull();
    expect(screen.queryByRole('button', { name: '월 선택' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '이전 달 보기' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '다음 달 보기' })).not.toBeInTheDocument();
  });

  it('최초 조회 중에는 소비내역 스켈레톤을 보여준다', () => {
    mockedUseConsumptionsInfiniteQuery.mockReturnValue({
      ...createQueryResult('2026-07'),
      data: undefined,
      isPending: true,
    } as unknown as ReturnType<typeof useConsumptionsInfiniteQuery>);

    renderSpendingHistory();

    expect(screen.getByRole('status', { name: '소비내역 불러오는 중' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '아직 기록이 없어요' })).not.toBeInTheDocument();
  });

  it('소비내역 조회에 실패하면 다시 불러올 수 있다', async () => {
    const user = userEvent.setup();
    mockedUseConsumptionsInfiniteQuery.mockReturnValue({
      ...createQueryResult('2026-07'),
      isError: true,
    } as unknown as ReturnType<typeof useConsumptionsInfiniteQuery>);

    renderSpendingHistory();

    expect(
      screen.getByRole('heading', { level: 2, name: '소비내역을 불러오지 못했어요' })
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '다시 불러오기' }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('다음 페이지 조회에 실패하면 기존 목록을 유지하고 하단에서 재시도한다', async () => {
    const user = userEvent.setup();
    mockedUseConsumptionsInfiniteQuery.mockReturnValue({
      ...createQueryResult('2026-08'),
      hasNextPage: true,
      isError: true,
      isFetchNextPageError: true,
    } as unknown as ReturnType<typeof useConsumptionsInfiniteQuery>);

    renderSpendingHistory();

    expect(screen.getByRole('heading', { name: '22일 토요일' })).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: '소비내역을 불러오지 못했어요' })
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '다시 불러오기' }));
    expect(fetchNextPage).toHaveBeenCalledTimes(1);
    expect(refetch).not.toHaveBeenCalled();
  });

  it('특정 날짜를 찾던 중 다음 페이지 조회에 실패하면 자동 재요청을 멈춘다', async () => {
    const user = userEvent.setup();
    mockedUseConsumptionsInfiniteQuery.mockReturnValue({
      ...createQueryResult('2026-08'),
      hasNextPage: true,
      isError: true,
      isFetchNextPageError: true,
    } as unknown as ReturnType<typeof useConsumptionsInfiniteQuery>);

    renderSpendingHistory('2026-08-20');

    expect(fetchNextPage).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: '다시 불러오기' }));
    expect(fetchNextPage).toHaveBeenCalledTimes(1);
    expect(refetch).not.toHaveBeenCalled();
  });

  it('초기 날짜가 있으면 해당 날짜의 소비 기록만 보여준다', () => {
    renderSpendingHistory('2026-08-21');

    expect(screen.getByRole('heading', { level: 1, name: '8월 소비 내역' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '21일 금요일' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '22일 토요일' })).not.toBeInTheDocument();
    expect(screen.getAllByText('투썸플레이스')).toHaveLength(1);
  });

  it('날짜 링크로 진입한 뒤 다른 월을 선택하면 다음 페이지를 불러온다', async () => {
    const user = userEvent.setup();
    let intersectionCallback: IntersectionObserverCallback = jest.fn();
    Object.defineProperty(globalThis, 'IntersectionObserver', {
      configurable: true,
      writable: true,
      value: jest.fn((callback: IntersectionObserverCallback) => {
        intersectionCallback = callback;
        return {
          observe: jest.fn(),
          disconnect: jest.fn(),
          unobserve: jest.fn(),
          takeRecords: jest.fn(),
        };
      }),
    });
    mockedUseConsumptionsInfiniteQuery.mockImplementation((yearMonth) => {
      if (yearMonth !== '2026-07') return createQueryResult(yearMonth);

      return {
        ...createQueryResult(yearMonth),
        data: {
          pages: [
            {
              data: {
                consumptions: [
                  {
                    id: 8,
                    placeName: '칠월 카페',
                    amount: 7_000,
                    category: '카페',
                    purchaseDate: '2026-07-31',
                    purchaseTime: '10:00:00',
                  },
                ],
              },
            },
          ],
        },
        hasNextPage: true,
      } as unknown as ReturnType<typeof useConsumptionsInfiniteQuery>;
    });
    renderSpendingHistory('2026-08-21');

    await user.click(screen.getByRole('button', { name: '이전 달 보기' }));
    expect(screen.getByText('칠월 카페')).toBeInTheDocument();

    act(() => {
      intersectionCallback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver
      );
    });

    expect(fetchNextPage).toHaveBeenCalledTimes(1);
  });

  it('초기 날짜가 변경되면 선택 월과 기록 목록을 동기화한다', () => {
    const { rerender } = renderSpendingHistory('2026-08-21');

    expect(screen.getByRole('heading', { level: 1, name: '8월 소비 내역' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '21일 금요일' })).toBeInTheDocument();

    rerender(
      <MemoryRouter>
        <SpendingHistory initialDate="2026-07-01" />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { level: 1, name: '7월 소비 내역' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '21일 금요일' })).not.toBeInTheDocument();
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
