import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { MOCK_MAP_STICKERS, useHomeBottomSheetStore, useMapFocusStore } from '@/features/map';

import ShopDetailPage from './ShopDetailPage';

import type { ReactNode } from 'react';

jest.mock('@/features/shop', () => ({
  createMockShopDetailData: jest.fn(() => ({})),
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

describe('ShopDetailPage', () => {
  beforeEach(() => {
    window.history.replaceState({ idx: 0 }, '', '/');
    useHomeBottomSheetStore.setState({ activeSheet: { type: 'home' }, stepIndex: 0 });
    useMapFocusStore.setState({ focusPosition: null, focusZoom: undefined });
  });

  it('지도 버튼을 누르면 해당 가게 스티커와 좌표를 선택하고 지도 홈으로 이동한다', async () => {
    const user = userEvent.setup();
    const sticker = MOCK_MAP_STICKERS[0];
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

  it('직접 진입한 상세 화면에서 뒤로가기를 누르면 지도 홈으로 이동한다', async () => {
    const user = userEvent.setup();
    const sticker = MOCK_MAP_STICKERS[0];
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
