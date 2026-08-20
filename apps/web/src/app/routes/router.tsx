import { createBrowserRouter } from 'react-router-dom';

import AppMainLayout from '@/app/layouts/AppMainLayout';
import MobileLayout from '@/app/layouts/MobileLayout';
import AgreementPage from '@/pages/agreement/AgreementPage';
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
import ReportDetailPage from '@/pages/report/ReportDetailPage';
import ReportPage from '@/pages/report/ReportPage';
import { ROUTE_PATHS, ROUTE_PATTERNS } from '@/shared/constants/routePaths';
import PaddedLayout from '@/shared/layout/PaddedLayout';

export const router = createBrowserRouter([
  {
    // INFO: 모든 페이지에 모바일 최대 너비와 공통 배경을 적용한다.
    element: <MobileLayout />,
    children: [
      {
        // INFO: 앱 진입 및 초기 사용자 설정 화면에 좌우 여백을 적용한다.
        element: <PaddedLayout />,
        children: [
          // TODO: 인증 상태 확인 후 가입 완료 사용자는 홈으로, 약관·온보딩 미완료 사용자는 해당 단계로 이동하도록 진입 가드 적용 필요
          {
            path: ROUTE_PATHS.login,
            element: <LoginPage />,
          },
          {
            path: ROUTE_PATHS.agreement,
            element: <AgreementPage />,
          },
          {
            path: ROUTE_PATHS.onboarding,
            element: <OnboardingPage />,
          },
        ],
      },
      // TODO: 인증 구현 시 AppMainLayout 및 아래 인증 필요 화면을 공통 가드 하위로 묶는다.
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
            // INFO: 지도 홈을 제외한 네비게이션 화면에 좌우 여백을 적용한다.
            element: <PaddedLayout />,
            children: [
              {
                path: ROUTE_PATHS.homeSearch,
                element: <MapSearchPage />,
              },
              {
                path: ROUTE_PATHS.report,
                element: <ReportPage />,
              },
            ],
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
            path: ROUTE_PATTERNS.reportDetail,
            element: <ReportDetailPage />,
          },
          {
            path: '*',
            element: <NotFoundPage />,
          },
        ],
      },
    ],
  },
]);
