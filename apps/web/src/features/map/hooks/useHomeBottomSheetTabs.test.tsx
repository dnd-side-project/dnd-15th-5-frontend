import { act, fireEvent, render, screen } from '@testing-library/react';
import { createPortal } from 'react-dom';

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
        <ul data-testid="month-list" style={{ overflowY: 'auto' }}>
          <li>
            <button>11월</button>
          </li>
        </ul>
        {createPortal(<button>별도 시트</button>, document.body)}
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
  ['버튼의 방향키', 'button', { key: 'ArrowDown' }, true],
  ['버튼의 PageDown', 'button', { key: 'PageDown' }, true],
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

it.each([false, true])(
  '핀치 뒤 남은 한 손가락의 기준점을 잡고 추가 이동 시에만 복원을 취소한다: %s',
  (shouldMove) => {
    const { container, content, completeLayout } = setupPendingRestoration();
    const touch = (clientY: number) => ({ identifier: 1, clientX: 100, clientY });
    fireEvent.touchStart(content, { touches: [touch(100)] });
    fireEvent.touchMove(content, { touches: [touch(110), { ...touch(120), identifier: 2 }] });
    fireEvent.touchMove(content, { touches: [touch(140)] });
    if (shouldMove) fireEvent.touchMove(content, { touches: [touch(160)] });
    completeLayout();
    expect(container.scrollTop).toBe(shouldMove ? 0 : 240);
  }
);

it.each([
  ['wheel', 100, 120, false],
  ['wheel', 100, -120, false],
  ['wheel', 0, -120, true],
  ['wheel', 200, 120, true],
  ['wheel', 0, 120, false],
  ['wheel', 200, -120, false],
  ['touch', 100, 40, false],
  ['touch', 100, -40, false],
  ['touch', 0, -40, true],
  ['touch', 200, 40, true],
  ['key', 100, 1, false],
  ['key', 200, 1, true],
  ['key', 0, -1, true],
] as const)(
  '중첩 목록의 %s 이동을 방향과 경계에 따라 처리한다: top=%s, delta=%s',
  (type, top, delta, shouldCancel) => {
    const { container, completeLayout } = setupPendingRestoration();
    const list = screen.getByTestId('month-list');
    Object.defineProperties(list, { scrollHeight: { value: 300 }, clientHeight: { value: 100 } });
    list.scrollTop = top;
    const row = screen.getByRole('button', { name: '11월' });
    if (type === 'wheel') {
      fireEvent.wheel(row, { deltaY: delta });
    } else if (type === 'touch') {
      fireEvent.touchStart(row, { touches: [{ identifier: 1, clientX: 100, clientY: 100 }] });
      fireEvent.touchMove(row, {
        touches: [{ identifier: 1, clientX: 100, clientY: 100 - delta }],
      });
    } else {
      fireEvent.keyDown(row, { key: delta > 0 ? 'ArrowDown' : 'ArrowUp' });
    }
    completeLayout();
    expect(container.scrollTop).toBe(shouldCancel ? 0 : 240);
  }
);

it('포털의 다른 시트에서 스크롤해도 홈 시트 복원은 유지한다', () => {
  const { container, completeLayout } = setupPendingRestoration();
  fireEvent.wheel(screen.getByRole('button', { name: '별도 시트' }), { deltaY: 120 });
  completeLayout();
  expect(container.scrollTop).toBe(240);
});

it('안쪽 목록의 끝에서 이동 방향을 바꾸면 새 방향으로 스크롤할 수 있는지 확인한다', () => {
  const { container, completeLayout } = setupPendingRestoration();
  const list = screen.getByTestId('month-list');
  Object.defineProperties(list, { scrollHeight: { value: 300 }, clientHeight: { value: 100 } });
  list.scrollTop = 100;
  const touch = (clientY: number) => ({ identifier: 1, clientX: 100, clientY });
  fireEvent.touchStart(list, { touches: [touch(100)] });
  fireEvent.touchMove(list, { touches: [touch(60)] });
  list.scrollTop = 200;
  fireEvent.touchMove(list, { touches: [touch(80)] });
  completeLayout();
  expect(container.scrollTop).toBe(240);
});
