import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useNearbyPlaceRecommendationsQuery } from '@/features/map/apis/hooks/useNearbyPlaceRecommendationsQuery';
import { useRecommendationNeighborhood } from '@/features/map/apis/hooks/useRecommendationNeighborhood';
import { useTogglePlaceLikeMutation } from '@/features/map/apis/hooks/useTogglePlaceLikeMutation';
import { useHomeBottomSheetStore } from '@/features/map/stores/homeBottomSheetStore';
import { useLocationSelectionStore } from '@/features/map/stores/locationSelectionStore';
import { useShopRecommendationStore } from '@/features/map/stores/shopRecommendationStore';
import { TEST_SHOP_RECOMMENDATIONS } from '@/features/map/testFixtures';

import ShopRecommendationSheet from './ShopRecommendationSheet';

jest.mock('@/features/map/apis/hooks/useNearbyPlaceRecommendationsQuery');
jest.mock('@/features/map/apis/hooks/useTogglePlaceLikeMutation');
jest.mock('@/features/map/apis/hooks/useRecommendationNeighborhood');
jest.mock('./RecommendationAddressHint', () => () => null);

const mutate = jest.fn();
beforeEach(() => {
  jest.clearAllMocks();
  useHomeBottomSheetStore.setState({ activeSheet: { type: 'recommendation' } });
  useShopRecommendationStore.setState(useShopRecommendationStore.getInitialState());
  useLocationSelectionStore.setState(useLocationSelectionStore.getInitialState());
  useLocationSelectionStore.getState().setConfirmedNeighborhood({
    address: '서울 성동구 성수동',
    position: { lat: 37.54, lng: 127.05 },
  });
  jest
    .mocked(useRecommendationNeighborhood)
    .mockReturnValue({ hasNeighborhood: true, isLoading: false, isError: false } as ReturnType<
      typeof useRecommendationNeighborhood
    >);
  jest.mocked(useNearbyPlaceRecommendationsQuery).mockReturnValue({
    recommendations: TEST_SHOP_RECOMMENDATIONS,
    isPending: false,
    isError: false,
  } as ReturnType<typeof useNearbyPlaceRecommendationsQuery>);
  jest
    .mocked(useTogglePlaceLikeMutation)
    .mockReturnValue({ mutate, isPending: false } as unknown as ReturnType<
      typeof useTogglePlaceLikeMutation
    >);
});

it('추천 결과가 있는 카테고리만 홈 순서로 표시하며 필터를 선택해도 다른 칩을 유지한다', async () => {
  jest.mocked(useNearbyPlaceRecommendationsQuery).mockReturnValue({
    recommendations: [...TEST_SHOP_RECOMMENDATIONS].reverse(),
    isPending: false,
    isError: false,
  } as ReturnType<typeof useNearbyPlaceRecommendationsQuery>);
  render(<ShopRecommendationSheet />);
  const navigation = within(screen.getByRole('navigation', { name: '추천 가게 카테고리' }));
  expect(navigation.getAllByRole('button').map((button) => button.textContent)).toEqual([
    '전체',
    '카페',
    '취미/놀거리',
  ]);
  await userEvent.click(navigation.getByRole('button', { name: '카페' }));
  expect(navigation.getByRole('button', { name: '취미/놀거리' })).toBeInTheDocument();
  expect(navigation.queryByRole('button', { name: '쇼핑' })).not.toBeInTheDocument();
});

it.each([
  { isPending: true, isError: false },
  { isPending: false, isError: true },
])(
  '로딩·오류 중에는 선택을 유지하고 성공한 결과에서 카테고리가 사라지면 전체로 복귀한다 (%j)',
  (status) => {
    useShopRecommendationStore.setState({ selectedCategory: '카페', listScrollTop: 100 });
    jest.mocked(useNearbyPlaceRecommendationsQuery).mockReturnValue({
      recommendations: [],
      ...status,
    } as ReturnType<typeof useNearbyPlaceRecommendationsQuery>);
    const { rerender } = render(<ShopRecommendationSheet />);
    expect(useShopRecommendationStore.getState().selectedCategory).toBe('카페');

    const remaining = TEST_SHOP_RECOMMENDATIONS.filter(({ place }) => place.category !== '카페');
    jest.mocked(useNearbyPlaceRecommendationsQuery).mockReturnValue({
      recommendations: remaining,
      isPending: false,
      isError: false,
    } as ReturnType<typeof useNearbyPlaceRecommendationsQuery>);
    rerender(<ShopRecommendationSheet />);
    expect(useShopRecommendationStore.getState().selectedCategory).toBeNull();
    expect(useShopRecommendationStore.getState().listScrollTop).toBe(0);
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getAllByRole('listitem')).toHaveLength(remaining.length);
  }
);

