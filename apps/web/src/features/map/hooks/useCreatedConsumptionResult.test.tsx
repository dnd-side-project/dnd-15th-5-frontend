import { act, renderHook } from '@testing-library/react';

import { useVisitedPlaceStickersQuery } from '@/features/map/apis/hooks/useVisitedPlaceStickersQuery';
import { useHomeBottomSheetStore } from '@/features/map/stores/homeBottomSheetStore';
import { TEST_MAP_STICKERS } from '@/features/map/testFixtures';
import type { MapSticker } from '@/features/map/types';
import { useToast } from '@/shared/ui/toast';

import { useCreatedConsumptionResult } from './useCreatedConsumptionResult';

jest.mock('@/features/map/apis/hooks/useVisitedPlaceStickersQuery');
jest.mock('@/shared/ui/toast', () => ({ useToast: jest.fn() }));
jest.mock('@/shared/lib/analytics/mixpanel', () => ({
  ANALYTICS_EVENTS: {},
  trackAnalyticsEvent: jest.fn(),
  trackUtTaskCompleted: jest.fn(),
}));

const firstVisitSticker = TEST_MAP_STICKERS[1]!;
const createdPlace = {
  placeName: firstVisitSticker.place.name,
  latitude: firstVisitSticker.position.lat,
  longitude: firstVisitSticker.position.lng,
};
const showToast = jest.fn();
const onHandled = jest.fn();
const refetchStickers = jest.fn();
const mockedUseVisitedPlaceStickersQuery = jest.mocked(useVisitedPlaceStickersQuery);

const setCachedStickers = (stickers: readonly MapSticker[]) => {
  mockedUseVisitedPlaceStickersQuery.mockReturnValue({
    stickers,
    refetchStickers,
  } as unknown as ReturnType<typeof useVisitedPlaceStickersQuery>);
};

describe('useCreatedConsumptionResult', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useHomeBottomSheetStore.setState({ activeSheet: { type: 'home' } });
    jest.mocked(useToast).mockReturnValue({ showToast, closeToast: jest.fn() });
    setCachedStickers([]);
  });

  it('재조회 중 캐시와 동일한 장소 객체가 갱신되어도 완료 처리를 다시 시작하지 않는다', async () => {
    let finish!: (stickers: readonly MapSticker[]) => void;
    refetchStickers.mockImplementation(
      () => new Promise<readonly MapSticker[]>((resolve) => (finish = resolve))
    );
    const { rerender } = renderHook(
      ({ place }) => useCreatedConsumptionResult({ createdPlace: place, onHandled }),
      { initialProps: { place: createdPlace } }
    );

    setCachedStickers([firstVisitSticker]);
    rerender({ place: { ...createdPlace } });

    expect(refetchStickers).toHaveBeenCalledTimes(1);
    await act(async () => finish([firstVisitSticker]));
    expect(showToast).toHaveBeenCalledWith({
      type: 'success',
      message: '첫번째 방문기록이 생성되었어요!',
      placement: 'above-bottom-sheet',
    });
    expect(onHandled).toHaveBeenCalledTimes(1);
  });

  it('재조회가 실패하면 대기 중 갱신된 캐시로 첫 방문을 안내한다', async () => {
    let fail!: (error: Error) => void;
    refetchStickers.mockImplementation(
      () => new Promise<readonly MapSticker[]>((_resolve, reject) => (fail = reject))
    );
    const { rerender } = renderHook(() => useCreatedConsumptionResult({ createdPlace, onHandled }));
    setCachedStickers([firstVisitSticker]);
    rerender();
    await act(async () => fail(new Error('network error')));

    expect(refetchStickers).toHaveBeenCalledTimes(1);
    expect(showToast).toHaveBeenCalledWith({
      type: 'success',
      message: '첫번째 방문기록이 생성되었어요!',
      placement: 'above-bottom-sheet',
    });
    expect(onHandled).toHaveBeenCalledTimes(1);
  });

  it('재조회 중 화면을 떠나면 완료 토스트와 상세 시트를 열지 않는다', async () => {
    let finish!: (stickers: readonly MapSticker[]) => void;
    refetchStickers.mockImplementation(
      () => new Promise<readonly MapSticker[]>((resolve) => (finish = resolve))
    );
    const { unmount } = renderHook(() => useCreatedConsumptionResult({ createdPlace, onHandled }));
    unmount();
    await act(async () => finish([firstVisitSticker]));
    expect(showToast).not.toHaveBeenCalled();
    expect(onHandled).not.toHaveBeenCalled();
    expect(useHomeBottomSheetStore.getState().activeSheet).toEqual({ type: 'home' });
  });
});
