import { act, fireEvent, render, screen } from '@testing-library/react';

import { usePrefersReducedMotion } from '@/shared/hooks/usePrefersReducedMotion';

import StickerGenerationPreview from './StickerGenerationPreview';

jest.mock('@/shared/hooks/usePrefersReducedMotion');

const props = {
  original: 'original.png',
  sticker: 'sticker.png',
  photoSource: 'camera' as const,
  isProcessing: false,
  isCapturing: false,
  message: '',
  error: '',
  onCancel: jest.fn(),
  onRetry: jest.fn(),
  onReselect: jest.fn(),
  onConfirm: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(usePrefersReducedMotion).mockReturnValue(false);
});

it('촬영 결과 이미지가 깨지면 사용을 막고 재생성한 이미지는 다시 사용할 수 있다', () => {
  const { rerender } = render(<StickerGenerationPreview {...props} />);
  fireEvent.error(screen.getByAltText('흰색 테두리가 적용된 스티커'));
  expect(screen.getByRole('alert')).toHaveTextContent('스티커를 불러오지 못했어요');
  expect(screen.getByRole('button', { name: '이 스티커 사용' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));
  expect(props.onRetry).toHaveBeenCalledTimes(1);
  expect(props.onConfirm).not.toHaveBeenCalled();

  rerender(<StickerGenerationPreview {...props} sticker="retried-sticker.png" />);
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  fireEvent.load(screen.getByAltText('흰색 테두리가 적용된 스티커'));
  expect(props.onConfirm).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: '이 스티커 사용' }));
  expect(props.onConfirm).toHaveBeenCalledTimes(1);
});

it('처리 중에는 사용을 막고 취소를 제공하며 완료 후에는 다시 촬영할 수 있다', () => {
  const { rerender } = render(<StickerGenerationPreview {...props} isProcessing />);
  expect(screen.getByRole('status', { name: '스티커 생성 중' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '이 스티커 사용' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: '취소' }));
  expect(props.onCancel).toHaveBeenCalledTimes(1);
  expect(props.onReselect).not.toHaveBeenCalled();

  rerender(<StickerGenerationPreview {...props} />);
  fireEvent.click(screen.getByRole('button', { name: '다시 찍기' }));
  expect(props.onReselect).toHaveBeenCalledTimes(1);
});

const galleryProps = { ...props, photoSource: 'gallery' as const };

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
  const { rerender } = render(<StickerGenerationPreview {...galleryProps} />);
  expect(galleryProps.onConfirm).not.toHaveBeenCalled();
  expect(screen.getByAltText('흰색 테두리가 적용된 스티커')).not.toBeVisible();
  expect(screen.queryByRole('button', { name: '이 스티커 사용' })).not.toBeInTheDocument();
  const { animate, finish } = prepareAnimation();
  expect(animate).toHaveBeenCalledTimes(1);
  expect(animate).toHaveBeenCalledWith(
    expect.any(Array),
    expect.objectContaining({ duration: 1000 })
  );
  expect(galleryProps.onConfirm).not.toHaveBeenCalled();

  const latestConfirm = jest.fn();
  rerender(<StickerGenerationPreview {...galleryProps} onConfirm={latestConfirm} />);
  expect(animate).toHaveBeenCalledTimes(1);
  await act(async () => finish());

  expect(latestConfirm).toHaveBeenCalledTimes(1);
  expect(galleryProps.onConfirm).not.toHaveBeenCalled();
});

it('생성 화면을 벗어나면 모션을 취소하고 늦게 완료돼도 기록 화면을 열지 않는다', async () => {
  const { unmount } = render(<StickerGenerationPreview {...galleryProps} />);
  const { animation, finish } = prepareAnimation();
  unmount();
  await act(async () => finish());
  expect(animation.cancel).toHaveBeenCalledTimes(1);
  expect(galleryProps.onConfirm).not.toHaveBeenCalled();
});

it('동작 줄이기에서는 이미지 로드 후 모션 없이 기록 화면으로 이동한다', () => {
  jest.mocked(usePrefersReducedMotion).mockReturnValue(true);
  render(<StickerGenerationPreview {...galleryProps} />);
  const { animate } = prepareAnimation();
  expect(animate).not.toHaveBeenCalled();
  expect(galleryProps.onConfirm).toHaveBeenCalledTimes(1);
});

it('종료 확인 중에는 완료된 모션으로 이동하지 않고 계속 작성하면 다시 진행한다', async () => {
  const { rerender } = render(<StickerGenerationPreview {...galleryProps} />);
  const { animation, animate, finish } = prepareAnimation();
  rerender(<StickerGenerationPreview {...galleryProps} isPaused />);
  await act(async () => finish());
  expect(animation.pause).toHaveBeenCalled();
  expect(animation.cancel).not.toHaveBeenCalled();
  expect(galleryProps.onConfirm).not.toHaveBeenCalled();
  rerender(<StickerGenerationPreview {...galleryProps} />);
  await act(async () => {});
  expect(animate).toHaveBeenCalledTimes(1);
  expect(galleryProps.onConfirm).toHaveBeenCalledTimes(1);
});

it('계속 작성하면 같은 모션을 중단 지점부터 이어서 재생한다', async () => {
  const { rerender } = render(<StickerGenerationPreview {...galleryProps} />);
  const { animation, animate, finish } = prepareAnimation();
  animation.currentTime = 400;
  rerender(<StickerGenerationPreview {...galleryProps} isPaused />);
  expect(galleryProps.onConfirm).not.toHaveBeenCalled();
  rerender(<StickerGenerationPreview {...galleryProps} />);
  expect(animate).toHaveBeenCalledTimes(1);
  expect(animation.currentTime).toBe(400);
  expect(animation.play).toHaveBeenCalledTimes(2);
  await act(async () => finish());
  expect(galleryProps.onConfirm).toHaveBeenCalledTimes(1);
});

it('생성 또는 이미지 표시가 실패하면 자동 이동하지 않고 재시도와 취소를 제공한다', () => {
  render(<StickerGenerationPreview {...galleryProps} />);
  fireEvent.error(screen.getByAltText('흰색 테두리가 적용된 스티커'));
  expect(screen.getByRole('alert')).toHaveTextContent('스티커를 불러오지 못했어요');
  fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));
  fireEvent.click(screen.getByRole('button', { name: '기록 닫고 홈으로 이동' }));
  expect(galleryProps.onRetry).toHaveBeenCalledTimes(1);
  expect(galleryProps.onCancel).toHaveBeenCalledTimes(1);
  expect(galleryProps.onConfirm).not.toHaveBeenCalled();
});
