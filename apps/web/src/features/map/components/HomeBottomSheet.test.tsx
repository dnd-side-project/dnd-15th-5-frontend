import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { useNearbyPlaceRecommendationsQuery } from '@/features/map/apis/hooks/useNearbyPlaceRecommendationsQuery';
import { useTogglePlaceLikeMutation } from '@/features/map/apis/hooks/useTogglePlaceLikeMutation';
import { useHomeBottomSheetStore } from '@/features/map/stores/homeBottomSheetStore';
import { useShopRecommendationStore } from '@/features/map/stores/shopRecommendationStore';
import { TEST_MAP_STICKERS, TEST_SHOP_RECOMMENDATIONS } from '@/features/map/testFixtures';

import HomeCategoryFilter from './home-overlay/HomeCategoryFilter';
import HomeBottomSheet from './HomeBottomSheet';

jest.mock('@/features/map/apis/hooks/useNearbyPlaceRecommendationsQuery');
jest.mock('@/features/map/apis/hooks/useTogglePlaceLikeMutation');

const mockedUseNearbyPlaceRecommendationsQuery = jest.mocked(useNearbyPlaceRecommendationsQuery);
const mockedUseTogglePlaceLikeMutation = jest.mocked(useTogglePlaceLikeMutation);
const mutateLike = jest.fn();

const renderSelectedPlace = () => (
  <section>
    <h2>{TEST_MAP_STICKERS[0]!.place.name}</h2>
    <p>{TEST_MAP_STICKERS[0]!.place.address}</p>
    <a href={`/home/shop/${TEST_MAP_STICKERS[0]!.place.id}`}>상세보기</a>
  </section>
);