it('추천 결과가 없으면 전체 칩을 유지하고 빈 목록을 안내한다', () => {
  jest.mocked(useNearbyPlaceRecommendationsQuery).mockReturnValue({
    recommendations: [],
    isPending: false,
    isError: false,
  } as ReturnType<typeof useNearbyPlaceRecommendationsQuery>);
  render(<ShopRecommendationSheet />);
  const navigation = within(screen.getByRole('navigation', { name: '추천 가게 카테고리' }));
  expect(navigation.getAllByRole('button')).toHaveLength(1);
  expect(navigation.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByText('아직 추천 가게가 없어요')).toBeInTheDocument();
});

it('쇼핑 칩을 선택하면 쇼핑 가게만 표시하고 선택 상태를 유지한다', async () => {
  const shopping = {
    ...TEST_SHOP_RECOMMENDATIONS[0]!,
    id: 'shopping-store',
    place: {
      ...TEST_SHOP_RECOMMENDATIONS[0]!.place,
      id: 'shopping-store',
      name: '동네 쇼핑 가게',
      category: '쇼핑' as const,
    },
  };
  jest.mocked(useNearbyPlaceRecommendationsQuery).mockReturnValue({
    recommendations: [...TEST_SHOP_RECOMMENDATIONS, shopping],
    isPending: false,
    isError: false,
  } as ReturnType<typeof useNearbyPlaceRecommendationsQuery>);
  render(<ShopRecommendationSheet />);
  await userEvent.click(screen.getByRole('button', { name: '쇼핑' }));
  expect(screen.getByRole('button', { name: '쇼핑' })).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getAllByRole('listitem')).toHaveLength(1);
  expect(screen.getByRole('button', { name: '동네 쇼핑 가게 상세 보기' })).toBeInTheDocument();
  expect(useShopRecommendationStore.getState().selectedCategory).toBe('쇼핑');
});

it('등록한 동네가 없으면 위치 설정을 안내하고 추천 조회는 하지 않는다', async () => {
  jest
    .mocked(useRecommendationNeighborhood)
    .mockReturnValue({ hasNeighborhood: false, isLoading: false, isError: false } as ReturnType<
      typeof useRecommendationNeighborhood
    >);
  const onOpenRecommendationSearch = jest.fn();
  render(<ShopRecommendationSheet onOpenRecommendationSearch={onOpenRecommendationSearch} />);
  await userEvent.click(screen.getByRole('button', { name: '동네 설정하기' }));
  expect(onOpenRecommendationSearch).toHaveBeenCalledTimes(1);
  expect(useNearbyPlaceRecommendationsQuery).not.toHaveBeenCalled();
});

it('동네 로딩 중에는 최초 진입 안내나 추천 목록을 먼저 표시하지 않는다', () => {
  jest
    .mocked(useRecommendationNeighborhood)
    .mockReturnValue({ hasNeighborhood: false, isLoading: true, isError: false } as ReturnType<
      typeof useRecommendationNeighborhood
    >);
  render(<ShopRecommendationSheet />);
  expect(screen.getByRole('status', { name: '설정한 동네 불러오는 중' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: '동네 설정하기' })).not.toBeInTheDocument();
  expect(useNearbyPlaceRecommendationsQuery).not.toHaveBeenCalled();
});

