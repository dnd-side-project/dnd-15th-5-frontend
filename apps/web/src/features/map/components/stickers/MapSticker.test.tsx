import { fireEvent, render, screen } from '@testing-library/react';

import { TEST_MAP_STICKERS } from '@/features/map/testFixtures';
import { StickerEyesImage } from '@/shared/assets/images/stickers';

import MapSticker from './MapSticker';

import type { PropsWithChildren } from 'react';

jest.mock('@vis.gl/react-google-maps', () => ({
  AdvancedMarker: ({
    children,
    title,
    onClick,
  }: PropsWithChildren<{ title: string; onClick: () => void }>) => (
    <button aria-label={title} onClick={onClick}>
      {children}
    </button>
  ),
}));

describe('MapSticker', () => {
  it.each([
    [120, 60, 80, 62],
    [60, 120, 62, 80],
    [80, 80, 62, 62],
  ])(
    '사진 %i×%i의 선택 마커 크기와 실패 후 대체 이미지 크기를 복원한다',
    (width, height, expectedWidth, expectedHeight) => {
      const sticker = { ...TEST_MAP_STICKERS[0]!, image: 'https://example.com/photo.png' };
      const { container } = render(
        <MapSticker sticker={sticker} isSelected onSelect={jest.fn()} />
      );
      const probe = container.querySelector('img')!;
      Object.defineProperties(probe, {
        naturalWidth: { value: width, configurable: true },
        naturalHeight: { value: height, configurable: true },
      });
      fireEvent.load(probe);
      expect(container.querySelector('svg image')).toHaveAttribute('width', String(expectedWidth));
      expect(container.querySelector('svg image')).toHaveAttribute(
        'height',
        String(expectedHeight)
      );

      fireEvent.error(container.querySelector('svg image')!);
      expect(container.querySelector('svg image')).toHaveAttribute('href', StickerEyesImage);
      Object.defineProperties(probe, {
        naturalWidth: { value: 80, configurable: true },
        naturalHeight: { value: 80, configurable: true },
      });
      fireEvent.load(probe);
      expect(container.querySelector('svg image')).toHaveAttribute('width', '62');
      expect(container.querySelector('svg image')).toHaveAttribute('height', '62');
      expect(container.querySelector('[data-map-sticker-hit-area]')).toBeNull();
    }
  );
  it('사진을 마커에 표시하고 로드 실패 시 SVG 이미지도 기본 스티커로 대체한다', () => {
    const sticker = { ...TEST_MAP_STICKERS[0]!, image: 'https://example.com/photo.png' };
    const onSelect = jest.fn();
    const { container, rerender } = render(
      <MapSticker sticker={sticker} isSelected onSelect={onSelect} />
    );
    expect(container.querySelector('svg image')).toHaveAttribute('href', sticker.image);
    fireEvent.error(container.querySelector('img')!);
    expect(container.querySelector('svg image')).toHaveAttribute('href', StickerEyesImage);
    fireEvent.click(screen.getByRole('button'));
    expect(onSelect).toHaveBeenCalledTimes(1);

    rerender(
      <MapSticker
        sticker={{ ...sticker, image: 'https://example.com/new.png' }}
        isSelected
        onSelect={onSelect}
      />
    );
    expect(container.querySelector('svg image')).toHaveAttribute(
      'href',
      'https://example.com/new.png'
    );
  });
});
