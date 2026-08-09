import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ShopSearch from './ShopSearch';

import type { PropsWithChildren } from 'react';

const searchByText = jest.fn();

jest.mock('@vis.gl/react-google-maps', () => ({
  useMapsLibrary: () => ({
    Place: { searchByText: (...args: unknown[]) => searchByText(...args) },
  }),
}));

const renderShopSearch = (onSelectShop = jest.fn()) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  render(<ShopSearch onSelectShop={onSelectShop} />, { wrapper: Wrapper });

  return { onSelectShop };
};

const searchResponse = {
  places: [
    {
      id: 'place-01',
      displayName: '투썸플레이스 신논현점',
      formattedAddress: '서울특별시 강남구 봉은사로 125 1층',
      photos: [],
    },
  ],
};

describe('ShopSearch', () => {
  beforeEach(() => {
    searchByText.mockReset();
    searchByText.mockResolvedValue(searchResponse);
  });

  it('검색어를 입력하고 제출하면 결과 목록을 보여준다', async () => {
    const user = userEvent.setup();
    renderShopSearch();

    await user.type(screen.getByPlaceholderText('장소를 검색해주세요'), '투썸플레이스');
    await user.click(screen.getByRole('button', { name: '검색' }));

    expect(await screen.findByText('투썸플레이스 신논현점')).toBeInTheDocument();
    expect(screen.getByText('서울특별시 강남구 봉은사로 125 1층')).toBeInTheDocument();
  });

  it('입력만 하고 제출하지 않으면 검색하지 않는다', async () => {
    const user = userEvent.setup();
    renderShopSearch();

    await user.type(screen.getByPlaceholderText('장소를 검색해주세요'), '투썸플레이스');

    expect(searchByText).not.toHaveBeenCalled();
  });

  it('검색 결과가 없으면 안내 문구를 보여준다', async () => {
    searchByText.mockResolvedValue({ places: [] });
    const user = userEvent.setup();
    renderShopSearch();

    await user.type(screen.getByPlaceholderText('장소를 검색해주세요'), '없는 가게');
    await user.click(screen.getByRole('button', { name: '검색' }));

    expect(await screen.findByText('검색 결과가 없습니다')).toBeInTheDocument();
  });

  it('결과를 선택하면 선택한 장소를 전달한다', async () => {
    const user = userEvent.setup();
    const { onSelectShop } = renderShopSearch();

    await user.type(screen.getByPlaceholderText('장소를 검색해주세요'), '투썸플레이스');
    await user.click(screen.getByRole('button', { name: '검색' }));
    await user.click(await screen.findByRole('button', { name: /투썸플레이스 신논현점/ }));

    expect(onSelectShop).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'place-01', name: '투썸플레이스 신논현점' })
    );
  });
});
