import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  act,
  fireEvent,
  render as renderUI,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Link, MemoryRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';

import { useLikedPlaceDetailQuery } from '@/features/map/apis/hooks/useLikedPlaceDetailQuery';
import { useNearbyPlaceRecommendationsQuery } from '@/features/map/apis/hooks/useNearbyPlaceRecommendationsQuery';
import { useRecommendationNeighborhood } from '@/features/map/apis/hooks/useRecommendationNeighborhood';
import { useTogglePlaceLikeMutation } from '@/features/map/apis/hooks/useTogglePlaceLikeMutation';
import { useVisitedPlaceStickersQuery } from '@/features/map/apis/hooks/useVisitedPlaceStickersQuery';
import { useHomeBottomSheetStore } from '@/features/map/stores/homeBottomSheetStore';
import { useLocationSelectionStore } from '@/features/map/stores/locationSelectionStore';
import { useShopRecommendationStore } from '@/features/map/stores/shopRecommendationStore';
import { TEST_MAP_STICKERS, TEST_SHOP_RECOMMENDATIONS } from '@/features/map/testFixtures';
import {
  getRecordCategoryFromLocationState,
  getRecordShopFromLocationState,
} from '@/shared/utils/recordNavigation';

import HomeCategoryFilter from './home-overlay/HomeCategoryFilter';
import HomeBottomSheet from './HomeBottomSheet';

jest.mock('@/features/map/apis/hooks/useNearbyPlaceRecommendationsQuery');
jest.mock('@/features/map/apis/hooks/useLikedPlaceDetailQuery');
jest.mock('@/features/map/apis/hooks/useTogglePlaceLikeMutation');
jest.mock('@/features/map/apis/hooks/useVisitedPlaceStickersQuery');
jest.mock('@/features/map/apis/hooks/useRecommendationNeighborhood');

const mockedUseNearbyPlaceRecommendationsQuery = jest.mocked(useNearbyPlaceRecommendationsQuery);
const mockedUseLikedPlaceDetailQuery = jest.mocked(useLikedPlaceDetailQuery);
const mockedUseTogglePlaceLikeMutation = jest.mocked(useTogglePlaceLikeMutation);
const mockedUseVisitedPlaceStickersQuery = jest.mocked(useVisitedPlaceStickersQuery);
const mutateLike = jest.fn();
const fireSheetPointerEvent = (element: Element, type: string, clientY: number) => {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperties(event, {
    clientY: { value: clientY },
    clientX: { value: 0 },
    pointerId: { value: 1 },
  });
  fireEvent(element, event);
};
const render = (ui: Parameters<typeof renderUI>[0]) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return renderUI(ui, {
    wrapper: ({ children }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    ),
  });
};
const recommendationRecordShop = {
  id: TEST_MAP_STICKERS[0]!.googlePlaceId!,
  name: TEST_MAP_STICKERS[0]!.place.name,
  address: TEST_MAP_STICKERS[0]!.place.address,
  photoUrl: null,
  latitude: TEST_MAP_STICKERS[0]!.position.lat,
  longitude: TEST_MAP_STICKERS[0]!.position.lng,
};

const renderSelectedPlace = () => (
  <section>
    <h2>{TEST_MAP_STICKERS[0]!.place.name}</h2>
    <p>{TEST_MAP_STICKERS[0]!.place.address}</p>
    <a href={`/home/shop/${TEST_MAP_STICKERS[0]!.place.id}`}>상세보기</a>
  </section>
);

function RecordLocationProbe() {
  const location = useLocation();
  const shop = getRecordShopFromLocationState(location.state);
  const category = getRecordCategoryFromLocationState(location.state);

  return <p>{shop ? `${shop.id}|${shop.name}|${shop.address}|${category}` : '선택 가게 없음'}</p>;
}

function EditRecordReturnProbe() {
  const navigate = useNavigate();
  return <button onClick={() => navigate(-1)}>편집 완료</button>;
}

const mockExpandAnimation = (sheet: HTMLElement) => {
  const animation = { onfinish: null, oncancel: null, cancel: jest.fn() } as unknown as Animation;
  const animate = jest.fn(() => animation);
  Object.defineProperty(sheet, 'animate', { configurable: true, value: animate });
  jest.spyOn(sheet, 'getBoundingClientRect').mockReturnValue({
    ...sheet.getBoundingClientRect(),
    height: 280,
  });

  return { animation, animate };
};

