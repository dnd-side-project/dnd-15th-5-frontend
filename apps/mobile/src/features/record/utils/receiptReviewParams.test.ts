import {
  createReceiptReviewRouteParams,
  isRecordCategory,
  parseVisitDateTime,
} from './receiptReviewParams';

describe('receipt review route params', () => {
  it('유효한 방문 일시와 카테고리만 복원한다', () => {
    const now = new Date(2026, 7, 20, 15);
    const visitedAt = new Date(2026, 7, 19).getTime();

    expect(parseVisitDateTime(String(visitedAt), 'afternoon', now)).toEqual({
      date: new Date(visitedAt),
      period: 'afternoon',
    });
    expect(isRecordCategory('카페')).toBe(true);
    expect(isRecordCategory('알 수 없음')).toBe(false);
  });

  it('잘못됐거나 미래인 방문 일시는 폼 기본값을 사용하도록 버린다', () => {
    const now = new Date(2026, 7, 20, 15);

    expect(parseVisitDateTime('not-a-date', 'afternoon', now)).toBeUndefined();
    expect(
      parseVisitDateTime(String(new Date(2026, 7, 21).getTime()), 'afternoon', now)
    ).toBeUndefined();
    expect(parseVisitDateTime(String(now.getTime()), 'unknown', now)).toBeUndefined();
  });

  it('검색 화면을 왕복해도 가게 식별자와 작성값을 보존한다', () => {
    const visitDateTime = { date: new Date(2026, 7, 20), period: 'afternoon' as const };

    expect(
      createReceiptReviewRouteParams({
        shopId: 'place-01',
        shopName: '카페 차차',
        shopAddress: '서울특별시 마포구',
        shopPhotoUrl: null,
        visitDateTime,
        amount: '12000',
        category: '카페',
        receiptUri: 'file://receipt.jpg',
      })
    ).toEqual({
      uri: 'file://receipt.jpg',
      shopId: 'place-01',
      shopName: '카페 차차',
      shopAddress: '서울특별시 마포구',
      amount: '12000',
      visitedAt: String(visitDateTime.date.getTime()),
      visitPeriod: 'afternoon',
      category: '카페',
    });
  });
});
