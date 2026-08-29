import { act, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { useHomeBottomSheetStore } from '@/features/map';

import AppMainLayout from './AppMainLayout';

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
        </Route>
      </Routes>
    </MemoryRouter>
  );

describe('AppMainLayout', () => {
  beforeEach(() => {
    useHomeBottomSheetStore.setState({ activeSheet: { type: 'home' }, stepIndex: 0 });
  });

  it('리포트에서 하단 탭바를 표시하고 리포트 탭을 활성화한다', () => {
    renderReportLayout();

    expect(screen.getByRole('navigation', { name: '주요 메뉴' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '리포트' })).toHaveAttribute('aria-current', 'page');
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
