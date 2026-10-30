import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useVisitedPlaceStickersQuery } from '@/features/map/apis/hooks/useVisitedPlaceStickersQuery';

import { useHomeBottomSheetStore } from '../../stores/homeBottomSheetStore';
import { useMapCategoryFilterStore } from '../../stores/mapCategoryFilterStore';

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
});
