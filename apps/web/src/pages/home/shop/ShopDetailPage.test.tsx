import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';

import {
  useHomeBottomSheetStore,
  useMapFocusStore,
  useVisitedPlaceStickersQuery,
} from '@/features/map';
import { TEST_MAP_STICKERS } from '@/features/map/testFixtures';
import SpendingRecordItem from '@/features/report/components/spending-history/SpendingRecordItem';
import RouteHistoryProvider from '@/shared/lib/route-history';
import type { ConsumptionActions } from '@/shared/types/consumptionActions';

import ShopDetailPage from './ShopDetailPage';

import type { ReactNode } from 'react';

const mockEditRecord = jest.fn();
const mockDeleteRecord = jest.fn();
jest.mock('@/features/record/apis/hooks/useConsumptionReturnTarget', () => ({
  useConsumptionReturnTarget: ({
    consumptionId,
    fallbackDate,
  }: {
    consumptionId?: number;
    fallbackDate?: string;
  }) => ({
    isRestoreTargetPending: false,
    scrollToConsumptionId: consumptionId,
    scrollToDate: fallbackDate,
  }),
}));
jest.mock('@/features/record/components/ConsumptionRecordActions', () => ({
  __esModule: true,
  default: ({ children }: { children: (actions: ConsumptionActions) => ReactNode }) =>
    children({ onEditRecord: mockEditRecord, onDeleteRecord: mockDeleteRecord }),
}));
jest.mock('@/features/record/components/ConsumptionSticker', () => ({
  __esModule: true,
  default: ({ consumptionId }: { consumptionId: number }) => (
    <span>방문 스티커 {consumptionId}</span>
  ),
}));
jest.mock('@/features/shop', () => ({
  ShopDetail: ({
    headerContent,
    onViewOnMap,
    recordShop,
    onEditRecord,
    onDeleteRecord,
    renderVisitSticker,
    scrollToDate,
    scrollToConsumptionId,
  }: {
    headerContent: ReactNode;
    onViewOnMap: () => void;
    recordShop?: { id: string };
    renderVisitSticker?: (id: number) => ReactNode;
    scrollToDate?: string;
    scrollToConsumptionId?: number;
  } & ConsumptionActions) => (
    <>
      {headerContent}
      <p>{recordShop ? `기록 가게 ${recordShop.id}` : '기록 가게 없음'}</p>
      <button onClick={() => onEditRecord?.(196, '2026-11-01')}>방문 기록 수정</button>
      <button onClick={() => onDeleteRecord?.(196)}>방문 기록 삭제</button>
      {renderVisitSticker?.(196)}
      <p>
        {scrollToDate}:{scrollToConsumptionId}
      </p>
      <button type="button" onClick={onViewOnMap}>
        지도에서 가게 보기
      </button>
    </>
  ),
}));
jest.mock('@/features/map/apis/hooks/useVisitedPlaceStickersQuery');

const mockedUseVisitedPlaceStickersQuery = jest.mocked(useVisitedPlaceStickersQuery);

function ConsumptionListProbe() {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <>
      <p>
        소비 목록 {location.pathname}
        {location.search}:{location.state?.scrollToDate}:{location.state?.scrollToConsumptionId}
      </p>
      <button onClick={() => navigate(1)}>상세 앞으로</button>
      <ul>
        <SpendingRecordItem
          consumption={{
            id: 196,
            placeId: 101,
            placeName: '복귀 가게',
            purchaseDate: '2026-07-21',
          }}
          renderRecordSticker={() => null}
        />
      </ul>
    </>
  );
}

describe('ShopDetailPage', () => {
  it.each(['/home', '/report/history'])(
    '%s 소비 기록에서 진입하면 가게 시트를 선택하지 않고 원래 목록 이력으로 돌아간다',
    async (pathname) => {
      const user = userEvent.setup();
      useHomeBottomSheetStore.setState({
        tab: 'history',
        scrollPositions: { history: 240, frequentShops: 0 },
      });
      render(
        <MemoryRouter initialEntries={[`${pathname}?filter=keep`]}>
          <RouteHistoryProvider>
            <Routes>
              <Route path={pathname} element={<ConsumptionListProbe />} />
              <Route path="/home/shop/:shopId" element={<ShopDetailPage />} />
            </Routes>
          </RouteHistoryProvider>
        </MemoryRouter>
      );
      await user.click(screen.getByRole('link', { name: /복귀 가게/ }));
      await user.click(screen.getByRole('button', { name: '뒤로 가기' }));
      expect(
        await screen.findByText(`소비 목록 ${pathname}?filter=keep:2026-07-21:196`)
      ).toBeInTheDocument();
      expect(useHomeBottomSheetStore.getState().activeSheet).toEqual({ type: 'home' });
      expect(useHomeBottomSheetStore.getState().tab).toBe('history');
      expect(useHomeBottomSheetStore.getState().scrollPositions.history).toBe(240);
      expect(useMapFocusStore.getState().focusPosition).toBeNull();
      await user.click(screen.getByRole('button', { name: '상세 앞으로' }));
      expect(screen.getByRole('button', { name: '뒤로 가기' })).toBeInTheDocument();
    }
  );

  it('수정·삭제 액션과 방문별 스티커, 복귀 대상을 매장 상세에 전달한다', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: '/home/shop/101',
            state: { scrollToDate: '2026-11-01', scrollToConsumptionId: 196 },
          },
        ]}
      >
        <Routes>
          <Route path="/home/shop/:shopId" element={<ShopDetailPage />} />
        </Routes>
      </MemoryRouter>
    );
    await user.click(screen.getByRole('button', { name: '방문 기록 수정' }));
    await user.click(screen.getByRole('button', { name: '방문 기록 삭제' }));
    expect(mockEditRecord).toHaveBeenCalledWith(196, '2026-11-01');
    expect(mockDeleteRecord).toHaveBeenCalledWith(196);
    expect(screen.getByText('방문 스티커 196')).toBeInTheDocument();
    expect(screen.getByText('2026-11-01:196')).toBeInTheDocument();
  });
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
