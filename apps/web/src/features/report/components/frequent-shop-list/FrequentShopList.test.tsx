import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { GetFrequentPlacesPeriod } from '@/features/report/apis/dto';
import { useFrequentPlacesInfiniteQuery } from '@/features/report/apis/hooks/useFrequentPlacesInfiniteQuery';

import FrequentShopList from './FrequentShopList';

jest.mock('@/features/report/apis/hooks/useFrequentPlacesInfiniteQuery', () => ({
  useFrequentPlacesInfiniteQuery: jest.fn(),
}));

jest.mock('@/shared/assets/images/state', () => ({
  EmptyStateImage: 'img-empty.png',
  ErrorStateImage: 'img-error.png',
}));

const mockedUseFrequentPlacesInfiniteQuery = jest.mocked(useFrequentPlacesInfiniteQuery);
const fetchNextPage = jest.fn();
const refetch = jest.fn();

const THIS_MONTH_PLACES = [
  {
    rank: 1,
    placeId: 11,
    placeName: '투썸플레이스',
    category: '카페',
    dongname: '한강로동',
    visitCount: 12,
  },
  {
    rank: 2,
    placeId: 12,
    placeName: '아오이 카페',
    category: '카페',
    dongname: '연남동',
    visitCount: 8,
  },
  {
    rank: 3,
    placeId: 13,
    placeName: '차곡 커피',
    category: '카페',
    dongname: '망원동',
    visitCount: 7,
  },
];

const createQueryResult = (places = THIS_MONTH_PLACES, overrides: Record<string, unknown> = {}) =>
  ({
    data: { pages: [{ data: { places, hasNext: false } }], pageParams: [{}] },
    fetchNextPage,
    hasNextPage: false,
    isError: false,
    isFetchNextPageError: false,
    isFetchingNextPage: false,
    isPending: false,
    refetch,
    ...overrides,
  }) as unknown as ReturnType<typeof useFrequentPlacesInfiniteQuery>;

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
  beforeEach(() => {
    fetchNextPage.mockReset();
    refetch.mockReset();
    mockedUseFrequentPlacesInfiniteQuery.mockImplementation(({ category, period }) => {
      if (category?.includes('편의점/마트')) return createQueryResult([]);
      if (period === GetFrequentPlacesPeriod.ALL_TIME) {
        return createQueryResult([{ ...THIS_MONTH_PLACES[0], visitCount: 28 }]);
      }

      return createQueryResult();
    });
  });

  it('API 응답의 단골 가게 순위와 이번 달 방문 횟수를 보여준다', () => {
    renderFrequentShopList();

    expect(screen.getByRole('heading', { name: '단골 리스트' })).toBeInTheDocument();
    expect(screen.getByLabelText('1위')).toBeInTheDocument();
    expect(screen.getByLabelText('2위')).toBeInTheDocument();
    expect(screen.getByLabelText('3위')).toBeInTheDocument();
    expect(screen.getByLabelText('12회 방문')).toBeInTheDocument();
    expect(screen.getByText('한강로동')).toBeInTheDocument();
    expect(mockedUseFrequentPlacesInfiniteQuery).toHaveBeenCalledWith({
      category: undefined,
      period: GetFrequentPlacesPeriod.THIS_MONTH,
    });
  });

  it('첫 조회 중에는 목록 스켈레톤을 보여준다', () => {
    mockedUseFrequentPlacesInfiniteQuery.mockReturnValue(
      createQueryResult([], { data: undefined, isPending: true })
    );

    renderFrequentShopList();

    expect(screen.getByRole('status', { name: '단골 리스트 불러오는 중' })).toBeInTheDocument();
    expect(screen.queryByText('투썸플레이스')).not.toBeInTheDocument();
  });

  it('카테고리 칩을 선택하면 해당 카테고리로 다시 조회한다', async () => {
    const user = userEvent.setup();
    renderFrequentShopList();

    await user.click(screen.getByRole('button', { name: '편의점/마트' }));

    expect(mockedUseFrequentPlacesInfiniteQuery).toHaveBeenLastCalledWith({
      category: ['편의점/마트'],
      period: GetFrequentPlacesPeriod.THIS_MONTH,
    });
    expect(screen.getByRole('button', { name: '편의점/마트' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(screen.queryByLabelText('1위')).not.toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: '아직 기록이 없어요' })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '소비 기록 작성하기' })).toHaveAttribute(
      'href',
      '/record'
    );
  });

  it('기간 필터에서 전체를 선택하면 전체 기간으로 다시 조회한다', async () => {
    const user = userEvent.setup();
    renderFrequentShopList();

    await user.click(screen.getByRole('button', { name: '기간 필터' }));
    await user.click(screen.getByRole('button', { name: '전체' }));

    expect(mockedUseFrequentPlacesInfiniteQuery).toHaveBeenLastCalledWith({
      category: undefined,
      period: GetFrequentPlacesPeriod.ALL_TIME,
    });
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
