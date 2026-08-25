import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ShopSearch from './ShopSearch';

import type { PropsWithChildren } from 'react';

const searchByText = jest.fn();
let isLibraryLoaded = true;
let apiLoadingStatus = 'LOADED';

jest.mock('@vis.gl/react-google-maps', () => ({
  APILoadingStatus: {
    NOT_LOADED: 'NOT_LOADED',
    LOADING: 'LOADING',
    LOADED: 'LOADED',
    FAILED: 'FAILED',
    AUTH_FAILURE: 'AUTH_FAILURE',
  },
  useApiLoadingStatus: () => apiLoadingStatus,
  useMapsLibrary: () =>
    isLibraryLoaded
      ? { Place: { searchByText: (...args: unknown[]) => searchByText(...args) } }
      : null,
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
      location: { lat: () => 37.506481, lng: () => 127.024551 },
    },
  ],
};

describe('ShopSearch', () => {
  beforeEach(() => {
    searchByText.mockReset();
    searchByText.mockResolvedValue(searchResponse);
    isLibraryLoaded = true;
    apiLoadingStatus = 'LOADED';
  });

  it('검색어를 입력하고 제출하면 결과 목록을 보여준다', async () => {
    const user = userEvent.setup();
    renderShopSearch();

    await user.type(screen.getByPlaceholderText('장소를 검색해주세요'), '투썸플레이스');
    await user.click(screen.getByRole('button', { name: '검색' }));

    expect(await screen.findByText('투썸플레이스 신논현점')).toBeInTheDocument();
    expect(screen.getByText('서울특별시 강남구 봉은사로 125 1층')).toBeInTheDocument();
  });

  it('입력만 하고 제출하지 않아도 입력이 멈추면 잠시 후 자동으로 검색한다', async () => {
    const user = userEvent.setup();
    renderShopSearch();

    await user.type(screen.getByPlaceholderText('장소를 검색해주세요'), '투썸플레이스');

    expect(searchByText).not.toHaveBeenCalled();
    expect(await screen.findByText('투썸플레이스 신논현점')).toBeInTheDocument();
  });

  it('검색 결과가 없으면 안내 문구를 보여준다', async () => {
    searchByText.mockResolvedValue({ places: [] });
    const user = userEvent.setup();
    renderShopSearch();

    await user.type(screen.getByPlaceholderText('장소를 검색해주세요'), '없는 가게');
    await user.click(screen.getByRole('button', { name: '검색' }));

    expect(await screen.findByText('검색 결과가 없습니다')).toBeInTheDocument();
  });

  it('Places 라이브러리 로드 전에 제출하면 결과 없음 대신 로딩을 보여준다', async () => {
    isLibraryLoaded = false;
    const user = userEvent.setup();
    renderShopSearch();

    await user.type(screen.getByPlaceholderText('장소를 검색해주세요'), '투썸플레이스');
    await user.click(screen.getByRole('button', { name: '검색' }));

    expect(await screen.findByText('검색 중...')).toBeInTheDocument();
    expect(screen.queryByText('검색 결과가 없습니다')).not.toBeInTheDocument();
  });

  it('지도 API 로드에 실패하면 로딩 대신 실패 문구를 보여준다', async () => {
    isLibraryLoaded = false;
    apiLoadingStatus = 'FAILED';
    const user = userEvent.setup();
    renderShopSearch();

    await user.type(screen.getByPlaceholderText('장소를 검색해주세요'), '투썸플레이스');
    await user.click(screen.getByRole('button', { name: '검색' }));

    expect(await screen.findByText('검색에 실패했습니다')).toBeInTheDocument();
    expect(screen.queryByText('검색 중...')).not.toBeInTheDocument();
  });

  it('API 키 인증에 실패하면 실패 문구를 보여준다', async () => {
    isLibraryLoaded = false;
    apiLoadingStatus = 'AUTH_FAILURE';
    const user = userEvent.setup();
    renderShopSearch();

    await user.type(screen.getByPlaceholderText('장소를 검색해주세요'), '투썸플레이스');
    await user.click(screen.getByRole('button', { name: '검색' }));

    expect(await screen.findByText('검색에 실패했습니다')).toBeInTheDocument();
  });

  it('같은 검색어를 다시 제출하면 다시 요청한다', async () => {
    const user = userEvent.setup();
    renderShopSearch();

    await user.type(screen.getByPlaceholderText('장소를 검색해주세요'), '투썸플레이스');
    await user.click(screen.getByRole('button', { name: '검색' }));
    expect(await screen.findByText('투썸플레이스 신논현점')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '검색' }));

    await waitFor(() => {
      expect(searchByText).toHaveBeenCalledTimes(2);
    });
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
