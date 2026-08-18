import { act, fireEvent, render } from '@testing-library/react-native';
import { Pressable, Text } from 'react-native';

import { ToastProvider, useToast } from '.';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 34, left: 0 }),
}));

function ToastFixture() {
  const { showToast } = useToast();

  return (
    <Pressable onPress={() => showToast({ message: '저장되었어요', type: 'success' })}>
      <Text>열기</Text>
    </Pressable>
  );
}

describe('ToastProvider', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(async () => {
    await act(async () => jest.runOnlyPendingTimers());
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('하단 Safe Area에 기본 여백을 더해 배치한다', async () => {
    const { getByTestId } = await render(
      <ToastProvider>
        <ToastFixture />
      </ToastProvider>
    );

    const viewport = getByTestId('toast-viewport');

    expect(viewport).toHaveStyle({ bottom: 54 });
    expect(viewport).toHaveProp('className', expect.stringContaining('right-4 left-4'));
  });

  it('Toast를 노출하고 지정한 시간이 지나면 닫는다', async () => {
    const { getByText, queryByText } = await render(
      <ToastProvider duration={1000}>
        <ToastFixture />
      </ToastProvider>
    );

    await act(async () => fireEvent.press(getByText('열기')));
    expect(getByText('저장되었어요')).toBeTruthy();

    await act(async () => jest.advanceTimersByTime(1000));
    expect(queryByText('저장되었어요')).toBeNull();
  });

  it('Toast를 누르면 바로 닫는다', async () => {
    const { getByRole, getByText, queryByText } = await render(
      <ToastProvider duration={0}>
        <ToastFixture />
      </ToastProvider>
    );

    await act(async () => fireEvent.press(getByText('열기')));
    await act(async () =>
      fireEvent.press(getByRole('button', { name: '저장되었어요. 알림 닫기' }))
    );

    expect(queryByText('저장되었어요')).toBeNull();
  });

  it('최대 노출 개수를 초과하면 제거된 Toast의 타이머도 정리한다', async () => {
    const setTimeoutSpy = jest.spyOn(globalThis, 'setTimeout');
    const clearTimeoutSpy = jest.spyOn(globalThis, 'clearTimeout');
    const { getAllByText, getByText } = await render(
      <ToastProvider duration={60_000}>
        <ToastFixture />
      </ToastProvider>
    );

    for (let index = 0; index < 4; index += 1) {
      await act(async () => {
        fireEvent.press(getByText('열기'));
      });
    }

    const toastTimerIndexes = setTimeoutSpy.mock.calls.flatMap((call: unknown[], index: number) =>
      call[1] === 60_000 ? [index] : []
    );
    const firstToastTimer = setTimeoutSpy.mock.results[toastTimerIndexes[0]].value;

    expect(getAllByText('저장되었어요')).toHaveLength(3);
    expect(toastTimerIndexes).toHaveLength(4);
    expect(clearTimeoutSpy).toHaveBeenCalledWith(firstToastTimer);
  });
});
