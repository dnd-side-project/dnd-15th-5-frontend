import { act, fireEvent, renderHook } from '@testing-library/react';

import { usePrefersReducedMotion } from '@/shared/hooks/usePrefersReducedMotion';

import { useShopStickerCollapse } from './useShopStickerCollapse';

jest.mock('@/shared/hooks/usePrefersReducedMotion', () => ({
  usePrefersReducedMotion: jest.fn(() => false),
}));

const STOP_POSITION = 268;
const setup = () => {
  const root = document.createElement('div');
  const panel = document.createElement('div');
  root.append(panel);
  Object.defineProperties(root, {
    clientHeight: { value: 600 },
    scrollHeight: { value: 1500 },
  });
  jest
    .spyOn(panel, 'getBoundingClientRect')
    .mockImplementation(() => ({ top: STOP_POSITION - root.scrollTop }) as DOMRect);
  const scrollRootRef = { current: root };
  const informationPanelRef = { current: panel };
  const hook = renderHook(() => useShopStickerCollapse({ scrollRootRef, informationPanelRef }));
  return { root, ...hook };
};

const wheel = (root: HTMLElement, deltaY: number, extra: WheelEventInit = {}) => {
  const event = new WheelEvent('wheel', { deltaY, bubbles: true, cancelable: true, ...extra });
  fireEvent(root, event);
  return event;
};

beforeEach(() => {
  jest.useFakeTimers();
  jest.mocked(usePrefersReducedMotion).mockReturnValue(false);
});
afterEach(() => jest.useRealTimers());

it('64px 전에는 일반 스크롤하고 기준을 넘으면 스티커를 완전히 접는다', () => {
  const { root } = setup();
  expect(wheel(root, 32).defaultPrevented).toBe(false);
  root.scrollTop = 63;
  fireEvent.scroll(root);
  act(() => jest.advanceTimersByTime(300));
  expect(root.scrollTop).toBe(63);
  root.scrollTop = 64;
  fireEvent.scroll(root);
  act(() => jest.advanceTimersByTime(80));
  expect(root.scrollTop).toBeGreaterThan(64);
  expect(root.scrollTop).toBeLessThan(STOP_POSITION);
  act(() => jest.advanceTimersByTime(220));
  expect(root.scrollTop).toBe(STOP_POSITION);
});

it('한 번의 큰 휠 입력도 카드를 지나치지 않고 가게 정보 상단에 정착한다', () => {
  const { root } = setup();
  expect(wheel(root, 600).defaultPrevented).toBe(true);
  expect(root.scrollTop).toBe(0);
  act(() => jest.advanceTimersByTime(300));
  expect(root.scrollTop).toBe(STOP_POSITION);
});

it('연속 휠 입력은 전환을 재시작하지 않고 다음 제스처부터 아래로 스크롤한다', () => {
  const { root } = setup();
  wheel(root, 100);
  for (let index = 0; index < 4; index += 1) {
    act(() => jest.advanceTimersByTime(80));
    expect(wheel(root, 30).defaultPrevented).toBe(true);
  }
  expect(root.scrollTop).toBe(STOP_POSITION);
  act(() => jest.advanceTimersByTime(170));
  expect(wheel(root, 100).defaultPrevented).toBe(false);
  root.scrollTop = STOP_POSITION + 100;
  fireEvent.scroll(root);
  act(() => jest.advanceTimersByTime(300));
  expect(root.scrollTop).toBe(STOP_POSITION + 100);
});

it('위로 스크롤하면 전환을 중단하고 처음으로 돌아온 뒤 다시 접을 수 있다', () => {
  const { root } = setup();
  wheel(root, 100);
  act(() => jest.advanceTimersByTime(80));
  expect(wheel(root, -100).defaultPrevented).toBe(false);
  const interruptedPosition = root.scrollTop;
  act(() => jest.advanceTimersByTime(300));
  expect(root.scrollTop).toBe(interruptedPosition);
  root.scrollTop = 0;
  fireEvent.scroll(root);
  expect(wheel(root, 100).defaultPrevented).toBe(true);
  act(() => jest.advanceTimersByTime(300));
  expect(root.scrollTop).toBe(STOP_POSITION);
});

it('가로 스와이프와 브라우저 확대는 가로채지 않는다', () => {
  const { root } = setup();
  expect(wheel(root, 100, { deltaX: 200 }).defaultPrevented).toBe(false);
  expect(wheel(root, 100, { ctrlKey: true }).defaultPrevented).toBe(false);
  expect(jest.getTimerCount()).toBe(0);
});

it('모션 감소 설정에서는 즉시 접는다', () => {
  jest.mocked(usePrefersReducedMotion).mockReturnValue(true);
  const { root } = setup();
  wheel(root, 100);
  expect(root.scrollTop).toBe(STOP_POSITION);
  expect(jest.getTimerCount()).toBe(0);
});

it('화면을 나가면 진행 중인 전환과 이벤트 처리를 해제한다', () => {
  const { root, unmount } = setup();
  wheel(root, 100);
  unmount();
  act(() => jest.advanceTimersByTime(300));
  expect(root.scrollTop).toBe(0);
  expect(wheel(root, 100).defaultPrevented).toBe(false);
  expect(jest.getTimerCount()).toBe(0);
});
