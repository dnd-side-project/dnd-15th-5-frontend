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
    recordShop,
  }: {
    headerContent: ReactNode;
    onViewOnMap: () => void;
    recordShop?: { id: string };
  }) => (
    <>
      {headerContent}
      <p>{recordShop ? `기록 가게 ${recordShop.id}` : '기록 가게 없음'}</p>
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

  it('상세 경로의 매장과 일치하는 지도 마커를 소비 기록용 가게로 전달한다', () => {
    const sticker = TEST_MAP_STICKERS[0]!;
    render(
      <MemoryRouter initialEntries={[`/home/shop/${sticker.place.id}`]}>
        <Routes>
          <Route path="/home/shop/:shopId" element={<ShopDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(`기록 가게 ${sticker.googlePlaceId}`)).toBeInTheDocument();
  });

  it.each([true, false])(
    '지도 시트 진입 여부가 %s일 때만 등장 효과를 실행하고 정리한다',
    (fromMapSheet) => {
      const originalAnimate = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'animate');
      const animation = { cancel: jest.fn() } as unknown as Animation;
      const animate = jest.fn(() => animation);
      Object.defineProperty(HTMLElement.prototype, 'animate', {
        configurable: true,
        value: animate,
      });
      try {
        const { unmount } = render(
          <MemoryRouter initialEntries={[{ pathname: '/home/shop/101', state: { fromMapSheet } }]}>
            <Routes>
              <Route path="/home/shop/:shopId" element={<ShopDetailPage />} />
            </Routes>
          </MemoryRouter>
        );

        expect(animate).toHaveBeenCalledTimes(fromMapSheet ? 1 : 0);
        if (fromMapSheet) {
          expect(animate).toHaveBeenCalledWith(
            [
              { opacity: 0, transform: 'translateY(8px)' },
              { opacity: 1, transform: 'none' },
            ],
            expect.objectContaining({ duration: 160 })
          );
        }
        unmount();
        expect(animation.cancel).toHaveBeenCalledTimes(fromMapSheet ? 1 : 0);
      } finally {
        if (originalAnimate)
          Object.defineProperty(HTMLElement.prototype, 'animate', originalAnimate);
        else Reflect.deleteProperty(HTMLElement.prototype, 'animate');
      }
    }
  );

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

  it('직접 진입한 상세 화면에서 뒤로가기를 누르면 이 가게로 지도 포커스를 맞추고 지도 홈으로 이동한다', async () => {
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

    expect(await screen.findByText('지도 홈')).toBeInTheDocument();
    expect(useHomeBottomSheetStore.getState().activeSheet).toEqual({
      type: 'selectedPlace',
      stickerId: sticker.id,
    });
    expect(useMapFocusStore.getState().focusPosition).toEqual(sticker.position);
  });
});
