import { matchPath } from 'react-router-dom';

import { ROUTE_PATHS, ROUTE_PATTERNS } from '@/shared/constants/routePaths';

export const UT_SCREEN_NAMES = {
  mapMain: 'MAP_Main',
  mapPlaceDetailFirstVisitToast: 'MAP_PlaceDetail_FirstVisitToast',
  mapPlaceDetail02: 'MAP_PlaceDetail_02',
  report02: 'REP02',
} as const;

export const UT_MISSION_IDS = {
  manualFirstVisit: 'MAP_MAIN_TO_FIRST_VISIT_TOAST_MANUAL',
  receiptFirstVisit: 'MAP_MAIN_TO_FIRST_VISIT_TOAST_RECEIPT',
  placeDetail: 'MAP_MAIN_TO_PLACE_DETAIL_02',
  report: 'MAP_MAIN_TO_REP02',
} as const;

type ScreenMetadata = {
  screenName: string;
  screenPath: string;
  utCompletionTarget?: string;
};

const NOT_FOUND_SCREEN = 'ETC_NotFound';

const STATIC_SCREEN_NAMES: Record<string, string> = {
  [ROUTE_PATHS.login]: 'AUTH_Login',
  [ROUTE_PATHS.agreement]: 'AUTH_Agreement',
  [ROUTE_PATHS.onboarding]: 'ONB_Onboarding',
  [ROUTE_PATHS.home]: UT_SCREEN_NAMES.mapMain,
  [ROUTE_PATHS.homeSearch]: 'MAP_Search',
  [ROUTE_PATHS.record]: 'REC_Method',
  [ROUTE_PATHS.manualRecord]: 'REC_Manual',
  [ROUTE_PATHS.recordShopSearch]: 'REC_PlaceSearch',
  [ROUTE_PATHS.receiptCamera]: 'REC_ReceiptCamera',
  [ROUTE_PATHS.report]: UT_SCREEN_NAMES.report02,
  [ROUTE_PATHS.spendingHistory]: 'REP_History',
  [ROUTE_PATHS.frequentShopList]: 'REP_FrequentShops',
  [ROUTE_PATHS.monthlyRecordList]: 'REP_MonthlyRecords',
  [ROUTE_PATHS.monthlyReport]: 'REP_MonthlyReport',
  [ROUTE_PATHS.notifications]: 'NOT_Notifications',
  [ROUTE_PATHS.myPage]: 'MY_MyPage',
};

const normalizePathname = (pathname: string) =>
  pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;

/** URL의 식별자와 쿼리 문자열을 분석 이벤트에 싣지 않고 안정적인 화면 코드로 바꿉니다. */
export const getScreenMetadata = (pathname: string): ScreenMetadata => {
  const normalizedPathname = normalizePathname(pathname);

  if (matchPath(ROUTE_PATTERNS.shopDetail, normalizedPathname)) {
    return {
      screenName: UT_SCREEN_NAMES.mapPlaceDetail02,
      screenPath: ROUTE_PATTERNS.shopDetail,
      utCompletionTarget: UT_SCREEN_NAMES.mapPlaceDetail02,
    };
  }

  if (matchPath(ROUTE_PATTERNS.sharedReport, normalizedPathname)) {
    return { screenName: 'REP_Shared', screenPath: ROUTE_PATTERNS.sharedReport };
  }

  const screenName = STATIC_SCREEN_NAMES[normalizedPathname];

  if (!screenName) {
    return { screenName: NOT_FOUND_SCREEN, screenPath: NOT_FOUND_SCREEN };
  }

  return {
    screenName,
    screenPath: normalizedPathname,
    utCompletionTarget:
      normalizedPathname === ROUTE_PATHS.report ? UT_SCREEN_NAMES.report02 : undefined,
  };
};
