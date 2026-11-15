import { render, screen } from '@testing-library/react';
import { createBrowserRouter, createMemoryRouter, Outlet, RouterProvider } from 'react-router-dom';

import './router';

jest.mock('@sentry/react', () => ({ wrapCreateBrowserRouter: (create: unknown) => create }));
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  createBrowserRouter: jest.fn(),
}));
jest.mock('@/app/layouts/MobileLayout', () => ({
  __esModule: true,
  default: () => <Outlet />,
}));
jest.mock('@/app/layouts/AppMainLayout', () => ({
  __esModule: true,
  default: () => <Outlet />,
}));
jest.mock('@/app/routes/AuthRoute', () => ({
  AuthenticatedRoute: () => <Outlet />,
  GuestOnlyRoute: () => <Outlet />,
  TermsAgreementRoute: () => <Outlet />,
}));
jest.mock('@/app/routes/RouteErrorPage', () => ({
  __esModule: true,
  default: () => <div role="alert">화면을 불러오지 못했어요</div>,
}));
jest.mock('@/pages/login/LoginPage', () => ({
  __esModule: true,
  default: () => <h1>로그인 화면</h1>,
}));
jest.mock('@/pages/record/RecordPage', () => ({
  __esModule: true,
  default: () => (
    <main>
      기록 화면
      <Outlet />
    </main>
  ),
}));
jest.mock('@/pages/record/shop/search/ShopSearchPage', () => ({
  __esModule: true,
  default: () => <h1>가게 검색 화면</h1>,
}));
jest.mock('@/pages/agreement/PoliciesPage', () => {
  throw new Error('페이지 모듈 로드 실패');
});

const routes = jest.mocked(createBrowserRouter).mock.calls[0][0];

it('직접 진입하면 초기 로딩 안내 후 해당 페이지를 표시한다', async () => {
  const router = createMemoryRouter(routes, { initialEntries: ['/'] });
  const view = render(<RouterProvider router={router} />);
  expect(screen.getByRole('status', { name: '화면을 불러오는 중' })).toBeInTheDocument();
  expect(await screen.findByRole('heading', { name: '로그인 화면' })).toBeInTheDocument();
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  view.unmount();
  router.dispose();
});

it('중첩된 기록 가게 검색 URL로 직접 진입해도 부모와 검색 화면을 함께 표시한다', async () => {
  const router = createMemoryRouter(routes, { initialEntries: ['/record/shop/search'] });
  const view = render(<RouterProvider router={router} />);
  expect(await screen.findByRole('heading', { name: '가게 검색 화면' })).toBeInTheDocument();
  expect(screen.getByRole('main')).toHaveTextContent('기록 화면');
  view.unmount();
  router.dispose();
});

it('페이지 모듈 로드가 실패하면 공통 오류 화면을 표시한다', async () => {
  const router = createMemoryRouter(routes, { initialEntries: ['/my-page/policies'] });
  const view = render(<RouterProvider router={router} />);
  expect(await screen.findByRole('alert')).toHaveTextContent('화면을 불러오지 못했어요');
  view.unmount();
  router.dispose();
});