describe('HomeBottomSheet', () => {
  beforeEach(() => {
    useHomeBottomSheetStore.setState({
      activeSheet: { type: 'home' },
      stepIndex: 0,
      topActionBottomPx: 0,
      visibleHeightPx: 0,
    });
    useShopRecommendationStore.setState({
      activeRecommendationId: null,
    });
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
    mockedUseTogglePlaceLikeMutation.mockReturnValue({
      mutate: mutateLike,
      isPending: false,
    } as unknown as ReturnType<typeof useTogglePlaceLikeMutation>);
  });

  it('최대 높이에서 마이페이지 버튼 아래에 12px 간격을 유지한다', () => {
    useHomeBottomSheetStore.setState({ stepIndex: 1, topActionBottomPx: 96 });
    render(
      <HomeBottomSheet
        renderFrequentShops={(headerContent) => <div>{headerContent}</div>}
        renderSelectedPlace={renderSelectedPlace}
        renderSpendingHistory={(headerContent) => <div>{headerContent}</div>}
      />
    );

    const sheet = screen.getByRole('button', { name: '바텀시트 높이 조절' })
      .parentElement as HTMLElement;

    expect(sheet).toHaveStyle({ height: 'calc(100dvh - 108px)' });
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
    expect(screen.getByText(selectedSticker.place.address)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '상세보기' })).toHaveAttribute(
      'href',
      `/home/shop/${selectedSticker.place.id}`
    );
    expect(screen.queryByRole('button', { name: '자주 소비한 곳' })).not.toBeInTheDocument();
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
      likedPlaceHeading.closest('section')?.querySelector('span[aria-hidden="true"]')
    ).toHaveClass('size-22.5', 'rounded-12');
    const googleMapsLink = screen.getByRole('link', { name: '지도앱에서 확인하기' });
    expect(googleMapsLink).toHaveAttribute('href', recommendation.googleMapsUri);
    expect(
      within(googleMapsLink.parentElement as HTMLElement).getByText(recommendation.place.name)
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '기록하기' })).toHaveAttribute('href', '/record');
    expect(screen.queryByText('기존 홈 시트')).not.toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: `${recommendation.place.name} 좋아요 해제` })
    );

    expect(mutateLike).toHaveBeenCalledWith(
      { placeId: Number(recommendation.id) },
      expect.objectContaining({ onSuccess: expect.any(Function) })
    );
    expect(screen.getByText('기존 홈 시트')).toBeInTheDocument();
    expect(useHomeBottomSheetStore.getState().activeSheet).toEqual({ type: 'home' });
  });

  it('조회에 성공했지만 선택한 추천이 없으면 재요청 대신 지도 홈으로 돌아간다', async () => {
    const user = userEvent.setup();
    useHomeBottomSheetStore.setState({
      activeSheet: { type: 'likedRecommendation', recommendationId: 'missing-recommendation' },
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

    expect(
      screen.getByRole('heading', { level: 1, name: '선택한 가게를 찾을 수 없어요' })
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '다시 불러오기' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '지도 홈으로' }));

    expect(screen.getByText('기존 홈 시트')).toBeInTheDocument();
    expect(useHomeBottomSheetStore.getState().activeSheet).toEqual({ type: 'home' });
  });

  it('가게 추천 칩을 다시 누르면 추천 시트를 닫고 기존 홈 시트를 복원한다', async () => {
    const user = userEvent.setup();
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

    await user.click(screen.getByRole('button', { name: '가게 추천' }));

    expect(screen.getByRole('heading', { level: 1, name: '가게 추천' })).toBeInTheDocument();
    expect(screen.getByRole('list', { name: '추천 가게 목록' })).toBeInTheDocument();
    expect(screen.getAllByText('나의 관심 카테고리')).toHaveLength(2);
    expect(screen.getAllByText('내 동네에서 많이 방문한 곳')).toHaveLength(2);
    expect(screen.queryByText('기존 홈 시트')).not.toBeInTheDocument();
    const firstRecommendation = TEST_SHOP_RECOMMENDATIONS[0]!;
    const likeButton = screen.getByRole('button', {
      name: `${firstRecommendation.place.name} 관심 가게`,
    });
    await user.click(likeButton);
    expect(mutateLike).toHaveBeenCalledWith({ placeId: Number(firstRecommendation.id) });

    const googleMapsLink = screen.getByRole('link', {
      name: `${firstRecommendation.place.name} 지도앱에서 확인하기`,
    });
    expect(googleMapsLink).toHaveAttribute('href', firstRecommendation.googleMapsUri);

    const carousel = screen.getByRole('list', { name: '추천 가게 목록' });
    Object.defineProperty(carousel.firstElementChild, 'offsetWidth', {
      configurable: true,
      value: 320,
    });
    carousel.scrollLeft = 332;
    fireEvent.scroll(carousel);
    expect(useShopRecommendationStore.getState().activeRecommendationId).toBe(
      TEST_SHOP_RECOMMENDATIONS[1]!.id
    );

    await user.click(screen.getByRole('button', { name: '가게 추천' }));

    expect(screen.getByRole('button', { name: '가게 추천' })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
    expect(screen.getByText('기존 홈 시트')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 1, name: '가게 추천' })).not.toBeInTheDocument();
  });

  it('지도에서 먼 추천 마커를 선택해 캐러셀을 이동할 때 중간 카드로 선택을 덮어쓰지 않는다', async () => {
    const user = userEvent.setup();
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

    await user.click(screen.getByRole('button', { name: '가게 추천' }));
    const carousel = screen.getByRole('list', { name: '추천 가게 목록' });
    Object.defineProperty(carousel.firstElementChild, 'offsetWidth', {
      configurable: true,
      value: 320,
    });
    const scrollTo = jest.fn();
    carousel.scrollTo = scrollTo;
    const lastRecommendation = TEST_SHOP_RECOMMENDATIONS.at(-1);
    expect(lastRecommendation).toBeDefined();

    act(() => {
      useShopRecommendationStore.getState().setActiveRecommendation(lastRecommendation?.id ?? '');
    });

    expect(scrollTo).toHaveBeenCalledWith({ left: 996, behavior: 'smooth' });
    carousel.scrollLeft = 332;
    fireEvent.scroll(carousel);

    expect(useShopRecommendationStore.getState().activeRecommendationId).toBe(
      lastRecommendation?.id
    );
  });

  it('홈 시트에서 핸들을 클릭하면 단계가 순환한다', () => {
    render(
      <HomeBottomSheet
        renderFrequentShops={(headerContent) => <div>{headerContent}</div>}
        renderSelectedPlace={renderSelectedPlace}
        renderSpendingHistory={(headerContent) => <div>{headerContent}</div>}
      />
    );
    const handle = screen.getByRole('button', { name: '바텀시트 높이 조절' });
    const sheet = handle.parentElement as HTMLElement;

    expect(sheet).toHaveStyle({ height: '45dvh' });

    fireEvent.click(handle);

    expect(sheet).toHaveStyle({ height: '92dvh' });
  });

  it('모달형 시트에서 핸들을 클릭하면 홈 시트로 돌아간다', async () => {
    const user = userEvent.setup();
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

    await user.click(screen.getByRole('button', { name: '가게 추천' }));
    expect(screen.getByRole('dialog', { name: '가게 추천' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: '가게 추천' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '바텀시트 높이 조절' }));

    expect(screen.getByText('기존 홈 시트')).toBeInTheDocument();
    expect(useHomeBottomSheetStore.getState().activeSheet).toEqual({ type: 'home' });
  });

  it('모달형 시트가 열려 있을 때 Escape를 누르면 홈 시트로 돌아간다', async () => {
    const user = userEvent.setup();
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

    await user.click(screen.getByRole('button', { name: '가게 추천' }));
    expect(screen.getByRole('heading', { level: 1, name: '가게 추천' })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(screen.getByText('기존 홈 시트')).toBeInTheDocument();
  });

  it('시트 전체를 재마운트하지 않고 콘텐츠만 fade로 전환한다', async () => {
    const user = userEvent.setup();
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

    await user.click(screen.getByRole('button', { name: '가게 추천' }));

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveClass('opacity-0');
    expect(screen.getByRole('button', { name: '바텀시트 높이 조절' }).parentElement).toBe(
      bottomSheet
    );

    await waitFor(() => expect(dialog).toHaveClass('opacity-100'));
  });
});
