import { requestWebViewNavigation, subscribeWebViewNavigation } from './webViewNavigation';

describe('webViewNavigation', () => {
  it('구독 중인 메인 WebView에 이동 경로를 전달한다', () => {
    const listener = jest.fn();
    const unsubscribe = subscribeWebViewNavigation(listener);

    requestWebViewNavigation('/home');

    expect(listener).toHaveBeenCalledWith('/home');
    unsubscribe();
  });

  it('구독 전에 요청한 마지막 이동 경로를 구독 시 한 번 전달한다', () => {
    requestWebViewNavigation('/record');
    requestWebViewNavigation('/home');
    const listener = jest.fn();

    const unsubscribe = subscribeWebViewNavigation(listener);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith('/home');
    unsubscribe();
  });
});
