import { fireEvent, render, screen } from '@testing-library/react';
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

it('동네 변경 버튼은 검색 화면을 요청한다', async () => {
  const onOpenRecommendationSearch = jest.fn();
  render(<ShopRecommendationSheet onOpenRecommendationSearch={onOpenRecommendationSearch} />);
  expect(screen.getByRole('button', { name: '추천 동네 변경' })).toHaveTextContent(
    '서울 성동구 성수동'
  );
  await userEvent.click(screen.getByRole('button', { name: '추천 동네 변경' }));
  expect(onOpenRecommendationSearch).toHaveBeenCalledTimes(1);
});
