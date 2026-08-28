import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import StickerCollection from './StickerCollection';

describe('StickerCollection', () => {
  it('활성화된 스티커를 누를 때마다 도장 애니메이션을 다시 재생한다', async () => {
    const user = userEvent.setup();

    render(
      <StickerCollection
        replayStampAnimationOnClick
        stickers={['sticker-1.png', 'sticker-2.png']}
      />
    );

    const firstStickerButton = screen.getByRole('button', { name: '1번째 스티커 붙이기' });

    await user.click(firstStickerButton);
    const firstStickerImage = firstStickerButton.querySelector('img') as HTMLImageElement;
    expect(firstStickerImage).toHaveClass('sticker-collection__stamp--playing');

    fireEvent.animationEnd(firstStickerImage);
    expect(firstStickerButton.querySelector('img')).toBe(firstStickerImage);
    expect(firstStickerButton.querySelector('img')).not.toHaveClass(
      'sticker-collection__stamp--playing'
    );

    await user.click(firstStickerButton);
    expect(firstStickerButton.querySelector('img')).toHaveClass(
      'sticker-collection__stamp--playing'
    );
  });

  it('애니메이션을 활성화하지 않으면 스티커를 표시만 한다', () => {
    const { container } = render(<StickerCollection stickers={['sticker-1.png']} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(container.querySelector('img')).not.toHaveClass('sticker-collection__stamp--playing');
  });
});
