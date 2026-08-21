import { act, fireEvent, render } from '@testing-library/react-native';
import { Pressable, Text } from 'react-native';

import { ToastProvider, useToast } from '.';

import type { ToastType } from '@chapchap/shared/toast';

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

function ToastTypeFixture({ type }: { type: ToastType }) {
  const { showToast } = useToast();

  return (
    <Pressable onPress={() => showToast({ message: `${type} Toast`, type, duration: 0 })}>
      <Text>{type} 열기</Text>
    </Pressable>
  );
}

const TOAST_PRESENTATIONS = [
  { type: 'success', surfaceClassName: 'toast-default', hasIcon: true },
  { type: 'error', surfaceClassName: 'toast-default', hasIcon: true },
  { type: 'info', surfaceClassName: 'toast-info', hasIcon: false },
] as const;

const countNodesByType = (node: unknown, type: string): number => {
  if (!node || typeof node !== 'object') {
    return 0;
  }

  const element = node as { type?: unknown; children?: unknown[] };
  const childCount = element.children?.reduce<number>(
    (count, child) => count + countNodesByType(child, type),
    0
  );

  return (element.type === type ? 1 : 0) + (childCount ?? 0);
};

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

  it('화면 전용 위치에서는 Safe Area를 더하지 않는다', async () => {
    const { getByTestId } = await render(
      <ToastProvider bottomOffset={195} includeBottomSafeArea={false}>
        <ToastFixture />
      </ToastProvider>
    );

    expect(getByTestId('toast-viewport')).toHaveStyle({ bottom: 195 });
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

  it.each(TOAST_PRESENTATIONS)(
    '$type 타입에 지정된 아이콘과 표면 스타일을 적용한다',
    async ({ type, surfaceClassName, hasIcon }) => {
      const { getByRole, getByText, toJSON } = await render(
        <ToastProvider duration={0}>
          <ToastTypeFixture type={type} />
        </ToastProvider>
      );

      await act(async () => fireEvent.press(getByText(`${type} 열기`)));

      const toast = getByRole('button', { name: `${type} Toast. 알림 닫기` });

      expect(toast).toHaveProp('className', expect.stringContaining(surfaceClassName));
      expect(countNodesByType(toJSON(), 'SvgMock')).toBe(hasIcon ? 1 : 0);
    }
  );
});
