import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { useConsumptionsInfiniteQuery } from '@/features/report/apis/hooks/useConsumptionsInfiniteQuery';

import SpendingHistory from './SpendingHistory';

jest.mock('@/features/report/apis/hooks/useConsumptionsInfiniteQuery');
const mockUseFirstAvailableYearMonthQuery = jest.fn();
jest.mock('@/features/report/apis/hooks/useFirstAvailableYearMonthQuery', () => ({
  useFirstAvailableYearMonthQuery: () => mockUseFirstAvailableYearMonthQuery(),
}));

jest.mock('@/shared/assets/images/state', () => ({
  EmptyStateImage: 'img-empty.png',
  ErrorStateImage: 'img-error.png',
}));

const mockedUseConsumptionsInfiniteQuery = jest.mocked(useConsumptionsInfiniteQuery);
const fetchNextPage = jest.fn();
const refetch = jest.fn();
const scrollTo = jest.fn();

const consumptions = [
  ...Array.from({ length: 3 }, (_, index) => ({
    id: index + 1,
    placeName: '투썸플레이스',
    amount: 5_500,
    category: '카페',
    purchaseDate: '2026-08-22',
    purchaseTime: index === 0 ? '09:00:00' : '10:00:00',
    thumbnailUrl: index === 0 ? 'https://example.com/consumption-01.jpg' : undefined,
  })),
  {
    id: 4,
    placeName: '투썸플레이스',
    amount: 5_500,
    category: '카페',
    purchaseDate: '2026-08-21',
    purchaseTime: '09:00:00',
  },
  ...Array.from({ length: 3 }, (_, index) => ({
    id: index + 5,
    placeName: '투썸플레이스',
    amount: 5_500,
    category: '카페',
    purchaseDate: '2026-08-20',
    purchaseTime: index === 0 ? '09:00:00' : '10:00:00',
  })),
];

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

const renderSpendingHistory = (scrollToDate?: string) =>
  render(
    <MemoryRouter>
      <SpendingHistory scrollToDate={scrollToDate} />
    </MemoryRouter>
  );

describe('SpendingHistory', () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-08-25T12:00:00+09:00'));
  });

  beforeEach(() => {
    fetchNextPage.mockReset();
    refetch.mockReset();
    scrollTo.mockReset();
    Object.defineProperty(window, 'scrollTo', { configurable: true, value: scrollTo });
    mockUseFirstAvailableYearMonthQuery.mockReturnValue({ data: { year: 2025, month: 11 } });
    mockedUseConsumptionsInfiniteQuery.mockImplementation(createQueryResult);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('날짜별 소비 기록과 금액을 보여준다', () => {
    const { container } = renderSpendingHistory();

    expect(screen.getByRole('heading', { level: 1, name: '8월 소비 내역' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '월 선택' })).toHaveTextContent('8월');
    expect(screen.getByRole('heading', { name: '22일 토요일' })).toBeInTheDocument();
    expect(screen.getAllByText('투썸플레이스')).toHaveLength(7);
    expect(screen.getAllByText('5,500 원')).toHaveLength(7);
    expect(screen.getAllByText('2026.08.22 · 오전 · 카페')).toHaveLength(3);
    expect(container.querySelector('img')).toHaveAttribute(
      'src',
      'https://example.com/consumption-01.jpg'
    );
  });

  it('화면 맥락에 맞는 소비내역 하단 여백을 적용한다', () => {
    const { container } = render(
      <MemoryRouter>
        <SpendingHistory contentBottomPaddingClassName="pb-28" />
      </MemoryRouter>
    );

    const content = container.querySelector('.pb-28');

    expect(content).toBeInTheDocument();
    expect(content).not.toHaveClass('pb-8');
  });

  it('상세 화면에서는 헤더를 고정하고 아래 콘텐츠만 스크롤한다', () => {
    const { container } = render(
      <MemoryRouter>
        <SpendingHistory containedScroll />
      </MemoryRouter>
    );

    const root = container.firstElementChild;
    const header = root?.querySelector('header');
    const scrollRegion = header?.nextElementSibling;

    expect(root).toHaveClass('min-h-0', 'overflow-hidden');
    expect(header).toHaveClass('shrink-0');
    expect(header).not.toHaveClass('sticky');
    expect(scrollRegion).toHaveClass('min-h-0', 'flex-1', 'overflow-y-auto');
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

  it('기록이 없으면 상단 안내 문구를 숨긴다', () => {
    mockedUseConsumptionsInfiniteQuery.mockReturnValue({
      ...createQueryResult('2026-08'),
      data: { pages: [{ data: { consumptions: [] } }] },
    } as unknown as ReturnType<typeof useConsumptionsInfiniteQuery>);

    render(
      <MemoryRouter>
        <SpendingHistory headerDescription="이번달 작성한 소비기록을 확인해보세요" />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: '아직 기록이 없어요' })).toBeInTheDocument();
    expect(screen.queryByText('이번달 작성한 소비기록을 확인해보세요')).not.toBeInTheDocument();
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
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
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
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
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
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
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

  it('이동할 날짜가 있으면 전체 기록을 유지하고 해당 날짜로 스크롤한다', () => {
    jest.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
      top: 500,
    } as DOMRect);
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 800,
    });

    renderSpendingHistory('2026-08-21');

    expect(screen.getByRole('heading', { level: 1, name: '8월 소비 내역' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '21일 금요일' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '22일 토요일' })).toBeInTheDocument();
    expect(screen.getAllByText('투썸플레이스')).toHaveLength(7);
    expect(scrollTo).toHaveBeenCalledWith({ behavior: 'smooth', top: 140 });

    const targetSection = screen.getByRole('heading', { name: '21일 금요일' }).closest('section');
    const otherSection = screen.getByRole('heading', { name: '22일 토요일' }).closest('section');

    expect(targetSection).toHaveAttribute('aria-current', 'date');
    expect(targetSection).toHaveClass('bg-primary-50', 'p-3');
    expect(otherSection).not.toHaveAttribute('aria-current');
    expect(otherSection).not.toHaveClass('bg-primary-50', 'p-3');
  });

  it('날짜 링크로 진입한 뒤 다른 월을 선택하면 다음 페이지를 불러온다', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
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
        <SpendingHistory scrollToDate="2026-07-01" />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { level: 1, name: '7월 소비 내역' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '21일 금요일' })).not.toBeInTheDocument();
  });

  it('최초 조회 가능 월이 갱신되어 선택 월이 범위 밖이면 최초 월로 이동한다', () => {
    mockUseFirstAvailableYearMonthQuery.mockReturnValue({ data: undefined });
    const { rerender } = renderSpendingHistory('2026-04-01');

    expect(screen.getByRole('heading', { level: 1, name: '4월 소비 내역' })).toBeInTheDocument();

    mockUseFirstAvailableYearMonthQuery.mockReturnValue({ data: { year: 2026, month: 5 } });
    rerender(
      <MemoryRouter>
        <SpendingHistory scrollToDate="2026-04-01" />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { level: 1, name: '5월 소비 내역' })).toBeInTheDocument();
    expect(mockedUseConsumptionsInfiniteQuery).toHaveBeenLastCalledWith('2026-05');
    expect(screen.getByRole('button', { name: '이전 달 보기' })).toBeDisabled();
  });

  it('월 선택 바텀시트에서 월을 바꾸고 시트를 닫는다', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
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
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
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
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
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
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
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
