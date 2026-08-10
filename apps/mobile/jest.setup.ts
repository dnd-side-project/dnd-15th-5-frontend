// WebView는 네이티브 모듈이 있어야 로드되므로, 테스트에서는 일반 View로 대체한다
jest.mock('react-native-webview', () => {
  const { View } = jest.requireActual('react-native');

  return { WebView: View };
});
