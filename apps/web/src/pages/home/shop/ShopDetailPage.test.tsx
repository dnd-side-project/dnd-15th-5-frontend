import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import {
  useHomeBottomSheetStore,
  useMapFocusStore,
  useVisitedPlaceStickersQuery,
} from '@/features/map';
import { TEST_MAP_STICKERS } from '@/features/map/testFixtures';

import ShopDetailPage from './ShopDetailPage';

import type { ReactNode } from 'react';

jest.mock('@/features/shop', () => ({
  ShopDetail: ({
    headerContent,
    onViewOnMap,
  }: {
    headerContent: ReactNode;
    onViewOnMap: () => void;
  }) => (
    <>
      {headerContent}
      <button type="button" onClick={onViewOnMap}>
        지도에서 가게 보기
      </button>
    </>
  ),
}));
jest.mock('@/features/map/apis/hooks/useVisitedPlaceStickersQuery');

const mockedUseVisitedPlaceStickersQuery = jest.mocked(useVisitedPlaceStickersQuery);

describe('ShopDetailPage', () => {
  beforeEach(() => {
    window.history.replaceState({ idx: 0 }, '', '/');
    useHomeBottomSheetStore.setState({ activeSheet: { type: 'home' }, stepIndex: 0 });
    useMapFocusStore.setState({ focusPosition: null, focusZoom: undefined });
    mockedUseVisitedPlaceStickersQuery.mockReturnValue({
      stickers: TEST_MAP_STICKERS,
      refetchStickers: jest.fn().mockResolvedValue(TEST_MAP_STICKERS),
    } as unknown as ReturnType<typeof useVisitedPlaceStickersQuery>);
  });

  it('직접 진입해 마커 캐시가 비어 있어도 다시 조회한 좌표로 지도에 포커스한다', async () => {
    const user = userEvent.setup();
    const sticker = TEST_MAP_STICKERS[0]!;
    mockedUseVisitedPlaceStickersQuery.mockReturnValue({
      stickers: [],
      refetchStickers: jest.fn().mockResolvedValue([sticker]),
    } as unknown as ReturnType<typeof useVisitedPlaceStickersQuery>);
    render(
      <MemoryRouter initialEntries={[`/home/shop/${sticker.place.id}`]}>
        <Routes>
          <Route path="/home/shop/:shopId" element={<ShopDetailPage />} />
          <Route path="/home" element={<p>지도 홈</p>} />
        </Routes>
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: '지도에서 가게 보기' }));

    expect(await screen.findByText('지도 홈')).toBeInTheDocument();
    expect(useMapFocusStore.getState().focusPosition).toEqual(sticker.position);
    expect(useMapFocusStore.getState().focusZoom).toBe(16);
  });

  it('지도 버튼을 누르면 해당 가게 스티커와 좌표를 선택하고 지도 홈으로 이동한다', async () => {
    const user = userEvent.setup();
    const sticker = TEST_MAP_STICKERS[0]!;
    render(
      <MemoryRouter initialEntries={[`/home/shop/${sticker.place.id}`]}>
        <Routes>
          <Route path="/home/shop/:shopId" element={<ShopDetailPage />} />
          <Route path="/home" element={<p>지도 홈</p>} />
        </Routes>
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: '지도에서 가게 보기' }));

    expect(screen.getByText('지도 홈')).toBeInTheDocument();
    expect(useHomeBottomSheetStore.getState().activeSheet).toEqual({
      type: 'selectedPlace',
      stickerId: sticker.id,
    });
    expect(useMapFocusStore.getState().focusPosition).toEqual(sticker.position);
    expect(useMapFocusStore.getState().focusZoom).toBe(16);
  });

  it('마커 재조회가 실패해도 요청한 가게의 상세 바텀시트는 연다', async () => {
    const user = userEvent.setup();
    mockedUseVisitedPlaceStickersQuery.mockReturnValue({
      stickers: [],
      refetchStickers: jest.fn().mockRejectedValue(new Error('network error')),
    } as unknown as ReturnType<typeof useVisitedPlaceStickersQuery>);
    render(
      <MemoryRouter initialEntries={['/home/shop/999']}>
        <Routes>
          <Route path="/home/shop/:shopId" element={<ShopDetailPage />} />
          <Route path="/home" element={<p>지도 홈</p>} />
        </Routes>
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: '지도에서 가게 보기' }));

    expect(await screen.findByText('지도 홈')).toBeInTheDocument();
    expect(useHomeBottomSheetStore.getState().activeSheet).toEqual({
      type: 'selectedPlace',
      stickerId: '999',
    });
    expect(useMapFocusStore.getState().focusPosition).toBeNull();
  });

  it('직접 진입한 상세 화면에서 뒤로가기를 누르면 지도 홈으로 이동한다', async () => {
    const user = userEvent.setup();
    const sticker = TEST_MAP_STICKERS[0]!;
    render(
      <MemoryRouter initialEntries={[`/home/shop/${sticker.place.id}`]}>
        <Routes>
          <Route path="/home/shop/:shopId" element={<ShopDetailPage />} />
          <Route path="/home" element={<p>지도 홈</p>} />
        </Routes>
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: '뒤로 가기' }));

    expect(screen.getByText('지도 홈')).toBeInTheDocument();
  });
});
