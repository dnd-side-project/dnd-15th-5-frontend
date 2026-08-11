import { render } from '@testing-library/react-native';

import HomeScreen from './HomeScreen';

const mockUseForegroundLocationPermission = jest.fn();

jest.mock('@/native/location', () => ({
  useForegroundLocationPermission: (isEnabled: boolean) =>
    mockUseForegroundLocationPermission(isEnabled),
}));

describe('<HomeScreen />', () => {
  const originalWebUrl = process.env.EXPO_PUBLIC_WEB_URL;

  beforeEach(() => {
    mockUseForegroundLocationPermission.mockReset();
    mockUseForegroundLocationPermission.mockReturnValue(true);
  });

  afterEach(() => {
    process.env.EXPO_PUBLIC_WEB_URL = originalWebUrl;
  });

  it('웹 주소가 설정되지 않으면 위치 권한을 요청하지 않고 안내 문구를 보여준다', async () => {
    delete process.env.EXPO_PUBLIC_WEB_URL;

    const { getByText } = await render(<HomeScreen />);

    getByText('웹 주소가 설정되지 않았습니다');
    expect(mockUseForegroundLocationPermission).toHaveBeenCalledWith(false);
  });

  it('위치 권한 요청을 마친 뒤 웹 화면을 띄운다', async () => {
    process.env.EXPO_PUBLIC_WEB_URL = 'http://192.168.0.2:5173';

    const { getByTestId } = await render(<HomeScreen />);

    expect(mockUseForegroundLocationPermission).toHaveBeenCalledWith(true);
    expect(getByTestId('home-webview')).toBeTruthy();
  });

  it('위치 권한 요청이 끝나기 전에는 웹 화면을 띄우지 않는다', async () => {
    process.env.EXPO_PUBLIC_WEB_URL = 'http://192.168.0.2:5173';
    mockUseForegroundLocationPermission.mockReturnValue(false);

    const { queryByTestId } = await render(<HomeScreen />);

    expect(queryByTestId('home-webview')).toBeNull();
  });
});
