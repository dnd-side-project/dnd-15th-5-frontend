import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { useHomeBottomSheetStore } from '@/features/map/stores/homeBottomSheetStore';

import HomeTopBar from './HomeTopBar';

describe('HomeTopBar', () => {
  beforeEach(() => {
    useHomeBottomSheetStore.setState({ topActionBottomPx: 0 });
  });

  it.each([
    { hasUnreadNotification: true, label: '읽지 않은 알림 있음' },
    { hasUnreadNotification: false, label: '알림' },
  ])('안 읽은 알림 상태에 맞는 알림 버튼을 표시한다', ({ hasUnreadNotification, label }) => {
    render(
      <MemoryRouter>
        <HomeTopBar hasUnreadNotification={hasUnreadNotification} recordedShopCount={0} />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: label })).toHaveAttribute('href', '/notifications');
  });
});
