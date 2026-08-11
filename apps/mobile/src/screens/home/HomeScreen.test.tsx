import { render, waitFor } from '@testing-library/react-native';

import HomeScreen from './HomeScreen';

const mockRequestForegroundPermissionsAsync = jest.fn();

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: () => mockRequestForegroundPermissionsAsync(),
}));

describe('<HomeScreen />', () => {
  const originalWebUrl = process.env.EXPO_PUBLIC_WEB_URL;

  beforeEach(() => {
    mockRequestForegroundPermissionsAsync.mockReset();
    mockRequestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
  });

  afterEach(() => {
    process.env.EXPO_PUBLIC_WEB_URL = originalWebUrl;
  });

  it('웹 주소가 설정되지 않으면 안내 문구를 보여준다', async () => {
    delete process.env.EXPO_PUBLIC_WEB_URL;

    const { getByText } = await render(<HomeScreen />);

    getByText('웹 주소가 설정되지 않았습니다');
  });

  it('위치 권한 요청을 마친 뒤 웹 화면을 띄운다', async () => {
    process.env.EXPO_PUBLIC_WEB_URL = 'http://192.168.0.2:5173';

    const { getByTestId } = await render(<HomeScreen />);

    await waitFor(() => {
      expect(mockRequestForegroundPermissionsAsync).toHaveBeenCalledTimes(1);
      expect(getByTestId('home-webview')).toBeTruthy();
    });
  });

  it('위치 권한 요청이 실패해도 웹 화면을 띄운다', async () => {
    process.env.EXPO_PUBLIC_WEB_URL = 'http://192.168.0.2:5173';
    mockRequestForegroundPermissionsAsync.mockRejectedValue(new Error('권한 요청 실패'));

    const { getByTestId } = await render(<HomeScreen />);

    await waitFor(() => {
      expect(getByTestId('home-webview')).toBeTruthy();
    });
  });
});
