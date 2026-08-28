import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { useFrequentPlacesInfiniteQuery } from '@/features/report/apis/hooks/useFrequentPlacesInfiniteQuery';

import FrequentShopSummary from './FrequentShopSummary';

jest.mock('@/features/report/apis/hooks/useFrequentPlacesInfiniteQuery');

const mockedUseFrequentPlacesInfiniteQuery = jest.mocked(useFrequentPlacesInfiniteQuery);

describe('FrequentShopSummary', () => {
  beforeEach(() => {
    mockedUseFrequentPlacesInfiniteQuery.mockReturnValue({
      data: {
        pages: [
          {
            data: {
              places: Array.from({ length: 8 }, (_, index) => ({
                rank: index + 1,
                placeId: index + 1,
                placeName: `투썸플레이스 ${index + 1}`,
                category: '카페',
                dongname: '용산구',
                visitCount: index === 0 ? 12 : 7,
              })),
              hasNext: false,
            },
          },
        ],
      },
      isPending: false,
      isError: false,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useFrequentPlacesInfiniteQuery>);
  });

  it('이번 달 방문 횟수 기준 상위 7개 가게를 보여준다', () => {
    render(
      <MemoryRouter>
        <FrequentShopSummary headerContent={<div>탭 영역</div>} />
      </MemoryRouter>
    );

    expect(screen.getByText('탭 영역')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '자주 소비한 곳' })).toBeInTheDocument();
    const description = screen.getByText('이번달 가장 많이 방문했어요!');
    expect(description).toBeInTheDocument();
    expect(description.closest('header')).toBeNull();
    expect(screen.getByLabelText('1위')).toBeInTheDocument();
    expect(screen.getByLabelText('7위')).toBeInTheDocument();
    expect(screen.queryByLabelText('8위')).not.toBeInTheDocument();
    expect(screen.getByLabelText('12회 방문')).toBeInTheDocument();
    expect(screen.getAllByText('용산구')).toHaveLength(7);
  });

  it('누적기록 버튼으로 단골 리스트에 이동한다', () => {
    render(
      <MemoryRouter>
        <FrequentShopSummary />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: '누적기록 보기' })).toHaveAttribute(
      'href',
      '/report/frequent-shops'
    );
  });

  it('가게를 선택하면 해당 장소 ID를 전달한다', async () => {
    const user = userEvent.setup();
    const onShopSelect = jest.fn();

    render(
      <MemoryRouter>
        <FrequentShopSummary onShopSelect={onShopSelect} />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: '투썸플레이스 1 지도에서 보기' }));

    expect(onShopSelect).toHaveBeenCalledWith(1);
  });

  it('기록이 없으면 안내 문구와 누적기록 버튼을 숨긴다', () => {
    mockedUseFrequentPlacesInfiniteQuery.mockReturnValue({
      data: { pages: [{ data: { places: [], hasNext: false } }] },
      isPending: false,
      isError: false,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useFrequentPlacesInfiniteQuery>);

    render(
      <MemoryRouter>
        <FrequentShopSummary />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: '아직 기록이 없어요' })).toBeInTheDocument();
    expect(screen.queryByText('이번달 가장 많이 방문했어요!')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: '누적기록 보기' })).not.toBeInTheDocument();
  });
});
