import { render } from '@testing-library/react-native';

import HomeScreen from './HomeScreen';

describe('<HomeScreen />', () => {
  const originalWebUrl = process.env.EXPO_PUBLIC_WEB_URL;

  afterEach(() => {
    process.env.EXPO_PUBLIC_WEB_URL = originalWebUrl;
  });

  it('웹 주소가 설정되지 않으면 안내 문구를 보여준다', async () => {
    delete process.env.EXPO_PUBLIC_WEB_URL;

    const { getByText } = await render(<HomeScreen />);

    getByText('웹 주소가 설정되지 않았습니다');
  });

  it('웹 주소가 있으면 안내 문구 대신 웹 화면을 띄운다', async () => {
    process.env.EXPO_PUBLIC_WEB_URL = 'http://192.168.0.2:5173';

    const { queryByText } = await render(<HomeScreen />);

    expect(queryByText('웹 주소가 설정되지 않았습니다')).toBeNull();
  });
});
