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

    await user.click(screen.getByRole('link', { name: '리포트로 이동' }));

    await waitFor(() => {
      expect(mockNotifyNative).toHaveBeenLastCalledWith('routeChanged', { pathname: '/report' });
    });
    expect(mobileFrame).toHaveClass('pb-safe-bottom');
  });

  it('자체 스크롤을 사용하는 가게 상세에는 바깥 Safe Area 패딩을 추가하지 않는다', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/home/shop/101']}>
        <MobileLayout>가게 상세</MobileLayout>
      </MemoryRouter>
    );
    const mobileFrame = container.firstElementChild?.firstElementChild;

    expect(mobileFrame).not.toHaveClass('pb-safe-bottom');
  });
});
