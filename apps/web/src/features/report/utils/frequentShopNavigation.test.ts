import {
  createFrequentShopListPath,
  getFrequentShopPeriod,
  updateFrequentShopPeriodSearchParams,
} from './frequentShopNavigation';

describe('frequentShopNavigation', () => {
  it('선택한 집계 기간이 포함된 단골 리스트 경로를 생성한다', () => {
    expect(createFrequentShopListPath('all')).toBe('/report/frequent-shops?period=all');
  });

  it('URL에 지정된 집계 기간을 반환한다', () => {
    expect(getFrequentShopPeriod(new URLSearchParams('period=all'))).toBe('all');
    expect(getFrequentShopPeriod(new URLSearchParams('period=currentMonth'))).toBe('currentMonth');
  });

  it.each(['', 'source=report', 'period=invalid'])(
    '유효한 집계 기간이 없으면(%s) 이번 달을 반환한다',
    (search) => {
      expect(getFrequentShopPeriod(new URLSearchParams(search))).toBe('currentMonth');
    }
  );

  it('기존 검색 파라미터를 유지하며 집계 기간을 갱신한다', () => {
    const searchParams = new URLSearchParams('category=cafe&period=all');

    expect(updateFrequentShopPeriodSearchParams(searchParams, 'currentMonth').toString()).toBe(
      'category=cafe&period=currentMonth'
    );
  });
});
