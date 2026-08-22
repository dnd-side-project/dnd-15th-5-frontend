// INFO: WebView는 네이티브 모듈이 있어야 로드되므로, 테스트에서는 일반 View로 대체한다
jest.mock('react-native-webview', () => {
  const { View } = jest.requireActual('react-native');

  return { WebView: View };
});

// INFO: 사진 보관함은 네이티브 런타임이 필요하므로 단위 테스트에서는 API 형태만 대체한다
jest.mock('expo-media-library', () => ({
  Asset: { create: jest.fn() },
  requestPermissionsAsync: jest.fn(),
}));

// INFO: Lottie는 네이티브 뷰가 필요하므로 테스트에서는 렌더 가능한 View로 대체한다
jest.mock('lottie-react-native', () => {
  const { View } = jest.requireActual('react-native');

  return { __esModule: true, default: View };
});
