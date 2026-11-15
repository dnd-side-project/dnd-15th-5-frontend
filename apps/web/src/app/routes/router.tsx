import * as Sentry from '@sentry/react';
import { createBrowserRouter } from 'react-router-dom';

import MobileLayout from '@/app/layouts/MobileLayout';
import { AuthenticatedRoute, GuestOnlyRoute, TermsAgreementRoute } from '@/app/routes/AuthRoute';
import RouteErrorPage from '@/app/routes/RouteErrorPage';
import RouteLoading from '@/app/routes/RouteLoading';
import { ROUTE_PATHS, ROUTE_PATTERNS } from '@/shared/constants/routePaths';
import PaddedLayout from '@/shared/layout/padded-layout';

import type { ComponentType } from 'react';

/** 명시된 import 경로를 유지하며 페이지의 default export를 라우터의 Component로 연결합니다. */
const lazyRoute = (load: () => Promise<{ default: ComponentType }>) => async () => ({
  Component: (await load()).default,
});

const createSentryBrowserRouter = Sentry.wrapCreateBrowserRouter(createBrowserRouter);

export const router = createSentryBrowserRouter([
  {
    // INFO: 모든 페이지에 모바일 최대 너비와 공통 배경을 적용한다.
    element: <MobileLayout />,
    errorElement: <RouteErrorPage />,
    HydrateFallback: RouteLoading,
    children: [
      {
        // INFO: 로그인 및 약관 화면에 좌우 여백을 적용한다.
        element: <PaddedLayout />,
        children: [
          {
            element: <GuestOnlyRoute />,
            children: [
              {
                path: ROUTE_PATHS.login,
                lazy: lazyRoute(() => import('@/pages/login/LoginPage')),
              },
            ],
          },
          {
            path: ROUTE_PATHS.authCallback,
            lazy: lazyRoute(() => import('@/pages/auth-callback/AuthCallbackPage')),
          },
          {
            path: ROUTE_PATHS.oauthCallback,
            lazy: lazyRoute(() => import('@/pages/auth-callback/AuthCallbackPage')),
          },
          {
            element: <TermsAgreementRoute />,
            children: [
              {
                path: ROUTE_PATHS.agreement,
                lazy: lazyRoute(() => import('@/pages/agreement/AgreementPage')),
              },
            ],
          },
          // 약관 원문은 가입 전·후 모두 확인할 수 있다.
          {
            path: ROUTE_PATHS.agreementPrivacyPolicy,
            lazy: lazyRoute(() => import('@/pages/agreement/PrivacyPolicyPage')),
          },
          {
            path: ROUTE_PATHS.agreementTermsOfService,
            lazy: lazyRoute(() => import('@/pages/agreement/TermsOfServicePage')),
          },
        ],
      },
      {
        path: ROUTE_PATTERNS.sharedReport,
        lazy: lazyRoute(() => import('@/pages/report/shared/SharedReportPage')),
      },
      {
        element: <AuthenticatedRoute />,
        children: [
          {
            path: ROUTE_PATHS.onboarding,
            lazy: lazyRoute(() => import('@/pages/onboarding/OnboardingPage')),
          },
          {
            path: ROUTE_PATHS.monthlyReport,
            lazy: lazyRoute(() => import('@/pages/report/MonthlyReportPage')),
          },
          {
            // INFO: 네비게이션 화면에만 앱 메인 레이아웃을 중첩 적용한다.
            lazy: lazyRoute(() => import('@/app/layouts/AppMainLayout')),
            children: [
              // 지도 홈은 좌우 여백 없이 전체 너비를 사용한다.
              {
                path: ROUTE_PATHS.home,
                lazy: lazyRoute(() => import('@/pages/home/HomePage')),
              },
              {
                path: ROUTE_PATHS.report,
                lazy: lazyRoute(() => import('@/pages/report/ReportPage')),
              },
            ],
          },
          {
            path: ROUTE_PATHS.homeRecommendationSearch,
            lazy: lazyRoute(
              () => import('@/pages/home/recommendation/RecommendationLocationSearchPage')
            ),
          },
          {
            path: ROUTE_PATHS.homeRecommendationMap,
            lazy: lazyRoute(
              () => import('@/pages/home/recommendation/RecommendationLocationMapPage')
            ),
          },
          // 사진 선택과 기록 입력은 화면 전체 너비와 자체 Safe Area를 사용한다.
          {
            path: ROUTE_PATTERNS.editRecord,
            lazy: lazyRoute(() => import('@/pages/record/edit/EditRecordPage')),
          },
          {
            path: ROUTE_PATHS.record,
            lazy: lazyRoute(() => import('@/pages/record/RecordPage')),
            children: [
              {
                path: ROUTE_PATHS.recordShopSearch,
                lazy: lazyRoute(() => import('@/pages/record/shop/search/ShopSearchPage')),
              },
            ],
          },
          {
            // INFO: 일반 화면에 좌우 여백을 적용한다.
            element: <PaddedLayout />,
            children: [
              {
                path: ROUTE_PATHS.homeSearch,
                lazy: lazyRoute(() => import('@/pages/home/search/MapSearchPage')),
              },
              {
                path: ROUTE_PATHS.notifications,
                lazy: lazyRoute(() => import('@/pages/notifications/NotificationPage')),
              },
              {
                path: ROUTE_PATHS.notificationSettings,
                lazy: lazyRoute(() => import('@/pages/notifications/NotificationSettingsPage')),
              },
              {
                path: ROUTE_PATHS.myPage,
                lazy: lazyRoute(() => import('@/pages/my-page/MyPage')),
              },
              {
                path: ROUTE_PATHS.myPageLikes,
                lazy: lazyRoute(() => import('@/pages/my-page/LikedPlacesPage')),
              },
              {
                path: ROUTE_PATHS.myPageProfile,
                lazy: lazyRoute(() => import('@/pages/my-page/MyProfileEditPage')),
              },
              {
                path: ROUTE_PATHS.myPagePolicies,
                lazy: lazyRoute(() => import('@/pages/agreement/PoliciesPage')),
              },
              {
                path: ROUTE_PATTERNS.shopDetail,
                lazy: lazyRoute(() => import('@/pages/home/shop/ShopDetailPage')),
              },
              {
                path: ROUTE_PATHS.spendingHistory,
                lazy: lazyRoute(() => import('@/pages/report/history/SpendingHistoryPage')),
              },
              {
                path: ROUTE_PATHS.frequentShopList,
                lazy: lazyRoute(() => import('@/pages/report/frequent-shops/FrequentShopListPage')),
              },
              {
                path: ROUTE_PATHS.monthlyRecordList,
                lazy: lazyRoute(
                  () => import('@/pages/report/monthly-records/MonthlyRecordListPage')
                ),
              },
              {
                path: '*',
                lazy: lazyRoute(() => import('@/pages/not-found/NotFoundPage')),
              },
            ],
          },
        ],
      },
    ],
  },
]);
