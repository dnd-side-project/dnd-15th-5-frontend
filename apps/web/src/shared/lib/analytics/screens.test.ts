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

  it.each([
    ['/home/', '/home'],
    ['/report/', '/report'],
    ['/home/shop/123/', '/home/shop/123'],
    ['/share/private-token/', '/share/private-token'],
  ])('후행 슬래시가 있는 %s를 %s와 같은 화면으로 처리한다', (pathname, canonicalPathname) => {
    expect(getScreenMetadata(pathname)).toEqual(getScreenMetadata(canonicalPathname));
  });

  it('알 수 없는 경로의 원문을 이벤트 속성에 노출하지 않는다', () => {
    expect(getScreenMetadata('/unknown/private-token/')).toEqual({
      screenName: 'ETC_NotFound',
      screenPath: 'ETC_NotFound',
    });
  });
});
