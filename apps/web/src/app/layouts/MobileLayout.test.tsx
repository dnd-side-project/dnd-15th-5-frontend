import { NATIVE_PAGE_BACK_EVENT } from '@chapchap/shared/bridge';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Link, MemoryRouter } from 'react-router-dom';

import { useHomeBottomSheetStore } from '@/features/map/stores/homeBottomSheetStore';
import { notifyNative } from '@/shared/lib/bridge';

import MobileLayout from './MobileLayout';

jest.mock('@/shared/lib/bridge', () => ({
  notifyNative: jest.fn(),
}));
jest.mock('@/app/providers/AnalyticsIdentity', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('@/app/providers/AnalyticsTracker', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('@/app/providers/MapSessionBoundary', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => children,
}));

const mockNotifyNative = jest.mocked(notifyNative);

describe('<MobileLayout />', () => {
  beforeEach(() => {
    mockNotifyNative.mockReset();
    useHomeBottomSheetStore.setState(useHomeBottomSheetStore.getInitialState());
  });

  it('시스템 뒤로 가기를 추천 상세 → 목록 → 홈으로 전달한다', () => {
    useHomeBottomSheetStore.getState().showRecommendationPlace('101');
    render(
      <MemoryRouter initialEntries={['/home']}>
        <MobileLayout>지도</MobileLayout>
      </MemoryRouter>
    );
    expect(mockNotifyNative).toHaveBeenLastCalledWith('routeChanged', {
      pathname: '/home',
      canGoBackInPage: true,
    });
    act(() => window.dispatchEvent(new Event(NATIVE_PAGE_BACK_EVENT)));
    expect(useHomeBottomSheetStore.getState().activeSheet.type).toBe('recommendation');
    act(() => window.dispatchEvent(new Event(NATIVE_PAGE_BACK_EVENT)));
    expect(useHomeBottomSheetStore.getState().activeSheet.type).toBe('home');
    expect(mockNotifyNative).toHaveBeenLastCalledWith('routeChanged', { pathname: '/home' });
  });

  it('React Router 경로가 바뀔 때 네이티브에 알린다', async () => {
    const user = userEvent.setup();

    const { container } = render(
      <MemoryRouter initialEntries={['/home']}>
        <MobileLayout>
          <Link to="/report">리포트로 이동</Link>
        </MobileLayout>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockNotifyNative).toHaveBeenLastCalledWith('routeChanged', { pathname: '/home' });
    });
    const mobileFrame = container.firstElementChild?.firstElementChild;
    expect(mobileFrame).not.toHaveClass('pb-safe-bottom');
    expect(mobileFrame).toHaveStyle({ '--page-safe-area-top': '0px' });

    await user.click(screen.getByRole('link', { name: '리포트로 이동' }));

    await waitFor(() => {
      expect(mockNotifyNative).toHaveBeenLastCalledWith('routeChanged', { pathname: '/report' });
    });
    expect(mobileFrame).toHaveClass('pb-safe-bottom');
    expect(mobileFrame).toHaveStyle({ '--page-safe-area-top': 'env(safe-area-inset-top)' });
  });

  it.each([
    ['/', 'env(safe-area-inset-top)'],
    ['/auth/callback', 'env(safe-area-inset-top)'],
    ['/oauth/callback', 'env(safe-area-inset-top)'],
    ['/agreement', 'env(safe-area-inset-top)'],
    ['/agreement/privacy-policy', 'env(safe-area-inset-top)'],
    ['/agreement/terms-of-service', 'env(safe-area-inset-top)'],
    ['/onboarding', 'env(safe-area-inset-top)'],
    ['/home', '0px'],
    ['/home/', '0px'],
    ['/home/recommendation/map', '0px'],
    ['/home/recommendation/search', '0px'],
    ['/record', '0px'],
    ['/record/135/edit', '0px'],
    ['/record/135/edit/history', 'env(safe-area-inset-top)'],
    ['/record/shop/search', 'env(safe-area-inset-top)'],
    ['/home/search', 'env(safe-area-inset-top)'],
    ['/notifications', 'env(safe-area-inset-top)'],
    ['/my-page', 'env(safe-area-inset-top)'],
    ['/my-page/likes', 'env(safe-area-inset-top)'],
    ['/my-page/profile', 'env(safe-area-inset-top)'],
    ['/my-page/policies', 'env(safe-area-inset-top)'],
    ['/my-page/notifications', 'env(safe-area-inset-top)'],
    ['/home/shop/101', 'env(safe-area-inset-top)'],
    ['/report', 'env(safe-area-inset-top)'],
    ['/report/monthly-report', 'env(safe-area-inset-top)'],
    ['/report/history', 'env(safe-area-inset-top)'],
    ['/report/frequent-shops', 'env(safe-area-inset-top)'],
    ['/report/monthly-records', 'env(safe-area-inset-top)'],
    ['/share/test-token', 'env(safe-area-inset-top)'],
    ['/unknown-page', 'env(safe-area-inset-top)'],
  ])('%s 경로의 상단 Safe Area를 화면의 처리 방식에 맞춘다', (pathname, topInset) => {
    const { container } = render(
      <MemoryRouter initialEntries={[pathname]}>
        <MobileLayout>화면</MobileLayout>
      </MemoryRouter>
    );

    expect(container.firstElementChild?.firstElementChild).toHaveStyle({
      '--page-safe-area-top': topInset,
    });
  });

  it.each([
    ['/home/shop/101', false],
    ['/my-page/notifications', true],
  ] as const)(
    '%s 경로의 하단 Safe Area 처리 주체에 맞춰 프레임 패딩을 적용한다',
    (pathname, usesFrameBottomSafeArea) => {
      const { container } = render(
        <MemoryRouter initialEntries={[pathname]}>
          <MobileLayout>화면</MobileLayout>
        </MemoryRouter>
      );
      const mobileFrame = container.firstElementChild?.firstElementChild;

      if (usesFrameBottomSafeArea) {
        expect(mobileFrame).toHaveClass('pb-safe-bottom');
      } else {
        expect(mobileFrame).not.toHaveClass('pb-safe-bottom');
      }
    }
  );
});
