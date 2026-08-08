import { render } from '@testing-library/react-native';

import HomeScreen from '../src/app/index';

describe('<HomeScreen />', () => {
  it('앱 이름을 표시한다', async () => {
    const { getByText } = await render(<HomeScreen />);

    getByText('Chapchap');
  });
});
