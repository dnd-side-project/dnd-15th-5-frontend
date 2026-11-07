import { fireEvent, render, screen } from '@testing-library/react';

import SwipeActions from './SwipeActions';

const pointer = (element: Element, type: string, x: number, y = 100) => {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperties(event, {
    pointerId: { value: 1 },
    isPrimary: { value: true },
    button: { value: 0 },
    clientX: { value: x },
    clientY: { value: y },
  });
  fireEvent(element, event);
};

it('가로 스와이프는 버튼을 열고 행의 이동 동작은 실행하지 않는다', () => {
  const onEdit = jest.fn();
  const onDelete = jest.fn();
  const onOpen = jest.fn();
  render(
    <SwipeActions label="카페" onEdit={onEdit} onDelete={onDelete}>
      <button onClick={onOpen}>기록 보기</button>
    </SwipeActions>
  );
  const content = screen.getByRole('button', { name: '기록 보기' }).parentElement!;
  pointer(content, 'pointerdown', 200);
  pointer(content, 'pointermove', 100);
  pointer(content, 'pointerup', 100);
  expect(content).toHaveStyle({ transform: 'translateX(-128px)' });
  fireEvent.click(screen.getByRole('button', { name: '기록 보기' }), { detail: 1 });
  expect(onOpen).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: '카페 기록 수정' }));
  expect(onEdit).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole('button', { name: '카페 기록 삭제' }));
  expect(onDelete).toHaveBeenCalledTimes(1);
});

it('세로 스크롤과 취소된 제스처는 액션을 열지 않는다', () => {
  render(
    <SwipeActions label="카페" onEdit={jest.fn()} onDelete={jest.fn()}>
      <p>기록</p>
    </SwipeActions>
  );
  const content = screen.getByText('기록').parentElement!;
  pointer(content, 'pointerdown', 200);
  pointer(content, 'pointermove', 195, 200);
  pointer(content, 'pointerup', 195, 200);
  expect(content).toHaveStyle({ transform: 'translateX(0px)' });
  pointer(content, 'pointerdown', 200);
  pointer(content, 'pointermove', 100);
  pointer(content, 'pointercancel', 100);
  expect(content).toHaveStyle({ transform: 'translateX(0px)' });
});

it('키보드로 열고 닫을 수 있다', () => {
  render(
    <SwipeActions label="카페" onEdit={jest.fn()} onDelete={jest.fn()}>
      <p>기록</p>
    </SwipeActions>
  );
  const group = screen.getByRole('group');
  const content = screen.getByText('기록').parentElement!;
  fireEvent.keyDown(group, { key: 'ArrowLeft' });
  expect(content).toHaveStyle({ transform: 'translateX(-128px)' });
  fireEvent.keyDown(group, { key: 'ArrowRight' });
  expect(content).toHaveStyle({ transform: 'translateX(0px)' });
});
