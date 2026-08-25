import { render, screen } from '@testing-library/react';

import StickerCollection from './StickerCollection';

const STICKERS = Array.from({ length: 14 }, (_, index) => `sticker-${index + 1}.png`);

describe('StickerCollection', () => {
  it('최대 개수를 지정하면 해당 개수까지만 한 줄에 표시한다', () => {
    const { container } = render(<StickerCollection stickers={STICKERS} maxItems={5} />);

    expect(container.querySelectorAll('img')).toHaveLength(5);
    expect(screen.queryByLabelText('빈 스티커 자리')).not.toBeInTheDocument();
  });

  it('최대 개수가 없으면 모든 스티커를 5열로 표시하고 마지막 줄의 빈자리를 채운다', () => {
    const { container } = render(
      <StickerCollection stickers={STICKERS} ariaLabel="하루 동안 모은 스티커" />
    );

    expect(screen.getByRole('list', { name: '하루 동안 모은 스티커' })).toHaveClass('grid-cols-5');
    expect(container.querySelectorAll('img')).toHaveLength(14);
    expect(screen.getAllByRole('listitem')).toHaveLength(15);
    expect(screen.getAllByLabelText('빈 스티커 자리')).toHaveLength(1);
  });

  it('기본 빈 슬롯은 48px 원이 72px 너비를 차지하도록 가운데 배치한다', () => {
    render(<StickerCollection stickers={STICKERS.slice(0, 1)} />);

    const emptySlot = screen.getAllByLabelText('빈 스티커 자리')[0];
    expect(emptySlot).toHaveClass('size-12');
    expect(emptySlot?.parentElement).toHaveClass('w-18', 'justify-center');
  });

  it('compact 크기는 55px 스티커와 45px 빈 슬롯을 사용한다', () => {
    const { container } = render(
      <StickerCollection stickers={STICKERS.slice(0, 1)} size="compact" />
    );

    expect(container.querySelector('img')).toHaveClass('size-13.75');
    expect(screen.getAllByLabelText('빈 스티커 자리')[0]).toHaveClass('size-11.25');
  });
});
