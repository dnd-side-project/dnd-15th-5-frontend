import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { useVisitedPlaceStickersQuery } from '@/features/map/apis/hooks/useVisitedPlaceStickersQuery';
import { useHomeBottomSheetStore } from '@/features/map/stores/homeBottomSheetStore';

import HomeMapOverlay from './HomeMapOverlay';

jest.mock('@/features/map/apis/hooks/useVisitedPlaceStickersQuery');

const mockedUseVisitedPlaceStickersQuery = jest.mocked(useVisitedPlaceStickersQuery);

describe('HomeMapOverlay', () => {
  beforeEach(() => {
    useHomeBottomSheetStore.setState({ topActionBottomPx: 0, activeSheet: { type: 'home' } });
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

  it('추천 상세에서는 홈 상단 UI를 숨기고 뒤로 가기와 닫기를 구분한다', () => {
    useHomeBottomSheetStore.getState().showRecommendationPlace('101');
    render(
      <MemoryRouter>
        <HomeMapOverlay hasUnreadNotification={false} />
      </MemoryRouter>
    );
    expect(screen.queryByRole('link', { name: '장소 검색' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: '알림' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '추천 목록으로 돌아가기' }));
    expect(useHomeBottomSheetStore.getState().activeSheet).toEqual({ type: 'recommendation' });
    expect(
      screen.queryByRole('button', { name: '추천 목록으로 돌아가기' })
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '가게 추천 닫기' }));
    expect(useHomeBottomSheetStore.getState().activeSheet).toEqual({ type: 'home' });
    expect(screen.getByRole('link', { name: '장소 검색' })).toBeInTheDocument();
  });
});