describe('HomeBottomSheet', () => {
  it.each(['selectedPlace', 'likedRecommendation', 'recommendationPlace'] as const)(
    '%s 상세 본문을 아래로 끌면 이전 시트로 돌아간다',
    (type) => {
      const store = useHomeBottomSheetStore.getState();
      if (type === 'selectedPlace') store.showSelectedPlace(TEST_MAP_STICKERS[0]!.id);
      else if (type === 'likedRecommendation')
        store.showLikedRecommendation(TEST_SHOP_RECOMMENDATIONS[0]!.id);
      else store.showRecommendationPlace(TEST_SHOP_RECOMMENDATIONS[0]!.id);
      const { container } = render(
        <MemoryRouter>
          <HomeBottomSheet
            renderFrequentShops={(header) => <div>{header}</div>}
            renderSelectedPlace={renderSelectedPlace}
            renderSpendingHistory={(header) => <div>{header}</div>}
          />
        </MemoryRouter>
      );
      const sheet = container.querySelector<HTMLElement>('.z-bottom-sheet')!;
      jest
        .spyOn(sheet, 'getBoundingClientRect')
        .mockReturnValue({ ...sheet.getBoundingClientRect(), height: 300 });
      const content = sheet.lastElementChild!;
      fireSheetPointerEvent(content, 'pointerdown', 300);
      fireSheetPointerEvent(document.body, 'pointermove', 380);
      fireSheetPointerEvent(document.body, 'pointerup', 380);
      expect(useHomeBottomSheetStore.getState().activeSheet.type).toBe(
        type === 'recommendationPlace' ? 'recommendation' : 'home'
      );
    }
  );

  beforeEach(() => {
    useHomeBottomSheetStore.setState({
      activeSheet: { type: 'home' },
      tab: 'frequentShops',
      scrollPositions: { frequentShops: 0, history: 0 },
      stepIndex: 0,
      visibleHeightPx: 0,
    });
    useShopRecommendationStore.setState({
      activeRecommendationId: null,
      selectedCategory: null,
      listScrollTop: 0,
    });
    useLocationSelectionStore.setState({
      confirmedAddress: '서울시 중구',
      confirmedPosition: { lat: 37.5, lng: 127 },
      confirmedNeighborhoodId: 1,
      draftSelection: null,
    });
    jest.mocked(useRecommendationNeighborhood).mockReturnValue({
      hasNeighborhood: true,
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useRecommendationNeighborhood>);
    mutateLike.mockReset();
    mutateLike.mockImplementation((...args: unknown[]) => {
      const options = args[1] as { onSuccess?: () => void } | undefined;
      options?.onSuccess?.();
    });
    mockedUseNearbyPlaceRecommendationsQuery.mockReturnValue({
      recommendations: TEST_SHOP_RECOMMENDATIONS,
      isPending: false,
      isError: false,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useNearbyPlaceRecommendationsQuery>);
    mockedUseLikedPlaceDetailQuery.mockReturnValue({
      detail: {
        googlePlaceId: recommendationRecordShop.id,
        name: recommendationRecordShop.name,
        roadAddress: recommendationRecordShop.address,
        latitude: recommendationRecordShop.latitude,
        longitude: recommendationRecordShop.longitude,
        category: TEST_SHOP_RECOMMENDATIONS[0]!.place.category,
      },
      isError: false,
      isLoading: false,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useLikedPlaceDetailQuery>);
    mockedUseTogglePlaceLikeMutation.mockReturnValue({
      mutate: mutateLike,
      isPending: false,
    } as unknown as ReturnType<typeof useTogglePlaceLikeMutation>);
    mockedUseVisitedPlaceStickersQuery.mockReturnValue({
      likedRecommendations: [{ ...TEST_SHOP_RECOMMENDATIONS[0]!, isLiked: true }],
      isPending: false,
      isError: false,
      refetch: jest.fn(),
      isSuccess: false,
      stickers: [],
    } as unknown as ReturnType<typeof useVisitedPlaceStickersQuery>);
  });

  it('최대 높이에서 상태바 아래 12px를 남기고 Safe Area 변경을 반영한다', () => {
    useHomeBottomSheetStore.setState({ stepIndex: 1 });
    const { container } = render(
      <HomeBottomSheet
        renderFrequentShops={(headerContent) => <div>{headerContent}</div>}
        renderSelectedPlace={renderSelectedPlace}
        renderSpendingHistory={(headerContent) => <div>{headerContent}</div>}
      />
    );
    const topSafeArea = container.querySelector<HTMLElement>('[class*="safe-area-inset-top"]')!;
    const rect = topSafeArea.getBoundingClientRect();
    const boundingClientRectSpy = jest
      .spyOn(topSafeArea, 'getBoundingClientRect')
      .mockReturnValue({ ...rect, height: 59, bottom: 59 });
    try {
      const sheet = screen.getByRole('button', { name: '바텀시트 높이 조절' })
        .parentElement as HTMLElement;

      fireEvent.resize(window);
      expect(sheet).toHaveStyle({ height: 'calc(100dvh - 71px)' });

      boundingClientRectSpy.mockReturnValue({ ...rect, height: 44, bottom: 44 });
      fireEvent.resize(window);

      expect(sheet).toHaveStyle({ height: 'calc(100dvh - 56px)' });
    } finally {
      boundingClientRectSpy.mockRestore();
    }
  });

  it('최대 높이였더라도 장소 요약 시트로 전환하면 딤을 해제한다', () => {
    useHomeBottomSheetStore.setState({ stepIndex: 1 });
    const { container } = render(
      <HomeBottomSheet
        renderFrequentShops={(headerContent) => <div>{headerContent}</div>}
        renderSelectedPlace={renderSelectedPlace}
        renderSpendingHistory={(headerContent) => <div>{headerContent}</div>}
      />
    );

    expect(container.querySelector('[data-slot="overlay"]')).toBeInTheDocument();

    act(() => {
      useHomeBottomSheetStore.getState().showSelectedPlace(TEST_MAP_STICKERS[0]!.id);
    });

    expect(screen.getByRole('dialog', { name: '선택한 가게 정보' })).toBeInTheDocument();
    expect(container.querySelector('[data-slot="overlay"]')).not.toBeInTheDocument();

    act(() => {
      useHomeBottomSheetStore.getState().showHome();
    });

    expect(container.querySelector('[data-slot="overlay"]')).toBeInTheDocument();
  });

  it('자주 소비한 곳 탭에 페이지에서 전달한 요약을 표시한다', () => {
    render(
      <HomeBottomSheet
        renderFrequentShops={(headerContent) => (
          <div>
            {headerContent}
            자주 소비한 곳 콘텐츠
          </div>
        )}
        renderSelectedPlace={renderSelectedPlace}
        renderSpendingHistory={(headerContent) => <div>{headerContent}</div>}
      />
    );

    expect(screen.getByText('자주 소비한 곳 콘텐츠').closest('[aria-hidden]')).toHaveAttribute(
      'aria-hidden',
      'false'
    );
    expect(
      screen.getByRole('button', { name: '자주 소비한 곳' }).parentElement?.parentElement
    ).toHaveClass('pb-2');
  });

  it('목록을 접었다 펼쳐도 입력 상태와 스크롤 위치를 유지한다', async () => {
    const user = userEvent.setup();
    render(
      <HomeBottomSheet
        renderFrequentShops={(headerContent) => <div>{headerContent}</div>}
        renderSelectedPlace={renderSelectedPlace}
        renderSpendingHistory={(headerContent) => (
          <div>
            {headerContent}
            <input aria-label="선택한 월" defaultValue="7월" />
          </div>
        )}
      />
    );
    await user.click(screen.getByRole('button', { name: '소비 기록' }));
    const input = screen.getByRole('textbox', { name: '선택한 월' });
    await user.clear(input);
    await user.type(input, '6월');
    const sheet = screen.getByRole('button', { name: '바텀시트 높이 조절' }).parentElement!;
    const scrollContainer = sheet.lastElementChild as HTMLElement;
    scrollContainer.scrollTop = 240;
    fireEvent.scroll(scrollContainer);

    act(() => useHomeBottomSheetStore.getState().setSnapPoint('hidden'));
    scrollContainer.scrollTop = 0;
    fireEvent.scroll(scrollContainer);
    expect(useHomeBottomSheetStore.getState().scrollPositions.history).toBe(240);

    act(() => useHomeBottomSheetStore.getState().advance());

    expect(screen.getByRole('textbox', { name: '선택한 월' })).toBe(input);
    expect(input).toHaveValue('6월');
    expect(scrollContainer.scrollTop).toBe(240);
    expect(sheet).toHaveStyle({ height: '45dvh' });

    fireEvent.scroll(scrollContainer);
    fireEvent.scroll(scrollContainer);
    expect(sheet).toHaveStyle({ height: '45dvh' });

    scrollContainer.scrollTop = 280;
    fireEvent.scroll(scrollContainer);
    expect(sheet).toHaveStyle({ height: 'calc(100dvh - 12px)' });
  });

  it('소비 기록 탭을 선택하면 페이지에서 전달한 소비내역을 표시한다', async () => {
    const user = userEvent.setup();
    render(
      <HomeBottomSheet
        renderFrequentShops={(headerContent) => <div>{headerContent}</div>}
        renderSelectedPlace={renderSelectedPlace}
        renderSpendingHistory={(headerContent) => (
          <div>
            {headerContent}
            소비내역 콘텐츠
          </div>
        )}
      />
    );

    const historyPanel = screen.getByText('소비내역 콘텐츠').closest('[aria-hidden]');
    expect(historyPanel).toHaveAttribute('aria-hidden', 'true');

    await user.click(screen.getByRole('button', { name: '소비 기록' }));

    expect(historyPanel).toHaveAttribute('aria-hidden', 'false');
  });

  it('탭을 전환해도 소비내역 상태와 탭별 스크롤 위치를 유지한다', async () => {
    const user = userEvent.setup();
    render(
      <HomeBottomSheet
        renderFrequentShops={(headerContent) => <div>{headerContent}</div>}
        renderSelectedPlace={renderSelectedPlace}
        renderSpendingHistory={(headerContent) => (
          <div>
            {headerContent}
            <input aria-label="선택한 월" defaultValue="7월" />
          </div>
        )}
      />
    );
    const sheet = screen.getByRole('button', { name: '바텀시트 높이 조절' })
      .parentElement as HTMLElement;
    const scrollContainer = sheet.lastElementChild as HTMLElement;

    await user.click(screen.getByRole('button', { name: '소비 기록' }));
    const selectedMonthInput = screen.getByRole('textbox', { name: '선택한 월' });
    await user.clear(selectedMonthInput);
    await user.type(selectedMonthInput, '6월');
    scrollContainer.scrollTop = 120;

    await user.click(screen.getByRole('button', { name: '자주 소비한 곳' }));
    scrollContainer.scrollTop = 40;
    await user.click(screen.getByRole('button', { name: '소비 기록' }));

    expect(screen.getByRole('textbox', { name: '선택한 월' })).toHaveValue('6월');
    expect(scrollContainer.scrollTop).toBe(120);
    fireEvent.scroll(scrollContainer);
    expect(sheet).toHaveStyle({ height: '45dvh' });
  });

  it('기록 편집으로 언마운트된 뒤 돌아오면 소비 기록 탭과 탭별 스크롤을 복원한다', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/home']}>
        <Routes>
          <Route
            path="/home"
            element={
              <HomeBottomSheet
                renderFrequentShops={(headerContent) => <div>{headerContent}</div>}
                renderSelectedPlace={renderSelectedPlace}
                renderSpendingHistory={(headerContent) => (
                  <div>
                    {headerContent}
                    <Link to="/record/196/edit">기록 수정</Link>
                  </div>
                )}
              />
            }
          />
          <Route path="/record/:consumptionId/edit" element={<EditRecordReturnProbe />} />
        </Routes>
      </MemoryRouter>
    );
    const getScrollContainer = () =>
      screen.getByRole('button', { name: '바텀시트 높이 조절' }).parentElement!
        .lastElementChild as HTMLElement;
    const originalContainer = getScrollContainer();
    originalContainer.scrollTop = 40;
    fireEvent.scroll(originalContainer);
    await user.click(screen.getByRole('button', { name: '소비 기록' }));
    originalContainer.scrollTop = 240;
    fireEvent.scroll(originalContainer);

    await user.click(screen.getByRole('link', { name: '기록 수정' }));
    expect(screen.queryByRole('button', { name: '소비 기록' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '편집 완료' }));

    expect(screen.getByRole('button', { name: '소비 기록' })).toHaveAttribute('data-pressed');
    expect(getScrollContainer()).not.toBe(originalContainer);
    expect(getScrollContainer().scrollTop).toBe(240);
    await user.click(screen.getByRole('button', { name: '자주 소비한 곳' }));
    expect(getScrollContainer().scrollTop).toBe(40);
  });

  it('목록 높이가 늦게 확보되어도 복원할 스크롤 값을 유지하고 다시 적용한다', async () => {
    const user = userEvent.setup();
    const resizeCallbacks: ResizeObserverCallback[] = [];
    const resizeDisconnects: jest.Mock[] = [];
    const originalResizeObserver = globalThis.ResizeObserver;
    globalThis.ResizeObserver = jest.fn((callback: ResizeObserverCallback) => {
      resizeCallbacks.push(callback);
      const disconnect = jest.fn();
      resizeDisconnects.push(disconnect);
      return { observe: jest.fn(), unobserve: jest.fn(), disconnect };
    });
    try {
      useHomeBottomSheetStore.setState({
        scrollPositions: { frequentShops: 0, history: 240 },
      });
      render(
        <HomeBottomSheet
          renderFrequentShops={(headerContent) => <div>{headerContent}</div>}
          renderSelectedPlace={renderSelectedPlace}
          renderSpendingHistory={(headerContent) => <div>{headerContent}소비내역 콘텐츠</div>}
        />
      );
      const scrollContainer = screen.getByRole('button', { name: '바텀시트 높이 조절' })
        .parentElement!.lastElementChild as HTMLElement;
      let maxScrollTop = 0;
      let scrollTop = 0;
      Object.defineProperty(scrollContainer, 'scrollTop', {
        configurable: true,
        get: () => scrollTop,
        set: (value: number) => {
          scrollTop = Math.min(value, maxScrollTop);
        },
      });
      await user.click(screen.getByRole('button', { name: '소비 기록' }));
      fireEvent.scroll(scrollContainer);

      expect(scrollContainer.scrollTop).toBe(0);
      expect(useHomeBottomSheetStore.getState().scrollPositions.history).toBe(240);

      await user.click(screen.getByRole('button', { name: '자주 소비한 곳' }));
      expect(useHomeBottomSheetStore.getState().scrollPositions.history).toBe(240);
      await user.click(screen.getByRole('button', { name: '소비 기록' }));
      const disconnectRestoration = resizeDisconnects.at(-1)!;

      maxScrollTop = 500;
      act(() => resizeCallbacks.forEach((callback) => callback([], {} as ResizeObserver)));
      expect(scrollContainer.scrollTop).toBe(240);
      expect(disconnectRestoration).toHaveBeenCalledTimes(1);

      scrollContainer.scrollTop = 100;
      fireEvent.scroll(scrollContainer);
      act(() => resizeCallbacks.forEach((callback) => callback([], {} as ResizeObserver)));
      expect(scrollContainer.scrollTop).toBe(100);
      expect(useHomeBottomSheetStore.getState().scrollPositions.history).toBe(100);
    } finally {
      globalThis.ResizeObserver = originalResizeObserver;
    }
  });

  it('중간 높이에서 콘텐츠를 32px 넘게 스크롤하면 최대 높이로 확장한다', () => {
    render(
      <HomeBottomSheet
        renderFrequentShops={(headerContent) => <div>{headerContent}</div>}
        renderSelectedPlace={renderSelectedPlace}
        renderSpendingHistory={(headerContent) => <div>{headerContent}</div>}
      />
    );
    const sheet = screen.getByRole('button', { name: '바텀시트 높이 조절' })
      .parentElement as HTMLElement;
    const scrollContainer = sheet.lastElementChild as HTMLElement;

    scrollContainer.scrollTop = 32;
    fireEvent.scroll(scrollContainer);
    expect(sheet).toHaveStyle({ height: '45dvh' });

    scrollContainer.scrollTop = 33;
    fireEvent.scroll(scrollContainer);

    expect(sheet).toHaveStyle({ height: 'calc(100dvh - 12px)' });
  });

  it('연속 휠 제스처로 최대 높이에서 중간 높이로 한 번만 축소하고 다음 제스처에서 접는다', () => {
    jest.useFakeTimers();
    try {
      useHomeBottomSheetStore.setState({ stepIndex: 1 });
      render(
        <HomeBottomSheet
          renderFrequentShops={(headerContent) => <div>{headerContent}</div>}
          renderSelectedPlace={renderSelectedPlace}
          renderSpendingHistory={(headerContent) => <div>{headerContent}</div>}
        />
      );
      const sheet = screen.getByRole('button', { name: '바텀시트 높이 조절' }).parentElement!;
      const scrollContainer = sheet.lastElementChild as HTMLElement;

      fireEvent.wheel(scrollContainer, { deltaY: -32 });
      expect(sheet).toHaveStyle({ height: 'calc(100dvh - 12px)' });
      fireEvent.wheel(scrollContainer, { deltaY: -33 });
      expect(sheet).toHaveStyle({ height: '45dvh' });

      act(() => jest.advanceTimersByTime(149));
      fireEvent.wheel(scrollContainer, { deltaY: -100 });
      act(() => jest.advanceTimersByTime(149));
      fireEvent.wheel(scrollContainer, { deltaY: -100 });
      expect(sheet).toHaveStyle({ height: '45dvh' });

      act(() => jest.advanceTimersByTime(150));
      fireEvent.wheel(scrollContainer, { deltaY: -65 });
      expect(sheet).toHaveStyle({ height: '0px' });
      expect(useHomeBottomSheetStore.getState().stepIndex).toBe(3);
    } finally {
      jest.useRealTimers();
    }
  });

  it('최대 높이의 콘텐츠 최상단에서 아래로 당기면 중간 높이로 축소한다', () => {
    useHomeBottomSheetStore.setState({ stepIndex: 1 });
    render(
      <HomeBottomSheet
        renderFrequentShops={(headerContent) => <div>{headerContent}</div>}
        renderSelectedPlace={renderSelectedPlace}
        renderSpendingHistory={(headerContent) => <div>{headerContent}</div>}
      />
    );
    const sheet = screen.getByRole('button', { name: '바텀시트 높이 조절' })
      .parentElement as HTMLElement;
    const scrollContainer = sheet.lastElementChild as HTMLElement;

    expect(sheet).toHaveStyle({ height: 'calc(100dvh - 12px)' });
    scrollContainer.scrollTop = 0;
    fireEvent.touchStart(scrollContainer, { touches: [{ clientY: 100 }] });
    fireEvent.touchMove(scrollContainer, { touches: [{ clientY: 165 }] });

    expect(sheet).toHaveStyle({ height: '45dvh' });
  });

  it('탭 전환 후 새로 렌더링된 활성 탭 버튼으로 포커스를 복원한다', async () => {
    const user = userEvent.setup();
    render(
      <HomeBottomSheet
        renderFrequentShops={(headerContent) => <div>{headerContent}</div>}
        renderSelectedPlace={renderSelectedPlace}
        renderSpendingHistory={(headerContent) => <div>{headerContent}</div>}
      />
    );

    await user.click(screen.getByRole('button', { name: '소비 기록' }));
    expect(screen.getByRole('button', { name: '소비 기록' })).toHaveFocus();

    await user.click(screen.getByRole('button', { name: '자주 소비한 곳' }));
    expect(screen.getByRole('button', { name: '자주 소비한 곳' })).toHaveFocus();
  });

  it('스티커를 선택하면 탭 대신 해당 장소의 상세 바텀시트를 표시한다', () => {
    const selectedSticker = TEST_MAP_STICKERS[0]!;
    act(() => {
      useHomeBottomSheetStore.getState().showSelectedPlace(selectedSticker.id);
    });

    render(
      <MemoryRouter>
        <HomeBottomSheet
          renderFrequentShops={(headerContent) => <div>{headerContent}</div>}
          renderSelectedPlace={renderSelectedPlace}
          renderSpendingHistory={(headerContent) => <div>{headerContent}</div>}
        />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: selectedSticker.place.name })).toBeInTheDocument();
    expect(screen.getByText(selectedSticker.place.address!)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '상세보기' })).toHaveAttribute(
      'href',
      `/home/shop/${selectedSticker.place.id}`
    );
    expect(screen.queryByRole('button', { name: '자주 소비한 곳' })).not.toBeInTheDocument();
  });

  it('선택한 가게 시트를 위로 쓸어올려 놓으면 해당 가게의 상세 이동을 요청한다', () => {
    const onSelectedPlaceExpand = jest.fn();
    const selectedSticker = TEST_MAP_STICKERS[0]!;
    useHomeBottomSheetStore.getState().showSelectedPlace(selectedSticker.id);
    render(
      <HomeBottomSheet
        onSelectedPlaceExpand={onSelectedPlaceExpand}
        renderFrequentShops={(headerContent) => <div>{headerContent}</div>}
        renderSelectedPlace={renderSelectedPlace}
        renderSpendingHistory={(headerContent) => <div>{headerContent}</div>}
      />
    );
    const content = screen.getByRole('dialog', { name: '선택한 가게 정보' }).parentElement!;

    fireSheetPointerEvent(content, 'pointerdown', 300);
    fireSheetPointerEvent(document.body, 'pointermove', 200);
    expect(onSelectedPlaceExpand).not.toHaveBeenCalled();
    fireSheetPointerEvent(document.body, 'pointerup', 200);

    expect(onSelectedPlaceExpand).toHaveBeenCalledTimes(1);
    expect(onSelectedPlaceExpand).toHaveBeenCalledWith(selectedSticker.id);
  });

  it('시트 크기를 유지하며 짧게 위로 사라진 뒤 한 번만 상세로 이동한다', () => {
    const onSelectedPlaceExpand = jest.fn();
    const selectedSticker = TEST_MAP_STICKERS[0]!;
    useHomeBottomSheetStore.getState().showSelectedPlace(selectedSticker.id);
    render(
      <HomeBottomSheet
        onSelectedPlaceExpand={onSelectedPlaceExpand}
        renderFrequentShops={(headerContent) => <div>{headerContent}</div>}
        renderSelectedPlace={renderSelectedPlace}
        renderSpendingHistory={(headerContent) => <div>{headerContent}</div>}
      />
    );
    const sheet = screen.getByRole('button', { name: '바텀시트 높이 조절' }).parentElement!;
    const content = screen.getByRole('dialog', { name: '선택한 가게 정보' }).parentElement!;
    const { animation, animate } = mockExpandAnimation(sheet);

    for (let gesture = 0; gesture < 2; gesture += 1) {
      fireSheetPointerEvent(content, 'pointerdown', 300);
      fireSheetPointerEvent(document.body, 'pointermove', 200);
      fireSheetPointerEvent(document.body, 'pointerup', 200);
    }

    expect(animate).toHaveBeenCalledTimes(1);
    expect(animate).toHaveBeenCalledWith(
      [
        { height: '280px', transform: 'translateY(0)', opacity: 1 },
        { height: '280px', transform: 'translateY(-12px)', opacity: 0 },
      ],
      expect.objectContaining({ duration: 140, fill: 'forwards' })
    );
    expect(onSelectedPlaceExpand).not.toHaveBeenCalled();

    act(() => animation.onfinish?.(new Event('finish') as AnimationPlaybackEvent));

    expect(onSelectedPlaceExpand).toHaveBeenCalledTimes(1);
    expect(onSelectedPlaceExpand).toHaveBeenCalledWith(selectedSticker.id);
    fireEvent.keyDown(screen.getByRole('button', { name: '바텀시트 높이 조절' }), {
      key: 'ArrowUp',
    });
    expect(animate).toHaveBeenCalledTimes(1);
  });

  it.each(['다른 가게 선택', '언마운트'])(
    '전환 도중 %s 시 애니메이션과 이전 가게로의 이동을 취소한다',
    (reason) => {
      const onSelectedPlaceExpand = jest.fn();
      useHomeBottomSheetStore.getState().showSelectedPlace(TEST_MAP_STICKERS[0]!.id);
      const { unmount } = render(
        <HomeBottomSheet
          onSelectedPlaceExpand={onSelectedPlaceExpand}
          renderFrequentShops={(headerContent) => <div>{headerContent}</div>}
          renderSelectedPlace={renderSelectedPlace}
          renderSpendingHistory={(headerContent) => <div>{headerContent}</div>}
        />
      );
      const handle = screen.getByRole('button', { name: '바텀시트 높이 조절' });
      const { animation } = mockExpandAnimation(handle.parentElement!);
      fireEvent.keyDown(handle, { key: 'ArrowUp' });
      const pendingFinish = animation.onfinish;

      if (reason === '언마운트') unmount();
      else
        act(() => useHomeBottomSheetStore.getState().showSelectedPlace(TEST_MAP_STICKERS[1]!.id));

      expect(animation.cancel).toHaveBeenCalledTimes(1);
      act(() => pendingFinish?.call(animation, new Event('finish') as AnimationPlaybackEvent));
      expect(onSelectedPlaceExpand).not.toHaveBeenCalled();
    }
  );

  it('모션 감소 설정에서는 전환 애니메이션 없이 상세로 이동한다', () => {
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = jest.fn().mockReturnValue({
      matches: true,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }) as unknown as typeof window.matchMedia;
    try {
      const onSelectedPlaceExpand = jest.fn();
      const selectedSticker = TEST_MAP_STICKERS[0]!;
      useHomeBottomSheetStore.getState().showSelectedPlace(selectedSticker.id);
      render(
        <HomeBottomSheet
          onSelectedPlaceExpand={onSelectedPlaceExpand}
          renderFrequentShops={(headerContent) => <div>{headerContent}</div>}
          renderSelectedPlace={renderSelectedPlace}
          renderSpendingHistory={(headerContent) => <div>{headerContent}</div>}
        />
      );
      const handle = screen.getByRole('button', { name: '바텀시트 높이 조절' });
      const { animate } = mockExpandAnimation(handle.parentElement!);

      fireEvent.keyDown(handle, { key: 'ArrowUp' });

      expect(animate).not.toHaveBeenCalled();
      expect(onSelectedPlaceExpand).toHaveBeenCalledWith(selectedSticker.id);
    } finally {
      window.matchMedia = originalMatchMedia;
    }
  });

  it('홈 시트에서는 위로 쓸어올려도 가게 상세 이동을 요청하지 않는다', () => {
    const onSelectedPlaceExpand = jest.fn();
    render(
      <HomeBottomSheet
        onSelectedPlaceExpand={onSelectedPlaceExpand}
        renderFrequentShops={(headerContent) => <div>{headerContent}</div>}
        renderSelectedPlace={renderSelectedPlace}
        renderSpendingHistory={(headerContent) => <div>{headerContent}</div>}
      />
    );
    const content = screen.getByRole('button', { name: '바텀시트 높이 조절' }).nextElementSibling!;

    fireEvent.touchStart(content, { touches: [{ clientY: 300 }] });
    fireEvent.touchMove(content, { touches: [{ clientY: 200 }] });
    fireEvent.touchEnd(content);

    expect(onSelectedPlaceExpand).not.toHaveBeenCalled();
  });

  it('스티커 선택을 해제하면 원래 홈 바텀시트를 복원한다', () => {
    act(() => {
      useHomeBottomSheetStore.getState().showSelectedPlace(TEST_MAP_STICKERS[0]!.id);
    });

    render(
      <MemoryRouter>
        <HomeBottomSheet
          renderFrequentShops={(headerContent) => <div>{headerContent}</div>}
          renderSelectedPlace={renderSelectedPlace}
          renderSpendingHistory={(headerContent) => <div>{headerContent}</div>}
        />
      </MemoryRouter>
    );
    expect(
      screen.getByRole('heading', { name: TEST_MAP_STICKERS[0]!.place.name })
    ).toBeInTheDocument();

    act(() => {
      useHomeBottomSheetStore.getState().showHome();
    });

    expect(screen.getByRole('button', { name: '자주 소비한 곳' })).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: TEST_MAP_STICKERS[0]!.place.name })
    ).not.toBeInTheDocument();
  });

  it('좋아요 마커를 선택하면 좋아요 가게 시트로 바꾸고 좋아요 해제 시 원래 시트를 복원한다', async () => {
    const user = userEvent.setup();
    const recommendation = TEST_SHOP_RECOMMENDATIONS[0]!;
    useHomeBottomSheetStore.setState({
      activeSheet: { type: 'likedRecommendation', recommendationId: recommendation.id },
    });

    render(
      <MemoryRouter>
        <HomeBottomSheet
          renderFrequentShops={(headerContent) => (
            <div>
              {headerContent}
              기존 홈 시트
            </div>
          )}
          renderSelectedPlace={renderSelectedPlace}
          renderSpendingHistory={(headerContent) => <div>{headerContent}</div>}
        />
      </MemoryRouter>
    );

    const likedPlaceHeading = screen.getByRole('heading', {
      level: 1,
      name: recommendation.place.name,
    });
    expect(likedPlaceHeading).toBeInTheDocument();
    expect(
      likedPlaceHeading
        .closest('section')
        ?.querySelector(`[aria-label="${recommendation.place.name} 사진"]`)
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '기록하기' })).toHaveAttribute('href', '/record');
    expect(screen.queryByText('기존 홈 시트')).not.toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: `${recommendation.place.name} 좋아요 해제` })
    );

    expect(mutateLike).toHaveBeenCalledWith(
      { placeId: Number(recommendation.id), currentLiked: true },
      expect.objectContaining({ onSuccess: expect.any(Function) })
    );
    expect(screen.getByText('기존 홈 시트')).toBeInTheDocument();
    expect(useHomeBottomSheetStore.getState().activeSheet).toEqual({ type: 'home' });
  });

  it('좋아요한 추천 가게에서 기록하기를 누르면 추천 가게를 기록 화면에 전달한다', async () => {
    const user = userEvent.setup();
    const recommendation = TEST_SHOP_RECOMMENDATIONS[0]!;
    useHomeBottomSheetStore.setState({
      activeSheet: { type: 'likedRecommendation', recommendationId: recommendation.id },
    });

    render(
      <MemoryRouter initialEntries={['/home']}>
        <Routes>
          <Route
            path="/home"
            element={
              <HomeBottomSheet
                renderFrequentShops={(headerContent) => <div>{headerContent}</div>}
                renderSelectedPlace={renderSelectedPlace}
                renderSpendingHistory={(headerContent) => <div>{headerContent}</div>}
              />
            }
          />
          <Route path="/record" element={<RecordLocationProbe />} />
        </Routes>
      </MemoryRouter>
    );

    await user.click(screen.getByRole('link', { name: '기록하기' }));

    expect(
      screen.getByText(
        `${recommendationRecordShop.id}|${recommendationRecordShop.name}|${recommendationRecordShop.address}|${recommendation.place.category}`
      )
    ).toBeInTheDocument();
  });

  it('상세 조회 중에는 스켈레톤을 표시한다', () => {
    const recommendation = TEST_SHOP_RECOMMENDATIONS[0]!;
    mockedUseLikedPlaceDetailQuery.mockReturnValue({
      detail: undefined,
      isError: false,
      isLoading: true,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useLikedPlaceDetailQuery>);
    useHomeBottomSheetStore.getState().showLikedRecommendation(recommendation.id);

    render(
      <MemoryRouter>
        <HomeBottomSheet
          renderFrequentShops={(headerContent) => <div>{headerContent}</div>}
          renderSelectedPlace={renderSelectedPlace}
          renderSpendingHistory={(headerContent) => <div>{headerContent}</div>}
        />
      </MemoryRouter>
    );

    expect(screen.getByRole('status', { name: '좋아요한 가게 불러오는 중' })).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: recommendation.place.name })
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: '기록하기' })).not.toBeInTheDocument();
  });

  it('상세 조회 실패를 표시하고 다시 조회한다', async () => {
    const user = userEvent.setup();
    const refetchPlaceDetail = jest.fn();
    mockedUseLikedPlaceDetailQuery.mockReturnValue({
      detail: undefined,
      isError: true,
      isLoading: false,
      refetch: refetchPlaceDetail,
    } as unknown as ReturnType<typeof useLikedPlaceDetailQuery>);
    useHomeBottomSheetStore.getState().showLikedRecommendation('101');

    render(
      <MemoryRouter>
        <HomeBottomSheet
          renderFrequentShops={(headerContent) => <div>{headerContent}</div>}
          renderSelectedPlace={renderSelectedPlace}
          renderSpendingHistory={(headerContent) => <div>{headerContent}</div>}
        />
      </MemoryRouter>
    );
    expect(
      screen.getByRole('heading', { name: '가게 정보를 불러오지 못했어요' })
    ).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: '기록하기' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '다시 불러오기' }));
    expect(refetchPlaceDetail).toHaveBeenCalledTimes(1);
    expect(useHomeBottomSheetStore.getState().activeSheet).toEqual({
      type: 'likedRecommendation',
      recommendationId: '101',
    });
  });

  it('상세 응답에 기록할 장소 정보가 없으면 기록 화면 이동을 막는다', () => {
    const recommendation = TEST_SHOP_RECOMMENDATIONS[0]!;
    mockedUseLikedPlaceDetailQuery.mockReturnValue({
      detail: { name: recommendation.place.name },
      isError: false,
      isLoading: false,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useLikedPlaceDetailQuery>);
    useHomeBottomSheetStore.setState({
      activeSheet: { type: 'likedRecommendation', recommendationId: recommendation.id },
    });

    render(
      <MemoryRouter>
        <HomeBottomSheet
          renderFrequentShops={(headerContent) => <div>{headerContent}</div>}
          renderSelectedPlace={renderSelectedPlace}
          renderSpendingHistory={(headerContent) => <div>{headerContent}</div>}
        />
      </MemoryRouter>
    );

    expect(screen.getByRole('button', { name: '기록하기' })).toBeDisabled();
    expect(screen.queryByRole('link', { name: '기록하기' })).not.toBeInTheDocument();
  });

  it('추천 목록의 관심 버튼은 상세 이동 없이 좋아요를 변경하고 홈 복귀 시 기존 탭을 복원한다', async () => {
    const user = userEvent.setup();
    render(
      <>
        <HomeCategoryFilter />
        <HomeBottomSheet
          renderFrequentShops={(header) => <div>{header}기존 홈 시트</div>}
          renderSelectedPlace={renderSelectedPlace}
          renderSpendingHistory={(header) => <div>{header}</div>}
        />
      </>
    );
    await user.click(screen.getByRole('button', { name: '가게 추천' }));
    const list = screen.getByRole('list', { name: '추천 가게 목록' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(TEST_SHOP_RECOMMENDATIONS.length);
    expect(screen.getByRole('button', { name: '추천 동네 변경' })).toHaveTextContent('서울시 중구');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByText('기존 홈 시트')).not.toBeInTheDocument();
    const first = TEST_SHOP_RECOMMENDATIONS[0]!;
    await user.click(screen.getByRole('button', { name: first.place.name + ' 관심 가게' }));
    expect(mutateLike).toHaveBeenCalledWith({
      placeId: Number(first.id),
      currentLiked: first.isLiked,
    });
    expect(useHomeBottomSheetStore.getState().activeSheet).toEqual({ type: 'recommendation' });
    expect(screen.getByRole('list', { name: '추천 가게 목록' })).toBe(list);
    act(() => useHomeBottomSheetStore.getState().showHome());
    expect(screen.getByText('기존 홈 시트')).toBeInTheDocument();
    expect(screen.queryByRole('list', { name: '추천 가게 목록' })).not.toBeInTheDocument();
  });

  it('추천 카드를 선택하면 새 상세 상태를 열고 목록 복귀 시 필터와 스크롤을 복원한다', async () => {
    const user = userEvent.setup();
    useHomeBottomSheetStore.getState().showRecommendation();
    render(
      <MemoryRouter>
        <HomeBottomSheet
          renderFrequentShops={(header) => <div>{header}</div>}
          renderSelectedPlace={renderSelectedPlace}
          renderSpendingHistory={(header) => <div>{header}</div>}
        />
      </MemoryRouter>
    );
    const category = TEST_SHOP_RECOMMENDATIONS[0]!.place.category;
    await user.click(
      within(screen.getByRole('navigation', { name: '추천 가게 카테고리' })).getByRole('button', {
        name: category,
      })
    );
    const filtered = TEST_SHOP_RECOMMENDATIONS.filter(({ place }) => place.category === category);
    const list = screen.getByRole('list', { name: '추천 가게 목록' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(filtered.length);
    list.parentElement!.scrollTop = 160;
    fireEvent.scroll(list.parentElement!);
    await user.click(screen.getByRole('button', { name: filtered[0]!.place.name + ' 상세 보기' }));
    expect(useHomeBottomSheetStore.getState().activeSheet).toEqual({
      type: 'recommendationPlace',
      recommendationId: filtered[0]!.id,
    });
    expect(mockedUseLikedPlaceDetailQuery).toHaveBeenLastCalledWith(filtered[0]!.id);
    expect(screen.getByRole('link', { name: '기록하기' })).toBeInTheDocument();
    expect(screen.queryByRole('list', { name: '추천 가게 목록' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '바텀시트 높이 조절' })).not.toBeInTheDocument();
    act(() => useHomeBottomSheetStore.getState().showRecommendation());
    expect(useHomeBottomSheetStore.getState().activeSheet).toEqual({ type: 'recommendation' });
    expect(useShopRecommendationStore.getState().selectedCategory).toBe(category);
    expect(screen.getByRole('list', { name: '추천 가게 목록' }).parentElement!.scrollTop).toBe(160);
  });

  it('추천 목록 갱신 후에도 선택한 카테고리와 일치하는 가게만 표시한다', async () => {
    const user = userEvent.setup();
    useHomeBottomSheetStore.getState().showRecommendation();
    const renderContent = () => (
      <HomeBottomSheet
        renderFrequentShops={(header) => <div>{header}</div>}
        renderSelectedPlace={renderSelectedPlace}
        renderSpendingHistory={(header) => <div>{header}</div>}
      />
    );
    const { rerender } = render(renderContent());
    const category = TEST_SHOP_RECOMMENDATIONS[0]!.place.category;
    await user.click(
      within(screen.getByRole('navigation', { name: '추천 가게 카테고리' })).getByRole('button', {
        name: category,
      })
    );
    mockedUseNearbyPlaceRecommendationsQuery.mockReturnValue({
      recommendations: TEST_SHOP_RECOMMENDATIONS.slice(1),
      isPending: false,
      isError: false,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useNearbyPlaceRecommendationsQuery>);
    rerender(renderContent());
    expect(useShopRecommendationStore.getState().selectedCategory).toBe(category);
    expect(
      screen.queryByRole('button', {
        name: TEST_SHOP_RECOMMENDATIONS[0]!.place.name + ' 상세 보기',
      })
    ).not.toBeInTheDocument();
    for (const recommendation of TEST_SHOP_RECOMMENDATIONS.slice(1)) {
      const card = screen.queryByRole('button', { name: recommendation.place.name + ' 상세 보기' });
      if (recommendation.place.category === category) expect(card).toBeInTheDocument();
      else expect(card).not.toBeInTheDocument();
    }
  });

  it('동네 설정 전에는 고정 카드를 표시하고 설정 후 추천 바텀시트로 전환한다', async () => {
    useHomeBottomSheetStore.getState().showRecommendation();
    jest.mocked(useRecommendationNeighborhood).mockReturnValue({
      hasNeighborhood: false,
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useRecommendationNeighborhood>);
    const onOpenRecommendationSearch = jest.fn();
    const view = () => (
      <HomeBottomSheet
        onOpenRecommendationSearch={onOpenRecommendationSearch}
        renderFrequentShops={(header) => <div>{header}</div>}
        renderSelectedPlace={renderSelectedPlace}
        renderSpendingHistory={(header) => <div>{header}</div>}
      />
    );
    const { rerender } = render(view());
    expect(screen.getByRole('region', { name: '추천 동네 설정 안내' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '바텀시트 높이 조절' })).not.toBeInTheDocument();
    expect(screen.queryByRole('list', { name: '추천 가게 목록' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: '동네 설정하기' }));
    expect(onOpenRecommendationSearch).toHaveBeenCalledTimes(1);
    jest.mocked(useRecommendationNeighborhood).mockReturnValue({
      hasNeighborhood: true,
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useRecommendationNeighborhood>);
    rerender(view());
    expect(screen.queryByRole('region', { name: '추천 동네 설정 안내' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '바텀시트 높이 조절' })).toBeInTheDocument();
    expect(screen.getByRole('list', { name: '추천 가게 목록' })).toBeInTheDocument();
  });

  it('홈 시트에서 핸들을 클릭하면 단계가 순환한다', () => {
    const { container } = render(
      <HomeBottomSheet
        renderFrequentShops={(headerContent) => <div>{headerContent}</div>}
        renderSelectedPlace={renderSelectedPlace}
        renderSpendingHistory={(headerContent) => <div>{headerContent}</div>}
      />
    );
    const handle = screen.getByRole('button', { name: '바텀시트 높이 조절' });
    const sheet = handle.parentElement as HTMLElement;

    expect(sheet).toHaveStyle({ height: '45dvh' });
    expect(container.querySelector('[data-slot="overlay"]')).not.toBeInTheDocument();

    fireEvent.click(handle);

    expect(sheet).toHaveStyle({ height: 'calc(100dvh - 12px)' });
    expect(container.querySelector('[data-slot="overlay"]')).toHaveClass(
      'bg-neutral-900/20',
      'z-modal-backdrop'
    );

    fireEvent.click(handle);

    expect(sheet).toHaveStyle({ height: '45dvh' });
    expect(container.querySelector('[data-slot="overlay"]')).not.toBeInTheDocument();

    fireEvent.click(handle);

    expect(sheet).toHaveStyle({ height: '0px' });
    expect(sheet).toHaveAttribute('inert');
    // 닫히는 동안 목록을 먼저 제거하지 않고 시트와 함께 이동시킨다.
    expect(sheet.querySelector('[hidden=""]')).toBeInTheDocument();
    expect(sheet.querySelectorAll('[hidden=""]')).toHaveLength(1);
    expect(container.querySelector('[data-slot="overlay"]')).not.toBeInTheDocument();
  });

  it.each([
    { topActionBottomPx: 0, boundaryPx: 72 },
    { topActionBottomPx: 40, boundaryPx: 72 },
    { topActionBottomPx: 96, boundaryPx: 108 },
  ])(
    '추천 목록은 닫기 버튼을 가리지 않는 상단 경계 $boundaryPx px까지 확장하고 다시 축소한다 (버튼 하단 $topActionBottomPx px)',
    ({ topActionBottomPx, boundaryPx }) => {
      useHomeBottomSheetStore.setState({ topActionBottomPx });
      useHomeBottomSheetStore.getState().showRecommendation();
      render(
        <HomeBottomSheet
          renderFrequentShops={(header) => <div>{header}</div>}
          renderSelectedPlace={renderSelectedPlace}
          renderSpendingHistory={(header) => <div>{header}</div>}
        />
      );
      const handle = screen.getByRole('button', { name: '바텀시트 높이 조절' });
      const sheet = handle.parentElement!;
      expect(sheet).toHaveStyle({ height: '45dvh' });
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      fireEvent.click(handle);
      expect(sheet).toHaveStyle({ height: `calc(100dvh - ${boundaryPx}px)` });
      expect(useHomeBottomSheetStore.getState().activeSheet).toEqual({ type: 'recommendation' });
      fireEvent.click(handle);
      expect(sheet).toHaveStyle({ height: '45dvh' });
      expect(screen.getByRole('list', { name: '추천 가게 목록' })).toBeInTheDocument();
    }
  );

  it('모달형 시트가 열려 있을 때 Escape를 누르면 홈 시트로 돌아간다', async () => {
    render(
      <>
        <HomeCategoryFilter />
        <HomeBottomSheet
          renderFrequentShops={(headerContent) => (
            <div>
              {headerContent}
              기존 홈 시트
            </div>
          )}
          renderSelectedPlace={renderSelectedPlace}
          renderSpendingHistory={(headerContent) => <div>{headerContent}</div>}
        />
      </>
    );

    act(() => useHomeBottomSheetStore.getState().showSelectedPlace(TEST_MAP_STICKERS[0]!.id));
    expect(screen.getByRole('dialog', { name: '선택한 가게 정보' })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(screen.getByText('기존 홈 시트')).toBeInTheDocument();
  });

  it('추천 상세에서 Escape를 누르면 목록으로, 목록에서 누르면 홈으로 돌아간다', () => {
    const recommendationId = TEST_SHOP_RECOMMENDATIONS[0]!.id;
    useHomeBottomSheetStore.getState().showRecommendation();
    render(
      <MemoryRouter>
        <HomeBottomSheet
          renderFrequentShops={(header) => <div>{header}</div>}
          renderSelectedPlace={renderSelectedPlace}
          renderSpendingHistory={(header) => <div>{header}</div>}
        />
      </MemoryRouter>
    );
    act(() => useHomeBottomSheetStore.getState().showRecommendationPlace(recommendationId));

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(useHomeBottomSheetStore.getState().activeSheet).toEqual({ type: 'recommendation' });

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(useHomeBottomSheetStore.getState().activeSheet).toEqual({ type: 'home' });
  });

  it('시트 전체를 재마운트하지 않고 콘텐츠만 fade로 전환한다', async () => {
    const originalRequestAnimationFrame = window.requestAnimationFrame;
    const originalCancelAnimationFrame = window.cancelAnimationFrame;
    let animationFrameCallback: FrameRequestCallback | undefined;
    window.requestAnimationFrame = jest.fn((callback: FrameRequestCallback) => {
      animationFrameCallback = callback;
      return 1;
    });
    window.cancelAnimationFrame = jest.fn();

    try {
      render(
        <>
          <HomeCategoryFilter />
          <HomeBottomSheet
            renderFrequentShops={(headerContent) => <div>{headerContent}</div>}
            renderSelectedPlace={renderSelectedPlace}
            renderSpendingHistory={(headerContent) => <div>{headerContent}</div>}
          />
        </>
      );
      const bottomSheet = screen.getByRole('button', { name: '바텀시트 높이 조절' }).parentElement;

      act(() => useHomeBottomSheetStore.getState().showSelectedPlace(TEST_MAP_STICKERS[0]!.id));

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveClass('opacity-0');
      expect(screen.getByRole('button', { name: '바텀시트 높이 조절' }).parentElement).toBe(
        bottomSheet
      );

      act(() => animationFrameCallback?.(0));
      await waitFor(() => expect(dialog).toHaveClass('opacity-100'));
    } finally {
      window.requestAnimationFrame = originalRequestAnimationFrame;
      window.cancelAnimationFrame = originalCancelAnimationFrame;
    }
  });
});
