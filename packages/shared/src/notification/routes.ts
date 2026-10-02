/** 푸시 payload의 `data.url`에서 허용할 정적 경로입니다. 알림 종류별 목적지는 아래 매핑에서 별도로 관리합니다. */
export const NOTIFICATION_ALLOWED_PATHS = {
  notifications: '/notifications',
  report: '/report',
  spendingHistory: '/report/history',
  frequentShopList: '/report/frequent-shops',
  monthlyRecordList: '/report/monthly-records',
  monthlyReport: '/report/monthly-report',
} as const;

export const NOTIFICATION_TYPE_PATHS = {
  REPORT_COMPLETED: NOTIFICATION_ALLOWED_PATHS.monthlyReport,
  FRIDAY_REMINDER: '/record',
} as const;

/** 푸시 payload에서 허용하는 동적 경로 패턴입니다. */
export const NOTIFICATION_ALLOWED_PATH_PATTERNS = {
  shopDetail: '/home/shop/:shopId',
} as const;

const STATIC_NOTIFICATION_PATHS: ReadonlySet<string> = new Set(
  Object.values(NOTIFICATION_ALLOWED_PATHS)
);
const SHOP_DETAIL_PATH_PREFIX = NOTIFICATION_ALLOWED_PATH_PATTERNS.shopDetail.replace(
  ':shopId',
  ''
);

/** 알림 종류별로 연결할 앱 내부 경로를 반환합니다. 알 수 없는 종류는 이동 경로가 없습니다. */
export const resolveNotificationTypePath = (type: unknown) => {
  if (
    typeof type !== 'string' ||
    !Object.prototype.hasOwnProperty.call(NOTIFICATION_TYPE_PATHS, type)
  ) {
    return undefined;
  }

  return NOTIFICATION_TYPE_PATHS[type as keyof typeof NOTIFICATION_TYPE_PATHS];
};

/** 푸시 payload의 URL을 허용된 앱 내부 경로로 제한합니다. */
export const resolveNotificationPath = (value: unknown) => {
  if (typeof value !== 'string') return NOTIFICATION_ALLOWED_PATHS.notifications;

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

  return NOTIFICATION_ALLOWED_PATHS.notifications;
};
