import { formatNotificationElapsedTime, toNotificationItems } from './notifications';

describe('notification utils', () => {
  const now = new Date('2026-08-28T12:00:00+09:00');

  it.each([
    ['2026-08-28T11:59:30+09:00', '방금'],
    ['2026-08-28T11:45:00+09:00', '15분전'],
    ['2026-08-28T10:00:00+09:00', '2시간전'],
    ['2026-08-25T12:00:00+09:00', '3일전'],
  ])('생성 시각 %s를 %s으로 표시한다', (createdAt, expected) => {
    expect(formatNotificationElapsedTime(createdAt, now)).toBe(expected);
  });

  it('API 알림을 화면 모델로 변환한다', () => {
    expect(
      toNotificationItems(
        [
          {
            id: 12,
            title: '리포트가 완성됐어요',
            body: '이번 달 소비 취향을 확인해 보세요.',
            read: false,
            createdAt: '2026-08-28T10:00:00+09:00',
          },
        ],
        now
      )
    ).toEqual([
      {
        id: '12',
        title: '리포트가 완성됐어요',
        description: '이번 달 소비 취향을 확인해 보세요.',
        elapsedTime: '2시간전',
        isRead: false,
      },
    ]);
  });
});
