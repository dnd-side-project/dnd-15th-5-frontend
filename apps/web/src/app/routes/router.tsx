import * as Sentry from '@sentry/react';
import { createBrowserRouter } from 'react-router-dom';

import AppMainLayout from '@/app/layouts/AppMainLayout';
import MobileLayout from '@/app/layouts/MobileLayout';
import { AuthenticatedRoute, GuestOnlyRoute, TermsAgreementRoute } from '@/app/routes/AuthRoute';
import RouteErrorPage from '@/app/routes/RouteErrorPage';
import AgreementPage from '@/pages/agreement/AgreementPage';
import AuthCallbackPage from '@/pages/auth-callback/AuthCallbackPage';
import HomePage from '@/pages/home/HomePage';
import MapSearchPage from '@/pages/home/search/MapSearchPage';
import ShopDetailPage from '@/pages/home/shop/ShopDetailPage';
import LoginPage from '@/pages/login/LoginPage';
import MyPage from '@/pages/my-page/MyPage';
import NotFoundPage from '@/pages/not-found/NotFoundPage';
import NotificationPage from '@/pages/notifications/NotificationPage';
import OnboardingPage from '@/pages/onboarding/OnboardingPage';
import ManualRecordPage from '@/pages/record/manual/ManualRecordPage';
import ReceiptCameraPage from '@/pages/record/receipt/ReceiptCameraPage';
import RecordMethodPage from '@/pages/record/RecordMethodPage';
import ShopSearchPage from '@/pages/record/shop/search/ShopSearchPage';
import FrequentShopListPage from '@/pages/report/frequent-shops/FrequentShopListPage';
import SpendingHistoryPage from '@/pages/report/history/SpendingHistoryPage';
import MonthlyRecordListPage from '@/pages/report/monthly-records/MonthlyRecordListPage';
import MonthlyReportPage from '@/pages/report/MonthlyReportPage';
import ReportPage from '@/pages/report/ReportPage';
import SharedReportPage from '@/pages/report/shared/SharedReportPage';
import { ROUTE_PATHS, ROUTE_PATTERNS } from '@/shared/constants/routePaths';
import PaddedLayout from '@/shared/layout/PaddedLayout';

const createSentryBrowserRouter = Sentry.wrapCreateBrowserRouter(createBrowserRouter);

export const router = createSentryBrowserRouter([
  {
    // INFO: 모든 페이지에 모바일 최대 너비와 공통 배경을 적용한다.
    element: <MobileLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        // INFO: 로그인 및 약관 화면에 좌우 여백을 적용한다.
        element: <PaddedLayout />,
        children: [
          {
            element: <GuestOnlyRoute />,
            children: [{ path: ROUTE_PATHS.login, element: <LoginPage /> }],
          },
          {
            path: ROUTE_PATHS.authCallback,
            element: <AuthCallbackPage />,
          },
          {
            path: ROUTE_PATHS.oauthCallback,
            element: <AuthCallbackPage />,
          },
          {
            element: <TermsAgreementRoute />,
            children: [{ path: ROUTE_PATHS.agreement, element: <AgreementPage /> }],
          },
        ],
      },
      {
        path: ROUTE_PATTERNS.sharedReport,
        element: <SharedReportPage />,
      },
      {
        element: <AuthenticatedRoute />,
        children: [
          {
            // INFO: 온보딩 이미지는 전체 너비를 사용하고 조작 영역만 자체 여백을 적용한다.
            path: ROUTE_PATHS.onboarding,
            element: <OnboardingPage />,
          },
          {
            path: ROUTE_PATHS.monthlyReport,
            element: <MonthlyReportPage />,
          },
          {
            // INFO: 네비게이션 화면에만 앱 메인 레이아웃을 중첩 적용한다.
            element: <AppMainLayout />,
            children: [
              // 지도 홈은 좌우 여백 없이 전체 너비를 사용한다.
              {
                path: ROUTE_PATHS.home,
                element: <HomePage />,
              },
              {
                path: ROUTE_PATHS.report,
                element: <ReportPage />,
              },
            ],
          },
          // 영수증 촬영은 좌우 여백 없이 전체 너비를 사용한다.
          {
            path: ROUTE_PATHS.receiptCamera,
            element: <ReceiptCameraPage />,
          },
          {
            // INFO: 지도 홈과 영수증 촬영을 제외한 화면에 좌우 여백을 적용한다.
            element: <PaddedLayout />,
            children: [
              {
                path: ROUTE_PATHS.homeSearch,
                element: <MapSearchPage />,
              },
              {
                path: ROUTE_PATHS.notifications,
                element: <NotificationPage />,
              },
              {
                path: ROUTE_PATHS.myPage,
                element: <MyPage />,
              },
              {
                path: ROUTE_PATTERNS.shopDetail,
                element: <ShopDetailPage />,
              },
              {
                path: ROUTE_PATHS.record,
                element: <RecordMethodPage />,
              },
              {
                path: ROUTE_PATHS.manualRecord,
                element: <ManualRecordPage />,
              },
              {
                path: ROUTE_PATHS.recordShopSearch,
                element: <ShopSearchPage />,
              },
              {
                path: ROUTE_PATHS.spendingHistory,
                element: <SpendingHistoryPage />,
              },
              {
                path: ROUTE_PATHS.frequentShopList,
                element: <FrequentShopListPage />,
              },
              {
                path: ROUTE_PATHS.monthlyRecordList,
                element: <MonthlyRecordListPage />,
              },
              {
                path: '*',
                element: <NotFoundPage />,
              },
            ],
          },
        ],
      },
    ],
  },
]);
