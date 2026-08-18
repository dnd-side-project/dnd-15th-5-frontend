import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Link, MemoryRouter } from 'react-router-dom';

import { notifyNative } from '@/shared/lib/bridge';

import MobileLayout from './MobileLayout';

jest.mock('@/shared/lib/bridge', () => ({
  notifyNative: jest.fn(),
}));

const mockNotifyNative = jest.mocked(notifyNative);

describe('<MobileLayout />', () => {
  beforeEach(() => {
    mockNotifyNative.mockReset();
  });

  it('React Router 경로가 바뀔 때 네이티브에 알린다', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/home']}>
        <MobileLayout>
          <Link to="/report">리포트로 이동</Link>
        </MobileLayout>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockNotifyNative).toHaveBeenLastCalledWith('routeChanged', { pathname: '/home' });
    });

    await user.click(screen.getByRole('link', { name: '리포트로 이동' }));

    await waitFor(() => {
      expect(mockNotifyNative).toHaveBeenLastCalledWith('routeChanged', { pathname: '/report' });
    });
  });
});
