import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useHomeBottomSheetStore } from '../../stores/homeBottomSheetStore';
import { useMapCategoryFilterStore } from '../../stores/mapCategoryFilterStore';

import HomeCategoryFilter from './HomeCategoryFilter';

describe('HomeCategoryFilter', () => {
  beforeEach(() => {
    useHomeBottomSheetStore.setState({ activeSheet: { type: 'home' }, stepIndex: 0 });
    useMapCategoryFilterStore.setState({ selectedCategory: null });
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
});
