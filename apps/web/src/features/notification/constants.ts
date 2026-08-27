import type { NotificationItem } from './types';

const RECEIPT_NOTIFICATION = {
  title: '지갑 속에 잠자는 영수증이 있나요?',
  description: '3초 안에 찰칵 ! 이번 주 나의 단골 매장 순위를 업데이트 해보세요.',
} as const;

export const RECENT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'monthly-report-ready',
    title: '이번 달 소비 취향이 완성됐어요 !',
    description: '이번 달 가장 자주 찾은 동네와 소비 성향을 한눈에 확인해 보세요.',
    elapsedTime: '방금',
    isRead: false,
  },
  {
    id: 'receipt-reminder-02-hours',
    ...RECEIPT_NOTIFICATION,
    elapsedTime: '2시간전',
    isRead: false,
  },
  {
    id: 'receipt-reminder-02-days',
    ...RECEIPT_NOTIFICATION,
    elapsedTime: '2일전',
    isRead: false,
  },
  {
    id: 'receipt-reminder-03-days-unread',
    ...RECEIPT_NOTIFICATION,
    elapsedTime: '3일전',
    isRead: false,
  },
];

export const PREVIOUS_NOTIFICATIONS: NotificationItem[] = Array.from({ length: 3 }, (_, index) => ({
  id: `receipt-reminder-03-days-read-${index + 1}`,
  ...RECEIPT_NOTIFICATION,
  elapsedTime: '3일전',
  isRead: true,
}));