it('추천 카드 선택은 일반 가게도 상세 상태로 전환하고 필터와 스크롤을 복원한다', async () => {
  const first = TEST_SHOP_RECOMMENDATIONS[0]!;
  useShopRecommendationStore.setState({
    selectedCategory: first.place.category,
    listScrollTop: 90,
  });
  const { unmount } = render(<ShopRecommendationSheet />);
  const list = screen.getByRole('list', { name: '추천 가게 목록' }).parentElement!;
  expect(list.scrollTop).toBe(90);
  list.scrollTop = 140;
  fireEvent.scroll(list);
  await userEvent.click(screen.getByRole('button', { name: `${first.place.name} 상세 보기` }));
  expect(useHomeBottomSheetStore.getState().activeSheet).toEqual({
    type: 'recommendationPlace',
    recommendationId: first.id,
  });
  expect(useShopRecommendationStore.getState().activeRecommendationId).toBe(first.id);
  unmount();
  useHomeBottomSheetStore.getState().showRecommendation();
  render(<ShopRecommendationSheet />);
  expect(screen.getByRole('list', { name: '추천 가게 목록' }).parentElement?.scrollTop).toBe(140);
  expect(screen.getByRole('button', { name: first.place.category })).toHaveAttribute(
    'aria-pressed',
    'true'
  );
});

it('목록의 좋아요는 상세를 열지 않고 mutation만 실행한다', async () => {
  render(<ShopRecommendationSheet />);
  const first = TEST_SHOP_RECOMMENDATIONS[0]!;
  await userEvent.click(screen.getByRole('button', { name: `${first.place.name} 관심 가게` }));
  expect(mutate).toHaveBeenCalledWith({ placeId: Number(first.id), currentLiked: first.isLiked });
  expect(useHomeBottomSheetStore.getState().activeSheet).toEqual({ type: 'recommendation' });
});

it('카테고리를 바꾸면 해당 가게만 표시하고 새 목록은 맨 위에서 시작한다', async () => {
  const first = TEST_SHOP_RECOMMENDATIONS[0]!;
  useShopRecommendationStore.setState({ listScrollTop: 100 });
  render(<ShopRecommendationSheet />);
  await userEvent.click(screen.getByRole('button', { name: first.place.category }));
  const cards = screen.getAllByRole('listitem');
  expect(cards).toHaveLength(
    TEST_SHOP_RECOMMENDATIONS.filter(({ place }) => place.category === first.place.category).length
  );
  expect(useShopRecommendationStore.getState().listScrollTop).toBe(0);
});

it('이미 선택된 전체 칩을 다시 눌러도 저장된 목록 스크롤을 유지한다', async () => {
  useShopRecommendationStore.setState({ listScrollTop: 120 });
  render(<ShopRecommendationSheet />);
  await userEvent.click(screen.getByRole('button', { name: '전체' }));
  expect(useShopRecommendationStore.getState().listScrollTop).toBe(120);
});

it('재조회 오류가 끝나 목록이 다시 나타나면 오류 전 스크롤 위치를 복원한다', () => {
  useShopRecommendationStore.setState({ listScrollTop: 150 });
  const { rerender } = render(<ShopRecommendationSheet />);
  const list = screen.getByRole('list', { name: '추천 가게 목록' }).parentElement!;
  expect(list.scrollTop).toBe(150);

  jest.mocked(useNearbyPlaceRecommendationsQuery).mockReturnValue({
    recommendations: TEST_SHOP_RECOMMENDATIONS,
    isPending: false,
    isError: true,
  } as ReturnType<typeof useNearbyPlaceRecommendationsQuery>);
  rerender(<ShopRecommendationSheet />);
  list.scrollTop = 0;
  fireEvent.scroll(list);
  expect(useShopRecommendationStore.getState().listScrollTop).toBe(150);

  jest.mocked(useNearbyPlaceRecommendationsQuery).mockReturnValue({
    recommendations: TEST_SHOP_RECOMMENDATIONS,
    isPending: false,
    isError: false,
  } as ReturnType<typeof useNearbyPlaceRecommendationsQuery>);
  rerender(<ShopRecommendationSheet />);
  expect(list.scrollTop).toBe(150);
});

it('동네 변경 버튼은 검색 화면을 요청한다', async () => {
  const onOpenRecommendationSearch = jest.fn();
  render(<ShopRecommendationSheet onOpenRecommendationSearch={onOpenRecommendationSearch} />);
  expect(screen.getByRole('button', { name: '추천 동네 변경' })).toHaveTextContent(
    '서울 성동구 성수동'
  );
  await userEvent.click(screen.getByRole('button', { name: '추천 동네 변경' }));
  expect(onOpenRecommendationSearch).toHaveBeenCalledTimes(1);
});
