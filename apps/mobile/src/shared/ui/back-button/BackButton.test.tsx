import { fireEvent, render } from '@testing-library/react-native';

import { BackButton } from '.';

const findNodeByType = (
  node: unknown,
  type: string
): { props?: Record<string, unknown> } | undefined => {
  if (!node || typeof node !== 'object') {
    return undefined;
  }

  const element = node as {
    type?: unknown;
    props?: Record<string, unknown>;
    children?: unknown[];
  };

  if (element.type === type) {
    return element;
  }

  return element.children?.map((child) => findNodeByType(child, type)).find(Boolean);
};

describe('<BackButton />', () => {
  it('버튼을 누르면 전달받은 뒤로 가기 동작을 실행한다', async () => {
    const handlePress = jest.fn();

    const { getByRole } = await render(<BackButton onPress={handlePress} />);
    fireEvent.press(getByRole('button', { name: '이전 화면으로 돌아가기' }));

    expect(handlePress).toHaveBeenCalledTimes(1);
  });

  it('웹 BackButton과 같은 크기의 화살표를 24px 터치 영역 중앙에 표시한다', async () => {
    const { getByRole, toJSON } = await render(<BackButton onPress={jest.fn()} />);

    expect(getByRole('button', { name: '이전 화면으로 돌아가기' })).toHaveProp(
      'className',
      expect.stringContaining('h-6 w-6 items-center justify-center')
    );
    expect(findNodeByType(toJSON(), 'SvgMock')?.props).toMatchObject({ width: 10, height: 18 });
  });

  it('비활성화하면 뒤로 가기 동작을 실행하지 않는다', async () => {
    const handlePress = jest.fn();
    const { getByRole } = await render(<BackButton onPress={handlePress} disabled />);
    const button = getByRole('button', { name: '이전 화면으로 돌아가기' });

    fireEvent.press(button);

    expect(button).toBeDisabled();
    expect(handlePress).not.toHaveBeenCalled();
  });
});
