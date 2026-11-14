import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';

import type { ShopSearchResult } from '@/features/shop';

import ShopSearchPage from './ShopSearchPage';

const mockNotifyNative = jest.fn((_type: string, _payload: unknown) => false);

const selectedShop: ShopSearchResult = {
  id: 'place-01',
  name: '투썸플레이스 신논현점',
  address: '서울특별시 강남구 봉은사로 125 1층',
  photoUrl: null,
  latitude: 37.506481,
  longitude: 127.024551,
};

jest.mock('@/features/shop', () => ({
  ShopSearch: ({ onSelectShop }: { onSelectShop: (shop: ShopSearchResult) => void }) => (
    <button type="button" onClick={() => onSelectShop(selectedShop)}>
      목업 장소 선택
    </button>
  ),
}));

jest.mock('@/shared/lib/bridge', () => ({
  notifyNative: (type: string, payload: unknown) => mockNotifyNative(type, payload),
}));

function RecordTarget() {
  const location = useLocation();
  const state = location.state as { shop: ShopSearchResult };
  return (
    <p>
      기록 대상: {state.shop.name} {location.search}
    </p>
  );
}

describe('<ShopSearchPage />', () => {
  beforeEach(() => {
    mockNotifyNative.mockReset();
    mockNotifyNative.mockReturnValue(false);
  });

  it('장소를 선택하면 선택 정보를 가지고 기록 시작 화면으로 이동한다', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/record/shop/search']}>
        <Routes>
          <Route path="/record/shop/search" element={<ShopSearchPage />} />
          <Route path="/record" element={<RecordTarget />} />
        </Routes>
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: '목업 장소 선택' }));

    expect(screen.getByText(`기록 대상: ${selectedShop.name}`)).toBeInTheDocument();
  });

  it('지난달 기록 진입이면 장소 선택 후에도 선택한 연월을 유지한다', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/record/shop/search?yearMonth=2026-07']}>
        <Routes>
          <Route path="/record/shop/search" element={<ShopSearchPage />} />
          <Route path="/record" element={<RecordTarget />} />
        </Routes>
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: '목업 장소 선택' }));

    expect(
      screen.getByText(`기록 대상: ${selectedShop.name} ?yearMonth=2026-07`)
    ).toBeInTheDocument();
  });

  it('일반적으로 진입했다면 뒤로 가기 버튼을 누르면 이전 화면으로 돌아간다', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/record', '/record/shop/search']} initialIndex={1}>
        <Routes>
          <Route path="/record/shop/search" element={<ShopSearchPage />} />
          <Route path="/record" element={<p>기록 방법 선택 화면</p>} />
        </Routes>
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: '뒤로 가기' }));

    expect(screen.getByText('기록 방법 선택 화면')).toBeInTheDocument();
  });

  it('앱 영수증 플로우에서 장소를 선택하면 네이티브에 검색 결과를 전달한다', async () => {
    mockNotifyNative.mockReturnValue(true);
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/record/shop/search?source=receipt-native']}>
        <Routes>
          <Route path="/record/shop/search" element={<ShopSearchPage />} />
          <Route path="/record" element={<RecordTarget />} />
        </Routes>
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: '목업 장소 선택' }));

    expect(mockNotifyNative).toHaveBeenCalledWith('receiptShopSelected', {
      shop: selectedShop,
    });
    expect(screen.queryByText(`기록 대상: ${selectedShop.name}`)).not.toBeInTheDocument();
  });

  it('앱 영수증 플로우에서 뒤로 가기를 누르면 네이티브에 취소를 전달한다', async () => {
    mockNotifyNative.mockReturnValue(true);
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/record/shop/search?source=receipt-native']}>
        <Routes>
          <Route path="/record/shop/search" element={<ShopSearchPage />} />
        </Routes>
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: '뒤로 가기' }));

    expect(mockNotifyNative).toHaveBeenCalledWith('receiptShopSearchCancelled', {});
  });

  it('작성 중인 초안이 없는 검색 화면은 확인 없이 홈으로 이동한다', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/record/shop/search']}>
        <Routes>
          <Route path="/record/shop/search" element={<ShopSearchPage />} />
          <Route path="/home" element={<p>홈 화면</p>} />
        </Routes>
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: '기록 닫고 홈으로 이동' }));

    expect(screen.getByText('홈 화면')).toBeInTheDocument();
  });

  it('앱 영수증 플로우에서 X 버튼을 누르면 네이티브에 기록 종료를 요청한다', async () => {
    mockNotifyNative.mockReturnValue(true);
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/record/shop/search?source=receipt-native']}>
        <Routes>
          <Route path="/record/shop/search" element={<ShopSearchPage />} />
        </Routes>
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: '기록 닫고 홈으로 이동' }));
    await user.click(screen.getByRole('button', { name: '나가기' }));

    expect(mockNotifyNative).toHaveBeenCalledWith('receiptRecordCloseRequested', {});
  });
});
