import { getScreenMetadata, UT_SCREEN_NAMES } from './screens';

describe('getScreenMetadata', () => {
  it('UT 대상 화면을 기획 화면 코드와 연결한다', () => {
    expect(getScreenMetadata('/home')).toEqual({
      screenName: UT_SCREEN_NAMES.mapMain,
      screenPath: '/home',
      utCompletionTarget: undefined,
    });
    expect(getScreenMetadata('/home/shop/123')).toEqual({
      screenName: UT_SCREEN_NAMES.mapPlaceDetail02,
      screenPath: '/home/shop/:shopId',
      utCompletionTarget: UT_SCREEN_NAMES.mapPlaceDetail02,
    });
    expect(getScreenMetadata('/report')).toEqual({
      screenName: UT_SCREEN_NAMES.report02,
      screenPath: '/report',
      utCompletionTarget: UT_SCREEN_NAMES.report02,
    });
  });

  it('동적 식별자를 이벤트 속성에 노출하지 않는다', () => {
    expect(getScreenMetadata('/share/private-token')).toEqual({
      screenName: 'REP_Shared',
      screenPath: '/share/:shareToken',
    });
  });
});
