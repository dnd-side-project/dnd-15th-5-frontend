import * as Sentry from '@sentry/react';
import { render, waitFor } from '@testing-library/react';
import { useRouteError } from 'react-router-dom';

import RouteErrorPage from './RouteErrorPage';

jest.mock('@sentry/react', () => ({
  captureException: jest.fn(),
  withScope: jest.fn((callback: (scope: { setTag: jest.Mock }) => void) =>
    callback({ setTag: jest.fn() })
  ),
}));
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useRouteError: jest.fn(),
}));
jest.mock('@/shared/assets/images/state', () => ({
  EmptyStateImage: 'img-empty.png',
  ErrorStateImage: 'img-error.png',
}));

const mockUseRouteError = useRouteError as jest.MockedFunction<typeof useRouteError>;

describe('<RouteErrorPage />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('라우트 오류를 Sentry에 기록한다', async () => {
    const routeError = new Error('라우트 렌더링 실패');
    mockUseRouteError.mockReturnValue(routeError);

    render(<RouteErrorPage />);

    await waitFor(() => expect(Sentry.captureException).toHaveBeenCalledWith(routeError));
  });

  it('사용자 요청으로 발생한 4xx 라우트 응답은 기록하지 않는다', async () => {
    mockUseRouteError.mockReturnValue({
      data: null,
      internal: false,
      status: 404,
      statusText: 'Not Found',
    });

    render(<RouteErrorPage />);

    await waitFor(() => expect(Sentry.captureException).not.toHaveBeenCalled());
  });
});
