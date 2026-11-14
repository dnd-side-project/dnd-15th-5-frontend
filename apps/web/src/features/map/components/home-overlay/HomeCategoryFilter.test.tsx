import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useVisitedPlaceStickersQuery } from '@/features/map/apis/hooks/useVisitedPlaceStickersQuery';

import { useHomeBottomSheetStore } from '../../stores/homeBottomSheetStore';
import { useMapCategoryFilterStore } from '../../stores/mapCategoryFilterStore';
import { TEST_SHOP_RECOMMENDATIONS } from '../../testFixtures';

import HomeCategoryFilter from './HomeCategoryFilter';

jest.mock('@/features/map/apis/hooks/useVisitedPlaceStickersQuery');

const mockedUseVisitedPlaceStickersQuery = jest.mocked(useVisitedPlaceStickersQuery);

describe('HomeCategoryFilter', () => {
  beforeEach(() => {
    useHomeBottomSheetStore.setState({ activeSheet: { type: 'home' }, stepIndex: 0 });
    useMapCategoryFilterStore.setState({ selectedCategory: null });
    mockedUseVisitedPlaceStickersQuery.mockReturnValue({
      isSuccess: false,
      stickers: [],
    } as unknown as ReturnType<typeof useVisitedPlaceStickersQuery>);
  });

  it('가게 추천은 검색으로 바로 이동하지 않고 동네 복원을 위한 추천 모드를 연다', async () => {
    render(<HomeCategoryFilter />);
    await userEvent.click(screen.getByRole('button', { name: '가게 추천' }));
    expect(useHomeBottomSheetStore.getState().activeSheet).toEqual({ type: 'recommendation' });
  });

  it('선택한 카테고리 칩을 다시 누르면 비활성화한다', async () => {
    const user = userEvent.setup();
    render(<HomeCategoryFilter />);
    const cafeChip = screen.getByRole('button', { name: '카페' });

    await user.click(cafeChip);
    expect(cafeChip).toHaveAttribute('aria-pressed', 'true');
    expect(useMapCategoryFilterStore.getState().selectedCategory).toBe('카페');

    await user.click(cafeChip);
    expect(cafeChip).toHaveAttribute('aria-pressed', 'false');
    expect(useMapCategoryFilterStore.getState().selectedCategory).toBeNull();
  });

  it('방문 장소 조회가 완료되면 목록이 있는 카테고리만 표시한다', () => {
    mockedUseVisitedPlaceStickersQuery.mockReturnValue({
      isSuccess: true,
      stickers: [{ place: { category: '카페' } }],
    } as unknown as ReturnType<typeof useVisitedPlaceStickersQuery>);

    render(<HomeCategoryFilter />);

    expect(screen.getByRole('button', { name: '카페' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '운동' })).not.toBeInTheDocument();
  });

  it('선택된 카테고리가 목록에서 사라지면 필터를 해제한다', () => {
    useMapCategoryFilterStore.setState({ selectedCategory: '운동' });
    mockedUseVisitedPlaceStickersQuery.mockReturnValue({
      isSuccess: true,
      stickers: [{ place: { category: '카페' } }],
    } as unknown as ReturnType<typeof useVisitedPlaceStickersQuery>);

    render(<HomeCategoryFilter />);

    expect(useMapCategoryFilterStore.getState().selectedCategory).toBeNull();
  });

  it('응답을 받은 뒤 선택 장소의 지도 카테고리에 맞춰 필터를 바꾼다', async () => {
    const user = userEvent.setup();
    const recommendation = {
      ...TEST_SHOP_RECOMMENDATIONS[0]!,
      isLiked: true,
      place: { ...TEST_SHOP_RECOMMENDATIONS[0]!.place, category: '기타' as const },
    };
    useHomeBottomSheetStore.getState().showLikedRecommendation(recommendation.id);
    const { rerender } = render(<HomeCategoryFilter />);
    expect(useMapCategoryFilterStore.getState().selectedCategory).toBeNull();

    // 다른 카페가 응답에 있어도 선택 장소의 '기타' 카테고리를 따라야 한다.
    mockedUseVisitedPlaceStickersQuery.mockReturnValue({
      isSuccess: true,
      stickers: [{ place: { category: '카페' } }],
      likedRecommendations: [recommendation],
    } as unknown as ReturnType<typeof useVisitedPlaceStickersQuery>);
    act(() => useMapCategoryFilterStore.setState({ selectedCategory: '카페' }));
    rerender(<HomeCategoryFilter />);

    expect(screen.getByRole('button', { name: '기타' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: '카페' })).toHaveAttribute('aria-pressed', 'false');

    await user.click(screen.getByRole('button', { name: '카페' }));
    expect(useHomeBottomSheetStore.getState().activeSheet.type).toBe('home');
    expect(useMapCategoryFilterStore.getState().selectedCategory).toBe('카페');
  });
});
