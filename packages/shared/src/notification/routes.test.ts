import { NOTIFICATION_ROUTE_PATHS, resolveNotificationPath } from './routes';

describe('resolveNotificationPath', () => {
  it.each([
    '/notifications',
    '/report',
    '/report/monthly-report?yearMonth=2026-09',
    '/home/shop/123#sticker',
  ])('허용된 알림 경로를 유지한다: %s', (path) => {
    expect(resolveNotificationPath(path)).toBe(path);
  });

  it.each([
    undefined,
    123,
    'https://evil.example.com/report',
    '//evil.example.com/report',
    '/record',
    '/report/unknown',
    '/home/shop/',
    '/home/shop/123/edit',
  ])('허용되지 않은 값은 알림 목록으로 폴백한다: %s', (value) => {
    expect(resolveNotificationPath(value)).toBe(NOTIFICATION_ROUTE_PATHS.notifications);
  });
});
