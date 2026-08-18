import { fireEvent, render } from '@testing-library/react-native';

import { BackButton } from '.';

describe('<BackButton />', () => {
  it('버튼을 누르면 전달받은 뒤로 가기 동작을 실행한다', async () => {
    const handlePress = jest.fn();

    const { getByRole } = await render(<BackButton onPress={handlePress} />);
    fireEvent.press(getByRole('button', { name: '이전 화면으로 돌아가기' }));

    expect(handlePress).toHaveBeenCalledTimes(1);
  });
});
