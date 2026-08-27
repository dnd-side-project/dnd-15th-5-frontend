import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import {
  useHomeBottomSheetStore,
  useMapFocusStore,
  useVisitedPlaceStickersQuery,
} from '@/features/map';
import { TEST_MAP_STICKERS } from '@/features/map/testFixtures';
import { useToast } from '@/shared/ui/toast';

import HomePage from './HomePage';

jest.mock('@/features/map', () => ({
  ...jest.requireActual('@/features/map'),
  GoogleMapView: () => null,
  HomeMapOverlay: () => null,
  HomeBottomSheet: () => null,
}));
jest.mock('@/features/map/apis/hooks/useVisitedPlaceStickersQuery');
jest.mock('@/features/report', () => ({
  FrequentShopSummary: () => null,
  SpendingHistory: () => null,
}));
jest.mock('@/features/shop', () => ({
  SelectedPlaceSheet: () => null,
}));
jest.mock('@/shared/ui/toast', () => ({ useToast: jest.fn() }));

const mockedUseVisitedPlaceStickersQuery = jest.mocked(useVisitedPlaceStickersQuery);
const mockedUseToast = jest.mocked(useToast);
const mockShowToast = jest.fn().mockReturnValue('toast-1');

const renderHomePage = (createdPlace?: {
  placeName: string;
  latitude: number;
  longitude: number;
}) =>
  render(
    <MemoryRouter
      initialEntries={[{ pathname: '/home', state: createdPlace ? { createdPlace } : null }]}
    >
      <HomePage />
    </MemoryRouter>
  );

describe('<HomePage />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockShowToast.mockReturnValue('toast-1');
    useHomeBottomSheetStore.setState({ activeSheet: { type: 'home' }, stepIndex: 0 });
    useMapFocusStore.setState({ focusPosition: null, focusZoom: undefined });
    mockedUseToast.mockReturnValue({
      showToast: mockShowToast,
      closeToast: jest.fn(),
    });
    mockedUseVisitedPlaceStickersQuery.mockReturnValue({
      stickers: TEST_MAP_STICKERS,
      refetchStickers: jest.fn().mockResolvedValue(TEST_MAP_STICKERS),
    } as unknown as ReturnType<typeof useVisitedPlaceStickersQuery>);
  });

  it('방금 등록한 장소가 첫 방문이면 지도에 포커스하고 첫 방문 안내 Toast를 바텀시트 위에 띄운다', async () => {
    const firstVisitSticker = TEST_MAP_STICKERS[1]!;
    renderHomePage({
      placeName: firstVisitSticker.place.name,
      latitude: firstVisitSticker.position.lat,
      longitude: firstVisitSticker.position.lng,
    });

    await waitFor(() =>
      expect(mockShowToast).toHaveBeenCalledWith({
        type: 'success',
        message: '첫번째 방문기록이 생성되었어요!',
        placement: 'above-bottom-sheet',
      })
    );
    expect(useMapFocusStore.getState().focusPosition).toEqual(firstVisitSticker.position);
    expect(useHomeBottomSheetStore.getState().activeSheet).toEqual({
      type: 'selectedPlace',
      stickerId: firstVisitSticker.id,
    });
  });

  it('기존 마커 캐시에 없어도 저장 직후 다시 조회한 장소로 상세 시트를 연다', async () => {
    const firstVisitSticker = TEST_MAP_STICKERS[1]!;
    mockedUseVisitedPlaceStickersQuery.mockReturnValue({
      stickers: [],
      refetchStickers: jest.fn().mockResolvedValue([firstVisitSticker]),
    } as unknown as ReturnType<typeof useVisitedPlaceStickersQuery>);

    renderHomePage({
      placeName: firstVisitSticker.place.name,
      latitude: firstVisitSticker.position.lat,
      longitude: firstVisitSticker.position.lng,
    });

    await waitFor(() =>
      expect(useHomeBottomSheetStore.getState().activeSheet).toEqual({
        type: 'selectedPlace',
        stickerId: firstVisitSticker.id,
      })
    );
    expect(mockShowToast).toHaveBeenCalledWith({
      type: 'success',
      message: '첫번째 방문기록이 생성되었어요!',
      placement: 'above-bottom-sheet',
    });
  });

  it('방금 등록한 장소가 재방문이면 재방문 안내 Toast를 띄운다', async () => {
    const repeatVisitSticker = TEST_MAP_STICKERS[0]!;
    renderHomePage({
      placeName: repeatVisitSticker.place.name,
      latitude: repeatVisitSticker.position.lat,
      longitude: repeatVisitSticker.position.lng,
    });

    await waitFor(() =>
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({ message: '방문기록이 등록되었어요' })
      )
    );
  });

  it('앱 WebView 전체 이동으로 도착해 쿼리 문자열에 장소 정보가 실려 있어도 매칭한다', async () => {
    const firstVisitSticker = TEST_MAP_STICKERS[1]!;
    const params = new URLSearchParams({
      createdPlaceName: firstVisitSticker.place.name,
      createdPlaceLat: String(firstVisitSticker.position.lat),
      createdPlaceLng: String(firstVisitSticker.position.lng),
    });
    render(
      <MemoryRouter initialEntries={[`/home?${params.toString()}`]}>
        <HomePage />
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({ message: '첫번째 방문기록이 생성되었어요!' })
      )
    );
    expect(useHomeBottomSheetStore.getState().activeSheet).toEqual({
      type: 'selectedPlace',
      stickerId: firstVisitSticker.id,
    });
  });

  it('일치하는 장소를 찾지 못해도 등록 완료 Toast로 안내한다', async () => {
    renderHomePage({ placeName: '알 수 없는 가게', latitude: 0, longitude: 0 });

    await waitFor(() =>
      expect(mockShowToast).toHaveBeenCalledWith({
        type: 'success',
        message: '방문기록이 등록되었어요',
      })
    );
  });

  it('전달받은 장소 정보가 없으면 아무 안내도 하지 않는다', () => {
    renderHomePage();

    expect(mockShowToast).not.toHaveBeenCalled();
    expect(useHomeBottomSheetStore.getState().activeSheet).toEqual({ type: 'home' });
  });
});
