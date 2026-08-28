import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useVisitedPlaceSearchInfiniteQuery } from '@/features/shop/apis/hooks/useVisitedPlaceSearchInfiniteQuery';

import VisitedPlaceSearch from './VisitedPlaceSearch';

jest.mock('@/features/shop/apis/hooks/useVisitedPlaceSearchInfiniteQuery');

const mockedUseVisitedPlaceSearchInfiniteQuery = jest.mocked(useVisitedPlaceSearchInfiniteQuery);

describe('VisitedPlaceSearch', () => {
  beforeEach(() => {
    window.localStorage.clear();
    mockedUseVisitedPlaceSearchInfiniteQuery.mockImplementation(
      (keyword) =>
        ({
          data: keyword.trim()
            ? {
                pages: [
                  {
                    data: {
                      places: [
                        {
                          placeId: 101,
                          placeName: '투썸플레이스',
                          roadAddress: '서울특별시 강남구 봉은사로 125 1층',
                          thumbnailUrl: null,
                        },
                      ],
                      hasNext: false,
                    },
                  },
                ],
              }
            : undefined,
          isPending: false,
          isError: false,
          hasNextPage: false,
          isFetchingNextPage: false,
          fetchNextPage: jest.fn(),
        }) as unknown as ReturnType<typeof useVisitedPlaceSearchInfiniteQuery>
    );
  });

  it('서버 검색 결과를 공통 장소 카드로 표시하고 장소 ID를 전달한다', async () => {
    const user = userEvent.setup();
    const onSelectPlace = jest.fn();
    render(<VisitedPlaceSearch onSelectPlace={onSelectPlace} />);

    await user.type(screen.getByPlaceholderText('검색어를 입력해주세요'), '투썸');
    await user.click(screen.getByRole('button', { name: '검색' }));

    expect(screen.getByText('서울특별시 강남구 봉은사로 125 1층')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /투썸플레이스/ }));
    expect(onSelectPlace).toHaveBeenCalledWith('101');
  });

  it('다음 페이지 요청만 실패하면 기존 결과를 유지하고 재시도한다', async () => {
    const user = userEvent.setup();
    const fetchNextPage = jest.fn();
    mockedUseVisitedPlaceSearchInfiniteQuery.mockReturnValue({
      data: {
        pages: [
          {
            data: {
              places: [
                {
                  placeId: 101,
                  placeName: '투썸플레이스',
                  roadAddress: '서울특별시 강남구 봉은사로 125 1층',
                },
              ],
            },
          },
        ],
      },
      isPending: false,
      isError: true,
      hasNextPage: true,
      isFetchingNextPage: false,
      isFetchNextPageError: true,
      fetchNextPage,
    } as unknown as ReturnType<typeof useVisitedPlaceSearchInfiniteQuery>);
    render(<VisitedPlaceSearch onSelectPlace={jest.fn()} />);

    await user.type(screen.getByPlaceholderText('검색어를 입력해주세요'), '투썸');
    await user.click(screen.getByRole('button', { name: '검색' }));

    expect(screen.getByText('투썸플레이스')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '다시 불러오기' }));
    expect(fetchNextPage).toHaveBeenCalledTimes(1);
  });

  it('검색 결과에서 매장을 선택하면 검색어가 최근 검색어로 저장된다', async () => {
    const user = userEvent.setup();
    render(<VisitedPlaceSearch onSelectPlace={jest.fn()} />);

    const input = screen.getByPlaceholderText('검색어를 입력해주세요');
    await user.type(input, '투썸');
    await user.click(screen.getByRole('button', { name: '검색' }));
    await user.click(screen.getByRole('button', { name: /투썸플레이스/ }));
    await user.clear(input);
    await user.click(screen.getByRole('button', { name: '검색' }));

    expect(screen.getByText('최근 검색어')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '투썸' })).toBeInTheDocument();
  });

  it('매장을 선택하지 않고 검색만 하면 최근 검색어로 저장하지 않는다', async () => {
    const user = userEvent.setup();
    render(<VisitedPlaceSearch onSelectPlace={jest.fn()} />);

    const input = screen.getByPlaceholderText('검색어를 입력해주세요');
    await user.type(input, '투썸');
    await user.click(screen.getByRole('button', { name: '검색' }));
    await user.clear(input);
    await user.click(screen.getByRole('button', { name: '검색' }));

    expect(screen.queryByText('최근 검색어')).not.toBeInTheDocument();
  });

  it('최근 검색어를 클릭하면 해당 검색어로 다시 검색한다', async () => {
    const user = userEvent.setup();
    render(<VisitedPlaceSearch onSelectPlace={jest.fn()} />);

    const input = screen.getByPlaceholderText('검색어를 입력해주세요');
    await user.type(input, '투썸');
    await user.click(screen.getByRole('button', { name: '검색' }));
    await user.click(screen.getByRole('button', { name: /투썸플레이스/ }));
    await user.clear(input);
    await user.click(screen.getByRole('button', { name: '검색' }));

    await user.click(screen.getByRole('button', { name: '투썸' }));

    expect(input).toHaveValue('투썸');
    expect(screen.getByText('서울특별시 강남구 봉은사로 125 1층')).toBeInTheDocument();
  });

  it('최근 검색어를 삭제할 수 있다', async () => {
    const user = userEvent.setup();
    render(<VisitedPlaceSearch onSelectPlace={jest.fn()} />);

    const input = screen.getByPlaceholderText('검색어를 입력해주세요');
    await user.type(input, '투썸');
    await user.click(screen.getByRole('button', { name: '검색' }));
    await user.click(screen.getByRole('button', { name: /투썸플레이스/ }));
    await user.clear(input);
    await user.click(screen.getByRole('button', { name: '검색' }));

    await user.click(screen.getByRole('button', { name: '투썸 최근 검색어 삭제' }));

    expect(screen.queryByText('최근 검색어')).not.toBeInTheDocument();
  });
});
