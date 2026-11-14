import { act, fireEvent, render, screen } from '@testing-library/react';

import { usePrefersReducedMotion } from '@/shared/hooks/usePrefersReducedMotion';

import StickerGenerationStage from './StickerGenerationStage';

jest.mock('@/shared/hooks/usePrefersReducedMotion');

const props = {
  original: 'original.png',
  sticker: 'sticker.png',
  isProcessing: false,
  message: '',
  onRevealComplete: jest.fn(),
  onRevealError: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(usePrefersReducedMotion).mockReturnValue(false);
});

const prepareAnimation = () => {
  let finish = () => {};
  const finished = new Promise<void>((resolve) => {
    finish = resolve;
  });
  const animation = {
    finished,
    currentTime: 0,
    cancel: jest.fn(),
    pause: jest.fn(),
    play: jest.fn(),
  };
  const completeAnimation = () => {
    animation.currentTime = 1000;
    finish();
  };
  const image = screen.getByAltText('흰색 테두리가 적용된 스티커');
  const animate = jest.fn(() => animation);
  Object.defineProperty(image, 'animate', { value: animate });
  fireEvent.load(image);
  return { animation, animate, finish: completeAnimation };
};

it('생성된 이미지가 로드되고 모션이 끝난 뒤에만 기록 화면으로 이동한다', async () => {
  const { rerender } = render(<StickerGenerationStage {...props} />);
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
  expect(props.onRevealComplete).not.toHaveBeenCalled();
  expect(screen.getByAltText('흰색 테두리가 적용된 스티커')).not.toBeVisible();
  const { animate, finish } = prepareAnimation();
  expect(animate).toHaveBeenCalledTimes(1);
  expect(animate).toHaveBeenCalledWith(
    expect.any(Array),
    expect.objectContaining({ duration: 1000 })
  );
  expect(props.onRevealComplete).not.toHaveBeenCalled();

  const latestConfirm = jest.fn();
  rerender(<StickerGenerationStage {...props} onRevealComplete={latestConfirm} />);
  expect(animate).toHaveBeenCalledTimes(1);
  await act(async () => finish());

  expect(latestConfirm).toHaveBeenCalledTimes(1);
  expect(props.onRevealComplete).not.toHaveBeenCalled();
});

it('생성 화면을 벗어나면 모션을 취소하고 늦게 완료돼도 기록 화면을 열지 않는다', async () => {
  const { unmount } = render(<StickerGenerationStage {...props} />);
  const { animation, finish } = prepareAnimation();
  unmount();
  await act(async () => finish());
  expect(animation.cancel).toHaveBeenCalledTimes(1);
  expect(props.onRevealComplete).not.toHaveBeenCalled();
});

it('동작 줄이기에서는 이미지 로드 후 모션 없이 기록 화면으로 이동한다', () => {
  jest.mocked(usePrefersReducedMotion).mockReturnValue(true);
  render(<StickerGenerationStage {...props} />);
  const { animate } = prepareAnimation();
  expect(animate).not.toHaveBeenCalled();
  expect(props.onRevealComplete).toHaveBeenCalledTimes(1);
});

it('일시 정지 중에는 완료된 모션으로 이동하지 않고 재개하면 다시 진행한다', async () => {
  const { rerender } = render(<StickerGenerationStage {...props} />);
  const { animation, animate, finish } = prepareAnimation();
  rerender(<StickerGenerationStage {...props} isPaused />);
  await act(async () => finish());
  expect(animation.pause).toHaveBeenCalled();
  expect(animation.cancel).not.toHaveBeenCalled();
  expect(props.onRevealComplete).not.toHaveBeenCalled();
  rerender(<StickerGenerationStage {...props} />);
  await act(async () => {});
  expect(animate).toHaveBeenCalledTimes(1);
  expect(props.onRevealComplete).toHaveBeenCalledTimes(1);
});

it('재개하면 같은 모션을 중단 지점부터 이어서 재생한다', async () => {
  const { rerender } = render(<StickerGenerationStage {...props} />);
  const { animation, animate, finish } = prepareAnimation();
  animation.currentTime = 400;
  rerender(<StickerGenerationStage {...props} isPaused />);
  expect(props.onRevealComplete).not.toHaveBeenCalled();
  rerender(<StickerGenerationStage {...props} />);
  expect(animate).toHaveBeenCalledTimes(1);
  expect(animation.currentTime).toBe(400);
  expect(animation.play).toHaveBeenCalledTimes(2);
  await act(async () => finish());
  expect(props.onRevealComplete).toHaveBeenCalledTimes(1);
});

it('스티커를 표시하지 못하면 화면 안에 안내 없이 실패를 상위에 알린다', () => {
  render(<StickerGenerationStage {...props} />);
  fireEvent.error(screen.getByAltText('흰색 테두리가 적용된 스티커'));
  expect(props.onRevealError).toHaveBeenCalledTimes(1);
  expect(props.onRevealComplete).not.toHaveBeenCalled();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

it('생성 중에는 진행 상태를 표시하고 모션이 끝나도 완료를 알리지 않는다', async () => {
  render(<StickerGenerationStage {...props} isProcessing message="배경을 지우고 있어요" />);
  expect(screen.getByRole('status', { name: '스티커 생성 중' })).toHaveTextContent(
    '배경을 지우고 있어요'
  );
  const { animation, finish } = prepareAnimation();
  await act(async () => finish());
  expect(animation.pause).toHaveBeenCalled();
  expect(props.onRevealComplete).not.toHaveBeenCalled();
});
