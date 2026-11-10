import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { useVisitedPlaceStickersQuery } from '@/features/map/apis/hooks/useVisitedPlaceStickersQuery';
import { useHomeBottomSheetStore } from '@/features/map/stores/homeBottomSheetStore';
import { useMapCategoryFilterStore } from '@/features/map/stores/mapCategoryFilterStore';

import HomeMapOverlay from './HomeMapOverlay';

jest.mock('@/features/map/apis/hooks/useVisitedPlaceStickersQuery');

const mockedUseVisitedPlaceStickersQuery = jest.mocked(useVisitedPlaceStickersQuery);

describe('HomeMapOverlay', () => {
  beforeEach(() => {
    useHomeBottomSheetStore.setState({
      activeSheet: { type: 'home' },
      stepIndex: 0,
      topActionBottomPx: 0,
    });
    useMapCategoryFilterStore.setState({ selectedCategory: null });
    mockedUseVisitedPlaceStickersQuery.mockReturnValue({
      monthlyPlaceCount: 7,
    } as unknown as ReturnType<typeof useVisitedPlaceStickersQuery>);
  });

  it('지도는 가리지 않으면서 상단 UI를 Safe Area 아래에 배치한다', () => {
    const { container } = render(
      <MemoryRouter>
        <HomeMapOverlay hasUnreadNotification={false} />
      </MemoryRouter>
    );
    const overlay = container.firstChild as HTMLElement;

    expect(overlay).toHaveClass('fixed', 'top-0', 'pt-[env(safe-area-inset-top)]');
  });

  it('마이페이지 버튼의 화면상 아래 위치를 바텀시트 경계로 저장한다', () => {
    const boundingClientRectSpy = jest
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockReturnValue({
        bottom: 96,
        height: 32,
        left: 432,
        right: 464,
        top: 64,
        width: 32,
        x: 432,
        y: 64,
        toJSON: () => ({}),
      });

    render(
      <MemoryRouter>
        <HomeMapOverlay hasUnreadNotification={false} />
      </MemoryRouter>
    );

    expect(useHomeBottomSheetStore.getState().topActionBottomPx).toBe(96);
    boundingClientRectSpy.mockRestore();
  });

  it('최대 확장에서 칩만 숨기고 내리면 카테고리 선택과 가로 스크롤을 복원한다', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <HomeMapOverlay hasUnreadNotification={false} />
      </MemoryRouter>
    );
    const filter = screen.getByRole('group', { name: '가게 추천 및 카테고리 필터' });
    filter.scrollLeft = 100;
    await user.click(screen.getByRole('button', { name: '카페' }));

    act(() => useHomeBottomSheetStore.getState().setSnapPoint('full'));

    expect(filter).not.toBeVisible();
    expect(screen.queryByRole('button', { name: '카페' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: '장소 검색' })).toBeVisible();
    expect(screen.getByRole('link', { name: '알림' })).toBeVisible();
    expect(screen.getByRole('link', { name: '마이페이지' })).toBeVisible();
    expect(useMapCategoryFilterStore.getState().selectedCategory).toBe('카페');

    act(() => useHomeBottomSheetStore.getState().setSnapPoint('medium'));

    expect(filter).toBeVisible();
    expect(filter.scrollLeft).toBe(100);
    expect(screen.getByRole('button', { name: '카페' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('최대 확장 이력이 있어도 추천 시트에서는 칩을 표시한다', () => {
    useHomeBottomSheetStore.getState().setSnapPoint('full');
    render(
      <MemoryRouter>
        <HomeMapOverlay hasUnreadNotification={false} />
      </MemoryRouter>
    );

    act(() => useHomeBottomSheetStore.getState().showRecommendation());

    expect(screen.getByRole('button', { name: '가게 추천' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(screen.getByRole('group', { name: '가게 추천 및 카테고리 필터' })).toBeVisible();
  });
});
