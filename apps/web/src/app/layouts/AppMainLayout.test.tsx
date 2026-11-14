import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { useHomeBottomSheetStore } from '@/features/map';
import HomeBottomSheet from '@/features/map/components/HomeBottomSheet';
import { isNativeApp } from '@/shared/lib/bridge';

import AppMainLayout from './AppMainLayout';

jest.mock('@/shared/lib/bridge', () => ({
  ...jest.requireActual('@/shared/lib/bridge'),
  isNativeApp: jest.fn(),
}));

const renderHomeLayout = () =>
  render(
    <MemoryRouter initialEntries={['/home']}>
      <Routes>
        <Route element={<AppMainLayout />}>
          <Route path="/home" element={<main>홈 화면</main>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );

const renderReportLayout = () =>
  render(
    <MemoryRouter initialEntries={['/report']}>
      <Routes>
        <Route element={<AppMainLayout />}>
          <Route path="/report" element={<main>리포트 화면</main>} />
          <Route path="/home" element={<main>홈 화면</main>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );

describe('AppMainLayout', () => {
  beforeEach(() => {
    jest.mocked(isNativeApp).mockReturnValue(false);
    useHomeBottomSheetStore.setState({ activeSheet: { type: 'home' }, stepIndex: 0 });
  });

  it('숨겨진 홈 시트는 홈 탭으로 다시 열린다', () => {
    useHomeBottomSheetStore.setState({ stepIndex: 3 });
    render(
      <MemoryRouter initialEntries={['/home']}>
        <Routes>
          <Route element={<AppMainLayout />}>
            <Route
              path="/home"
              element={
                <HomeBottomSheet
                  renderFrequentShops={(header) => <div>{header}가게 목록</div>}
                  renderSpendingHistory={(header) => <div>{header}</div>}
                  renderSelectedPlace={() => null}
                />
              }
            />
          </Route>
        </Routes>
      </MemoryRouter>
    );
    expect(screen.queryByRole('button', { name: '바텀시트 높이 조절' })).not.toBeInTheDocument();
    expect(useHomeBottomSheetStore.getState().visibleHeightPx).toBe(0);
    fireEvent.click(screen.getByRole('link', { name: '홈' }));
    const sheet = screen.getByRole('button', { name: '바텀시트 높이 조절' }).parentElement;
    expect(sheet).toHaveStyle({ height: '45dvh' });
    expect(sheet).not.toHaveAttribute('inert');
    expect(sheet).not.toHaveAttribute('aria-hidden');
    expect(screen.getByText('가게 목록')).toBeVisible();
  });

  it.each([
    [false, '[--bottom-tab-bar-gap:32px]'],
    [true, '[--bottom-tab-bar-gap:0px]'],
  ])('웹과 앱 여부에 따라 탭바 및 콘텐츠에 같은 하단 여백을 적용한다 (%s)', (native, gapClass) => {
    jest.mocked(isNativeApp).mockReturnValue(native);
    const { container } = renderReportLayout();
    expect(container.firstElementChild).toHaveClass(gapClass);
    expect(screen.getByRole('navigation', { name: '주요 메뉴' })).toBeInTheDocument();
  });

  it('리포트에서 하단 탭바를 표시하고 리포트 탭을 활성화한다', () => {
    renderReportLayout();

    expect(screen.getByRole('navigation', { name: '주요 메뉴' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '리포트' })).toHaveAttribute('aria-current', 'page');
  });

  it('다른 탭에서 홈으로 이동할 때는 시트를 유지하고 홈 재클릭은 순환한다', () => {
    renderReportLayout();

    fireEvent.click(screen.getByRole('link', { name: '홈' }));
    expect(screen.getByRole('main')).toHaveTextContent('홈 화면');
    expect(useHomeBottomSheetStore.getState().stepIndex).toBe(0);

    for (const stepIndex of [1, 2, 3, 0]) {
      fireEvent.click(screen.getByRole('link', { name: '홈' }));
      expect(useHomeBottomSheetStore.getState().stepIndex).toBe(stepIndex);
    }
  });

  it.each([0, 1, 3])('리포트에서 홈 복귀 시 숨겨진 시트만 중간 높이로 연다 (%s)', (stepIndex) => {
    useHomeBottomSheetStore.setState({ stepIndex });
    renderReportLayout();
    fireEvent.click(screen.getByRole('link', { name: '홈' }));
    expect(screen.getByRole('main')).toHaveTextContent('홈 화면');
    expect(useHomeBottomSheetStore.getState().stepIndex).toBe(stepIndex === 3 ? 0 : stepIndex);
  });

  it('홈에서 스티커를 선택하면 하단 탭바를 완전히 제거한다', () => {
    renderHomeLayout();
    expect(screen.getByRole('navigation', { name: '주요 메뉴' })).toBeInTheDocument();

    act(() => {
      useHomeBottomSheetStore.getState().showSelectedPlace('cafe-coffee');
    });

    expect(screen.queryByRole('navigation', { name: '주요 메뉴' })).not.toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveTextContent('홈 화면');

    act(() => {
      useHomeBottomSheetStore.getState().showHome();
    });

    expect(screen.getByRole('navigation', { name: '주요 메뉴' })).toBeInTheDocument();
  });

  it('가게 추천을 선택하면 하단 탭바를 제거하고 선택을 해제하면 복원한다', () => {
    renderHomeLayout();

    act(() => {
      useHomeBottomSheetStore.getState().showRecommendation();
    });
    expect(screen.queryByRole('navigation', { name: '주요 메뉴' })).not.toBeInTheDocument();

    act(() => {
      useHomeBottomSheetStore.getState().showHome();
    });
    expect(screen.getByRole('navigation', { name: '주요 메뉴' })).toBeInTheDocument();
  });

  it('좋아요 마커의 가게 시트가 열리면 하단 탭바를 제거한다', () => {
    renderHomeLayout();

    act(() => {
      useHomeBottomSheetStore.getState().showLikedRecommendation('recommendation-twosome');
    });

    expect(screen.queryByRole('navigation', { name: '주요 메뉴' })).not.toBeInTheDocument();
  });
});
