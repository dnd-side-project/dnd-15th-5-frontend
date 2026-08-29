import { act, render, userEvent, waitFor, within } from '@testing-library/react-native';
import { AccessibilityInfo, Animated } from 'react-native';

import VisitDateTimePicker from './VisitDateTimePicker';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 47, right: 0, bottom: 34, left: 0 }),
}));

const isReduceMotionEnabledSpy = jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled');

beforeAll(() => {
  jest.spyOn(Animated, 'timing').mockImplementation(
    (value, config) =>
      ({
        start: (callback) => {
          (value as Animated.Value).setValue(config.toValue as number);
          callback?.({ finished: true });
        },
        stop: jest.fn(),
        reset: jest.fn(),
      }) as Animated.CompositeAnimation
  );
});

afterAll(() => jest.restoreAllMocks());

describe('<VisitDateTimePicker />', () => {
  beforeEach(() => {
    isReduceMotionEnabledSpy.mockReset().mockResolvedValue(false);
    jest.mocked(Animated.timing).mockClear();
  });

  it('모션 감소 설정을 확인하기 전에는 진입 애니메이션을 시작하지 않는다', async () => {
    let resolveReduceMotion!: (enabled: boolean) => void;
    isReduceMotionEnabledSpy.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveReduceMotion = resolve;
      })
    );

    await render(
      <VisitDateTimePicker
        value={{ date: new Date(), period: 'afternoon' }}
        onClose={jest.fn()}
        onConfirm={jest.fn()}
      />
    );

    expect(Animated.timing).not.toHaveBeenCalled();

    await act(async () => {
      resolveReduceMotion(true);
    });

    await waitFor(() => expect(Animated.timing).toHaveBeenCalledTimes(2));
    jest.mocked(Animated.timing).mock.calls.forEach(([, config]) => {
      expect(config).toEqual(expect.objectContaining({ duration: 0 }));
    });
  });

  it('모션 감소 설정 조회에 실패하면 애니메이션을 생략한다', async () => {
    isReduceMotionEnabledSpy.mockRejectedValueOnce(new Error('설정 조회 실패'));

    await render(
      <VisitDateTimePicker
        value={{ date: new Date(), period: 'afternoon' }}
        onClose={jest.fn()}
        onConfirm={jest.fn()}
      />
    );

    await waitFor(() => expect(Animated.timing).toHaveBeenCalledTimes(2));
    jest.mocked(Animated.timing).mock.calls.forEach(([, config]) => {
      expect(config).toEqual(expect.objectContaining({ duration: 0 }));
    });
  });

  it('미래 날짜를 막고 선택한 날짜와 시간대를 확인한다', async () => {
    const onConfirm = jest.fn();
    const user = userEvent.setup();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const selectedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
    const futureDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    const { getByRole } = await render(
      <VisitDateTimePicker
        value={{ date: today, period: 'afternoon' }}
        onClose={jest.fn()}
        onConfirm={onConfirm}
      />
    );

    expect(
      getByRole('button', {
        name: `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`,
      })
    ).toHaveProp('accessibilityState', { selected: true, disabled: false });
    expect(getByRole('button', { name: '다음 달' })).toBeDisabled();

    if (futureDate.getMonth() === today.getMonth()) {
      expect(
        getByRole('button', {
          name: `${futureDate.getFullYear()}년 ${futureDate.getMonth() + 1}월 ${futureDate.getDate()}일`,
        })
      ).toBeDisabled();
    }

    if (selectedDate.getMonth() !== today.getMonth()) {
      await user.press(getByRole('button', { name: '이전 달' }));
    }

    await user.press(
      getByRole('button', {
        name: `${selectedDate.getFullYear()}년 ${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일`,
      })
    );
    await user.press(getByRole('button', { name: '저녁' }));
    await user.press(
      getByRole('button', {
        name: `${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일 저녁`,
      })
    );

    await waitFor(() =>
      expect(onConfirm).toHaveBeenCalledWith({ date: selectedDate, period: 'evening' })
    );
  });

  it('모든 주를 일요일부터 토요일까지 7개 칸으로 표시한다', async () => {
    const { getAllByTestId } = await render(
      <VisitDateTimePicker
        value={{ date: new Date(), period: 'afternoon' }}
        onClose={jest.fn()}
        onConfirm={jest.fn()}
      />
    );

    getAllByTestId('calendar-week').forEach((week) => {
      expect(within(week).getAllByTestId('calendar-cell')).toHaveLength(7);
    });
  });

  it('시간대 선택 버튼 아래 여백으로 4주와 5주 달을 6주 높이에 맞춘다', async () => {
    const user = userEvent.setup();
    const { getByTestId, queryByTestId, getByRole } = await render(
      <VisitDateTimePicker
        value={{ date: new Date(2015, 1, 15), period: 'afternoon' }}
        onClose={jest.fn()}
        onConfirm={jest.fn()}
      />
    );

    expect(getByTestId('calendar-height-spacer')).toHaveProp('className', 'h-20');

    await user.press(getByRole('button', { name: '다음 달' }));

    expect(getByTestId('calendar-height-spacer')).toHaveProp('className', 'h-10');

    await user.press(getByRole('button', { name: '다음 달' }));
    await user.press(getByRole('button', { name: '다음 달' }));

    expect(queryByTestId('calendar-height-spacer')).toBeNull();
  });

  it('핸들을 아래로 드래그하면 바텀시트를 닫는다', async () => {
    const onClose = jest.fn();
    const { getByTestId } = await render(
      <VisitDateTimePicker
        value={{ date: new Date(), period: 'afternoon' }}
        onClose={onClose}
        onConfirm={jest.fn()}
      />
    );

    const handle = getByTestId('bottom-sheet-handle');
    expect(handle.props.onStartShouldSetResponder()).toBe(true);
    await act(async () => {
      handle.props.onResponderGrant({ nativeEvent: { pageY: 100 } });
      handle.props.onResponderMove({ nativeEvent: { pageY: 200 } });
      handle.props.onResponderRelease();
    });

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  it('배경을 누르면 선택값을 반영하지 않고 닫는다', async () => {
    const onClose = jest.fn();
    const onConfirm = jest.fn();
    const user = userEvent.setup();
    const now = new Date();
    const { getByRole } = await render(
      <VisitDateTimePicker
        value={{ date: now, period: 'afternoon' }}
        onClose={onClose}
        onConfirm={onConfirm}
      />
    );

    await user.press(getByRole('button', { name: '방문 일시 선택 닫기' }));

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
