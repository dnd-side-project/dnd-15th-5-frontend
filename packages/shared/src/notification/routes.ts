export const NOTIFICATION_ROUTE_PATHS = {
  notifications: '/notifications',
  report: '/report',
  spendingHistory: '/report/history',
  frequentShopList: '/report/frequent-shops',
  monthlyRecordList: '/report/monthly-records',
  monthlyReport: '/report/monthly-report',
} as const;

export const NOTIFICATION_ROUTE_PATTERNS = {
  shopDetail: '/home/shop/:shopId',
} as const;

const STATIC_NOTIFICATION_PATHS: ReadonlySet<string> = new Set(
  Object.values(NOTIFICATION_ROUTE_PATHS)
);
const SHOP_DETAIL_PATH_PREFIX = NOTIFICATION_ROUTE_PATTERNS.shopDetail.replace(':shopId', '');

/** 푸시 payload의 URL을 허용된 앱 내부 경로로 제한합니다. */
export const resolveNotificationPath = (value: unknown) => {
  if (typeof value !== 'string') return NOTIFICATION_ROUTE_PATHS.notifications;

  const [pathname] = value.split(/[?#]/, 1);

  if (pathname && STATIC_NOTIFICATION_PATHS.has(pathname)) {
    return value;
  }

  if (pathname?.startsWith(SHOP_DETAIL_PATH_PREFIX)) {
    const shopId = pathname.slice(SHOP_DETAIL_PATH_PREFIX.length);

    if (shopId.length > 0 && !shopId.includes('/')) {
      return value;
    }
  }

  return NOTIFICATION_ROUTE_PATHS.notifications;
};
