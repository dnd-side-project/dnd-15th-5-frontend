import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import {
  useHomeBottomSheetStore,
  useMapFocusStore,
  useVisitedPlaceStickersQuery,
} from '@/features/map';
import { TEST_MAP_STICKERS } from '@/features/map/testFixtures';

import MapSearchPage from './MapSearchPage';

jest.mock('@/features/map/apis/hooks/useVisitedPlaceStickersQuery');
jest.mock('@/features/shop', () => ({
  VisitedPlaceSearch: ({ onSelectPlace }: { onSelectPlace: (placeId: string) => void }) => (
    <button type="button" onClick={() => onSelectPlace('101')}>
      투썸플레이스 선택
    </button>
  ),
}));

const mockedUseVisitedPlaceStickersQuery = jest.mocked(useVisitedPlaceStickersQuery);

describe('MapSearchPage', () => {
  beforeEach(() => {
    useHomeBottomSheetStore.setState({ activeSheet: { type: 'home' } });
    useMapFocusStore.setState({ focusPosition: null, focusZoom: undefined });
  });

  it('검색 장소를 최신 방문 마커와 연결해 지도 포커스와 상세 시트를 연다', async () => {
    const user = userEvent.setup();
    const sticker = TEST_MAP_STICKERS[0]!;
    mockedUseVisitedPlaceStickersQuery.mockReturnValue({
      stickers: [],
      refetchStickers: jest.fn().mockResolvedValue([sticker]),
    } as unknown as ReturnType<typeof useVisitedPlaceStickersQuery>);

    render(
      <MemoryRouter initialEntries={['/home/search']}>
        <Routes>
          <Route path="/home/search" element={<MapSearchPage />} />
          <Route path="/home" element={<p>지도 홈</p>} />
        </Routes>
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: '투썸플레이스 선택' }));

    expect(await screen.findByText('지도 홈')).toBeInTheDocument();
    expect(useMapFocusStore.getState().focusPosition).toEqual(sticker.position);
    expect(useHomeBottomSheetStore.getState().activeSheet).toEqual({
      type: 'selectedPlace',
      stickerId: sticker.id,
    });
  });
});
