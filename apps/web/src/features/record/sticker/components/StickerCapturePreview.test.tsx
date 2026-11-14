import { fireEvent, render, screen } from '@testing-library/react';

import { usePrefersReducedMotion } from '@/shared/hooks/usePrefersReducedMotion';

import StickerCapturePreview from './StickerCapturePreview';

jest.mock('@/shared/hooks/usePrefersReducedMotion');

const props = {
  original: 'original.png',
  sticker: 'sticker.png',
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

it('스티커 URL을 받아도 이미지를 불러오기 전에는 사용을 막는다', () => {
  render(<StickerCapturePreview {...props} />);
  const confirmButton = screen.getByRole('button', { name: '이 스티커 사용' });
  expect(confirmButton).toBeDisabled();
  fireEvent.load(screen.getByAltText('흰색 테두리가 적용된 스티커'));
  expect(confirmButton).toBeEnabled();
});

it('촬영 결과 이미지가 깨지면 사용을 막고 재생성한 이미지는 다시 사용할 수 있다', () => {
  const { rerender } = render(<StickerCapturePreview {...props} />);
  fireEvent.error(screen.getByAltText('흰색 테두리가 적용된 스티커'));
  expect(screen.getByRole('alert')).toHaveTextContent('스티커를 불러오지 못했어요');
  expect(screen.getByRole('button', { name: '이 스티커 사용' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));
  expect(props.onRetry).toHaveBeenCalledTimes(1);
  expect(props.onConfirm).not.toHaveBeenCalled();

  rerender(<StickerCapturePreview {...props} sticker="retried-sticker.png" />);
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  fireEvent.load(screen.getByAltText('흰색 테두리가 적용된 스티커'));
  expect(props.onConfirm).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: '이 스티커 사용' }));
  expect(props.onConfirm).toHaveBeenCalledTimes(1);
});

it('처리 중에는 사용을 막고 취소를 제공하며 완료 후에는 다시 촬영할 수 있다', () => {
  const { rerender } = render(<StickerCapturePreview {...props} isProcessing />);
  expect(screen.getByRole('status', { name: '스티커 생성 중' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '이 스티커 사용' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: '취소' }));
  expect(props.onCancel).toHaveBeenCalledTimes(1);
  expect(props.onReselect).not.toHaveBeenCalled();

  rerender(<StickerCapturePreview {...props} />);
  fireEvent.click(screen.getByRole('button', { name: '다시 찍기' }));
  expect(props.onReselect).toHaveBeenCalledTimes(1);
});
