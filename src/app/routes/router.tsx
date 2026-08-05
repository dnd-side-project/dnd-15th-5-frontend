import { createBrowserRouter } from 'react-router-dom';

import AgreementPage from '@/pages/agreement/AgreementPage';
import HomePage from '@/pages/home/HomePage';
import MapSearchPage from '@/pages/home/search/MapSearchPage';
import ShopDetailPage from '@/pages/home/shop/ShopDetailPage';
import LoginPage from '@/pages/login/LoginPage';
import MyPage from '@/pages/my-page/MyPage';
import NotFoundPage from '@/pages/not-found/NotFoundPage';
import NotificationPage from '@/pages/notifications/NotificationPage';
import OnboardingPage from '@/pages/onboarding/OnboardingPage';
import RecordCompletePage from '@/pages/record/complete/RecordCompletePage';
import ManualRecordPage from '@/pages/record/manual/ManualRecordPage';
import ReceiptConfirmPage from '@/pages/record/receipt/confirm/ReceiptConfirmPage';
import ReceiptCameraPage from '@/pages/record/receipt/ReceiptCameraPage';
import RecordMethodPage from '@/pages/record/RecordMethodPage';
import ShopSearchPage from '@/pages/record/shop/search/ShopSearchPage';
import FrequentShopListPage from '@/pages/report/frequent-shops/FrequentShopListPage';
import SpendingHistoryPage from '@/pages/report/history/SpendingHistoryPage';
import MonthlyRecordListPage from '@/pages/report/monthly-records/MonthlyRecordListPage';
import ReportDetailPage from '@/pages/report/ReportDetailPage';
import ReportPage from '@/pages/report/ReportPage';
import AppMainLayout from '@/shared/layout/AppMainLayout';
import MobileLayout from '@/shared/layout/MobileLayout';

import { ROUTE_PATHS, ROUTE_PATTERNS } from './routePaths';

export const router = createBrowserRouter([
  {
    // INFO: 모든 페이지에 모바일 최대 너비와 공통 배경을 적용한다.
    element: <MobileLayout />,
    children: [
      // INFO: 앱 진입 및 초기 사용자 설정 화면.
      // 소셜 로그인 및 루트 화면
      // TODO: 인증 상태 확인 후 가입 완료 사용자는 홈으로, 약관·온보딩 미완료 사용자는 해당 단계로 이동하도록 진입 가드 적용 필요
      {
        path: ROUTE_PATHS.login,
        element: <LoginPage />,
      },
      // 이용약관 동의
      {
        path: ROUTE_PATHS.agreement,
        element: <AgreementPage />,
      },
      // 온보딩
      {
        path: ROUTE_PATHS.onboarding,
        element: <OnboardingPage />,
      },
      // TODO: 아래 앱 주요 화면 전체를 인증 가드 하위로 묶어 비로그인 사용자의 직접 접근을 차단한다.
      {
        // INFO: 네비게이션 화면에만 앱 메인 레이아웃을 중첩 적용한다.
        element: <AppMainLayout />,
        children: [
          // 지도 홈
          {
            path: ROUTE_PATHS.home,
            element: <HomePage />,
          },
          // 지도 장소 검색
          {
            path: ROUTE_PATHS.homeSearch,
            element: <MapSearchPage />,
          },
          // 리포트 메인
          {
            path: ROUTE_PATHS.report,
            element: <ReportPage />,
          },
        ],
      },
      // INFO: 알림, 마이페이지, 가게 상세 화면.
      // 알림
      {
        path: ROUTE_PATHS.notifications,
        element: <NotificationPage />,
      },
      // 마이페이지
      {
        path: ROUTE_PATHS.myPage,
        element: <MyPage />,
      },
      // 가게 상세
      {
        path: ROUTE_PATTERNS.shopDetail,
        element: <ShopDetailPage />,
      },
      // INFO: 기록 생성 과정에서 사용하는 화면.
      // 기록 방식 선택
      {
        path: ROUTE_PATHS.record,
        element: <RecordMethodPage />,
      },
      // 수기 기록
      {
        path: ROUTE_PATHS.manualRecord,
        element: <ManualRecordPage />,
      },
      // 기록용 장소 검색
      {
        path: ROUTE_PATHS.recordShopSearch,
        element: <ShopSearchPage />,
      },
      // 영수증 촬영
      {
        path: ROUTE_PATHS.receiptCamera,
        element: <ReceiptCameraPage />,
      },
      // 영수증 결과 확인
      {
        path: ROUTE_PATHS.receiptConfirm,
        element: <ReceiptConfirmPage />,
      },
      // 영수증 기록 완료
      {
        path: ROUTE_PATHS.recordComplete,
        element: <RecordCompletePage />,
      },
      // INFO: 리포트의 상세 지표와 월간 기록 화면.
      // 소비 기록
      {
        path: ROUTE_PATHS.spendingHistory,
        element: <SpendingHistoryPage />,
      },
      // 단골 리스트
      {
        path: ROUTE_PATHS.frequentShopList,
        element: <FrequentShopListPage />,
      },
      // 이번 달 쌓인 기록
      {
        path: ROUTE_PATHS.monthlyRecordList,
        element: <MonthlyRecordListPage />,
      },
      // 월간 리포트
      {
        path: ROUTE_PATTERNS.reportDetail,
        element: <ReportDetailPage />,
      },
      // 존재하지 않는 경로
      {
        // INFO: 앞선 규칙과 일치하지 않는 모든 URL을 처리한다.
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);
