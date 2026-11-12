import { fireEvent, render } from '@testing-library/react';

import { StickerEyesImage } from '@/shared/assets/images/stickers';

import { StickerImage } from './StickerImage';

describe('StickerImage', () => {
  it('실패한 사진은 기본 스티커로 대체하고 URL이 바뀌면 새 사진을 표시한다', () => {
    const onLoad = jest.fn();
    const { container, rerender } = render(
      <StickerImage src="https://example.com/failed.png" onLoad={onLoad} className="size-18" />
    );
    const image = container.querySelector('img')!;
    fireEvent.error(image);
    expect(image).toHaveAttribute('src', StickerEyesImage);
    expect(image).toHaveClass('size-18');
    fireEvent.load(image);
    expect(onLoad).toHaveBeenCalledTimes(1);

    rerender(<StickerImage src="https://example.com/new.png" />);
    expect(image).toHaveAttribute('src', 'https://example.com/new.png');

    rerender(<StickerImage src="https://example.com/failed.png" />);
    expect(image).toHaveAttribute('src', 'https://example.com/failed.png');
  });
});
