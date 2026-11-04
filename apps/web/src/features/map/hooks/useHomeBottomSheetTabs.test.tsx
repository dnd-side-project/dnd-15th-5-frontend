import { act, fireEvent, render, screen } from '@testing-library/react';

import { useHomeBottomSheetStore } from '@/features/map/stores/homeBottomSheetStore';

import { useHomeBottomSheetTabs } from './useHomeBottomSheetTabs';

function TabsFixture() {
  const {
    contentRootRef,
    handleContentTouchStart,
    handleContentTouchMove,
    handleContentWheel,
    handleTabChange,
    handleContentKeyDown,
  } = useHomeBottomSheetTabs(true);
  return (
    <div data-testid="scroll-container">
      <div
        ref={contentRootRef}
        data-testid="content"
        onTouchStartCapture={handleContentTouchStart}
        onTouchMoveCapture={handleContentTouchMove}
        onWheelCapture={handleContentWheel}
        onKeyDown={handleContentKeyDown}
      >
        <button onClick={() => handleTabChange('history')}>소비 기록</button>
        <input aria-label="검색" />
      </div>
    </div>
  );
}

const originalObserver = globalThis.ResizeObserver;
let resize: ResizeObserverCallback;

beforeEach(() => {
  useHomeBottomSheetStore.setState({
    tab: 'frequentShops',
    scrollPositions: { frequentShops: 0, history: 240 },
  });
  globalThis.ResizeObserver = jest.fn((callback: ResizeObserverCallback) => {
    resize = callback;
    return { observe: jest.fn(), unobserve: jest.fn(), disconnect: jest.fn() };
  });
});

afterEach(() => {
  globalThis.ResizeObserver = originalObserver;
});

const setupPendingRestoration = () => {
  render(<TabsFixture />);
  const container = screen.getByTestId('scroll-container');
  let maxScrollTop = 0;
  let scrollTop = 0;
  Object.defineProperty(container, 'scrollTop', {
    get: () => scrollTop,
    set: (value: number) => {
      scrollTop = Math.min(maxScrollTop, value);
    },
  });
  fireEvent.click(screen.getByRole('button', { name: '소비 기록' }));
  return {
    container,
    content: screen.getByTestId('content'),
    completeLayout: () => {
      maxScrollTop = 500;
      act(() => resize([], {} as ResizeObserver));
    },
  };
};

it.each([
  ['가로 휠', 'wheel', { deltaX: 120, deltaY: 0 }, false],
  ['가로 위주의 대각선 휠', 'wheel', { deltaX: 120, deltaY: 30 }, false],
  ['Ctrl 휠 확대', 'wheel', { deltaY: 120, ctrlKey: true }, false],
  ['Shift 휠 가로 이동', 'wheel', { deltaY: 120, shiftKey: true }, false],
  ['세로 휠', 'wheel', { deltaY: 120 }, true],
  ['가로 터치', 'touch', { clientX: 140, clientY: 105 }, false],
  ['세로 터치', 'touch', { clientX: 105, clientY: 140 }, true],
  ['손가락의 미세한 흔들림', 'touch', { clientX: 100, clientY: 102 }, false],
  ['핀치', 'pinch', { clientX: 105, clientY: 140 }, false],
] as const)(
  '%s는 세로 스크롤 의도에 따라서만 대기 중인 복원을 취소한다',
  (_name, type, data, shouldCancel) => {
    const { container, content, completeLayout } = setupPendingRestoration();
    if (type === 'wheel') {
      fireEvent.wheel(content, data);
    } else {
      fireEvent.touchStart(content, { touches: [{ identifier: 1, clientX: 100, clientY: 100 }] });
      const touches = [{ identifier: 1, ...data }];
      if (type === 'pinch') touches.push({ identifier: 2, ...data });
      fireEvent.touchMove(content, { touches });
    }
    completeLayout();
    expect(container.scrollTop).toBe(shouldCancel ? 0 : 240);
  }
);

it.each([
  ['버튼의 Space', 'button', { key: ' ' }, false],
  ['입력창의 방향키', 'input', { key: 'ArrowDown' }, false],
  ['스크롤 영역의 방향키', 'content', { key: 'ArrowDown' }, true],
  ['단축키 조합', 'content', { key: 'End', ctrlKey: true }, false],
] as const)(
  '%s는 실제 스크롤 키 조작일 때만 복원을 취소한다',
  (_name, target, event, shouldCancel) => {
    const { container, content, completeLayout } = setupPendingRestoration();
    const element =
      target === 'button'
        ? screen.getByRole('button', { name: '소비 기록' })
        : target === 'input'
          ? screen.getByRole('textbox', { name: '검색' })
          : content;
    fireEvent.keyDown(element, event);
    completeLayout();
    expect(container.scrollTop).toBe(shouldCancel ? 0 : 240);
  }
);
