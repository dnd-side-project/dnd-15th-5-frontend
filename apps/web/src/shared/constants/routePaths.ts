import { generatePath } from 'react-router-dom';

/**
 * React Router가 URL을 매칭할 때 사용하는 동적 경로 패턴.
 * 화면 이동에는 `ROUTE_PATHS`의 동적 경로 생성 함수를 사용한다.
 */
export const ROUTE_PATTERNS = {
  shopDetail: '/home/shop/:shopId',
  reportDetail: '/report/:reportId',
} as const;

/**
 * 화면 이동과 링크 생성에 사용하는 실제 URL 모음.
 * 동적 경로는 식별자를 받아 완성된 URL을 반환한다.
 */
export const ROUTE_PATHS = {
  login: '/',
  agreement: '/agreement',
  onboarding: '/onboarding',

  home: '/home',
  homeSearch: '/home/search',
  shopDetail: (shopId: string) => generatePath(ROUTE_PATTERNS.shopDetail, { shopId }),

  record: '/record',
  manualRecord: '/record/manual',
  recordShopSearch: '/record/shop/search',
  receiptCamera: '/record/receipt/camera',

  report: '/report',
  spendingHistory: '/report/history',
  frequentShopList: '/report/frequent-shops',
  monthlyRecordList: '/report/monthly-records',
  reportDetail: (reportId: string) => generatePath(ROUTE_PATTERNS.reportDetail, { reportId }),

  notifications: '/notifications',
  myPage: '/my-page',
} as const;
