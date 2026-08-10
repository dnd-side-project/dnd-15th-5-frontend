import { render } from '@testing-library/react-native';

import HomeScreen from './HomeScreen';

describe('<HomeScreen />', () => {
  it('웹 주소가 설정되지 않으면 안내 문구를 보여준다', async () => {
    const { getByText } = await render(<HomeScreen />);

    getByText('웹 주소가 설정되지 않았습니다');
  });
});
