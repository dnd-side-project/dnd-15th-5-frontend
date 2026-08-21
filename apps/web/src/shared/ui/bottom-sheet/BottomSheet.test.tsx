import { fireEvent, render, screen } from '@testing-library/react';

import { BottomSheet } from '.';

const setInnerHeight = (height: number) => {
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: height });
};

// NOTE: jsdom의 PointerEvent 구현은 MouseEvent에서 물려받는 clientY를 생성자로 못 받는다
// (https://github.com/jsdom/jsdom, 실제 브라우저에서는 정상 동작). 이벤트를 만들고 clientY를
// 직접 정의해서 우회한다.
const firePointerEvent = (element: Element, type: string, clientY: number) => {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'clientY', { value: clientY, configurable: true });
  Object.defineProperty(event, 'pointerId', { value: 1, configurable: true });
  fireEvent(element, event);
};

describe('BottomSheet', () => {
  beforeEach(() => {
    setInnerHeight(800);
  });

  it('snapPoint에 맞는 높이로 렌더링된다', () => {
    const { container, rerender } = render(<BottomSheet snapPoint="medium">내용</BottomSheet>);
    const sheet = container.firstChild as HTMLElement;

    expect(sheet).toHaveStyle({ height: '45dvh' });
    expect(sheet.className).not.toContain('translate-y-full');

    rerender(<BottomSheet snapPoint="full">내용</BottomSheet>);
    expect(sheet).toHaveStyle({ height: '92dvh' });

    rerender(<BottomSheet snapPoint="large">내용</BottomSheet>);
    expect(sheet).toHaveStyle({ height: '70dvh' });

    rerender(<BottomSheet snapPoint="small">내용</BottomSheet>);
    expect(sheet).toHaveStyle({ height: '40dvh' });

    rerender(<BottomSheet snapPoint="hidden">내용</BottomSheet>);
    expect(sheet.className).toContain('translate-y-full');
  });

  it('핸들을 누르면 onHandleClick을 호출한다', () => {
    const onHandleClick = jest.fn();
    render(
      <BottomSheet snapPoint="medium" onHandleClick={onHandleClick}>
        내용
      </BottomSheet>
    );

    fireEvent.click(screen.getByRole('button', { name: '바텀시트 높이 조절' }));

    expect(onHandleClick).toHaveBeenCalledTimes(1);
  });

  it('핸들을 그냥 클릭만 하면(드래그 없이) onSnapPointChange는 호출되지 않고 onHandleClick만 호출된다', () => {
    const onHandleClick = jest.fn();
    const onSnapPointChange = jest.fn();
    render(
      <BottomSheet
        snapPoint="medium"
        onHandleClick={onHandleClick}
        onSnapPointChange={onSnapPointChange}
      >
        내용
      </BottomSheet>
    );
    const handle = screen.getByRole('button', { name: '바텀시트 높이 조절' });

    firePointerEvent(handle, 'pointerdown', 500);
    firePointerEvent(handle, 'pointerup', 500);
    fireEvent.click(handle);

    expect(onSnapPointChange).not.toHaveBeenCalled();
    expect(onHandleClick).toHaveBeenCalledTimes(1);
  });

  it('핸들을 위로 드래그하면 손가락을 따라 높이가 실시간으로 늘어난다', () => {
    const { container } = render(<BottomSheet snapPoint="medium">내용</BottomSheet>);
    const sheet = container.firstChild as HTMLElement;
    const handle = screen.getByRole('button', { name: '바텀시트 높이 조절' });

    // medium(45%) = 360px에서 시작해 100px 위로 드래그하면 460px가 돼야 한다.
    firePointerEvent(handle, 'pointerdown', 500);
    firePointerEvent(handle, 'pointermove', 400);

    expect(sheet).toHaveStyle({ height: '460px' });
  });

  it('드래그를 놓으면 가장 가까운 단계로 스냅되고 onSnapPointChange를 호출한다', () => {
    const onSnapPointChange = jest.fn();
    render(
      <BottomSheet snapPoint="medium" onSnapPointChange={onSnapPointChange}>
        내용
      </BottomSheet>
    );
    const handle = screen.getByRole('button', { name: '바텀시트 높이 조절' });

    // medium(360px)에서 350px 위로 드래그하면 710px, full(736px)에 더 가깝다.
    firePointerEvent(handle, 'pointerdown', 500);
    firePointerEvent(handle, 'pointermove', 150);
    firePointerEvent(handle, 'pointerup', 150);

    expect(onSnapPointChange).toHaveBeenCalledWith('full');
  });

  it('핸들을 아래로 크게 드래그하면 숨김으로 스냅된다', () => {
    const onSnapPointChange = jest.fn();
    render(
      <BottomSheet snapPoint="medium" onSnapPointChange={onSnapPointChange}>
        내용
      </BottomSheet>
    );
    const handle = screen.getByRole('button', { name: '바텀시트 높이 조절' });

    firePointerEvent(handle, 'pointerdown', 500);
    firePointerEvent(handle, 'pointermove', 700);
    firePointerEvent(handle, 'pointerup', 700);

    expect(onSnapPointChange).toHaveBeenCalledWith('hidden');
  });

  it('지정한 snapPoints 중 가장 가까운 단계로 스냅된다', () => {
    const onSnapPointChange = jest.fn();
    render(
      <BottomSheet
        snapPoint="large"
        snapPoints={['small', 'large', 'full']}
        onSnapPointChange={onSnapPointChange}
      >
        내용
      </BottomSheet>
    );
    const handle = screen.getByRole('button', { name: '바텀시트 높이 조절' });

    // large(560px)에서 120px 위로 드래그하면 680px로 full(736px)에 가장 가깝다.
    firePointerEvent(handle, 'pointerdown', 500);
    firePointerEvent(handle, 'pointermove', 380);
    firePointerEvent(handle, 'pointerup', 380);

    expect(onSnapPointChange).toHaveBeenCalledWith('full');
  });

  it('월 선택용 단계에서 아래로 드래그하면 small에 스냅된다', () => {
    const onSnapPointChange = jest.fn();
    render(
      <BottomSheet
        snapPoint="large"
        snapPoints={['small', 'large', 'full']}
        onSnapPointChange={onSnapPointChange}
      >
        내용
      </BottomSheet>
    );
    const handle = screen.getByRole('button', { name: '바텀시트 높이 조절' });

    // large(560px)에서 220px 아래로 드래그하면 340px로 small(320px)에 가장 가깝다.
    firePointerEvent(handle, 'pointerdown', 300);
    firePointerEvent(handle, 'pointermove', 520);
    firePointerEvent(handle, 'pointerup', 520);

    expect(onSnapPointChange).toHaveBeenCalledWith('small');
  });
});
