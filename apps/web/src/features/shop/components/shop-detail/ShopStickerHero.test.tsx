import { act, fireEvent, render } from '@testing-library/react';

import ShopStickerHero from './ShopStickerHero';
import {
  createShopStickerPlacements,
  createShopStickerStampDelays,
  mixShopStickerImages,
} from './shopStickerHeroLayout';

const STICKER_IMAGES = Array.from({ length: 6 }, (_, index) => `sticker-${index + 1}.png`);
const HERO_HEIGHT = 301;
const BOTTOM_STICKER_INSET = 36;
const MAX_STICKER_EDGE_OVERLAP = 50;

const getStickerSlots = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLImageElement>('img')).map(
    (image) => image.parentElement as HTMLElement
  );

const getStickerStyles = (container: HTMLElement) =>
  getStickerSlots(container).map((slot) => ({
    height: slot.style.height,
    left: slot.style.left,
    top: slot.style.top,
    transform: slot.style.transform,
    width: slot.style.width,
  }));

describe('ShopStickerHero', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('장소마다 다른 랜덤 위치에 스티커를 배치하고 같은 장소에서는 배치를 유지한다', () => {
    const { container, rerender } = render(
      <ShopStickerHero headerContent={null} placeId={101} stickerImages={STICKER_IMAGES} />
    );
    const initialStyles = getStickerStyles(container);

    rerender(<ShopStickerHero headerContent={null} placeId={101} stickerImages={STICKER_IMAGES} />);
    expect(getStickerStyles(container)).toEqual(initialStyles);

    rerender(<ShopStickerHero headerContent={null} placeId={102} stickerImages={STICKER_IMAGES} />);
    expect(getStickerStyles(container)).not.toEqual(initialStyles);
  });

  it('스티커 6개를 전체 영역에 랜덤 배치하고 가장자리만 최대 50px 겹치게 한다', () => {
    const placements = createShopStickerPlacements(106, STICKER_IMAGES.length);

    expect(placements).toHaveLength(6);
    expect(
      placements.every(
        (placement) => placement.top + placement.size <= HERO_HEIGHT - BOTTOM_STICKER_INSET
      )
    ).toBe(true);

    placements.forEach((placement, index) => {
      placements.slice(0, index).forEach((previousPlacement) => {
        const centerDistance = Math.hypot(
          placement.left +
            placement.size / 2 -
            (previousPlacement.left + previousPlacement.size / 2),
          placement.top + placement.size / 2 - (previousPlacement.top + previousPlacement.size / 2)
        );
        const minimumCenterDistance =
          (placement.size + previousPlacement.size) / 2 - MAX_STICKER_EDGE_OVERLAP;

        expect(centerDistance).toBeGreaterThanOrEqual(minimumCenterDistance);
      });
    });
  });

  it('전달받은 스티커를 개수 제한 없이 모두 표시한다', () => {
    const { container } = render(
      <ShopStickerHero
        headerContent={null}
        placeId={106}
        stickerImages={[...STICKER_IMAGES, 'sticker-7.png']}
      />
    );

    expect(container.querySelectorAll('img')).toHaveLength(7);
  });

  it('같은 종류가 묶여 있어도 종류별로 한 장씩 섞어서 표시한다', () => {
    const groupedStickerImages = [
      'eyes.png',
      'eyes.png',
      'eyes.png',
      'bravo.png',
      'bravo.png',
      'special.png',
    ];
    const expectedOrder = [
      'eyes.png',
      'bravo.png',
      'special.png',
      'eyes.png',
      'bravo.png',
      'eyes.png',
    ];

    expect(mixShopStickerImages(groupedStickerImages)).toEqual(expectedOrder);

    const { container } = render(
      <ShopStickerHero headerContent={null} placeId={101} stickerImages={groupedStickerImages} />
    );
    const renderedOrder = Array.from(container.querySelectorAll<HTMLImageElement>('img'), (image) =>
      image.getAttribute('src')
    );

    expect(renderedOrder).toEqual(expectedOrder);
  });

  it('스티커 이미지가 모두 로드되면 인덱스 순서로 지연되는 등장 애니메이션을 재생한다', () => {
    const { container } = render(
      <ShopStickerHero headerContent={null} placeId={101} stickerImages={STICKER_IMAGES} />
    );
    const images = Array.from(container.querySelectorAll<HTMLImageElement>('img'));

    images.forEach((image) => expect(image).not.toHaveClass('shop-sticker-hero__stamp--playing'));

    images.forEach((image) => fireEvent.load(image));

    const stampDelays = createShopStickerStampDelays(STICKER_IMAGES.length);
    images.forEach((image, index) => {
      expect(image).toHaveClass('shop-sticker-hero__stamp--playing');
      expect(image.style.animationDelay).toBe(`${stampDelays[index]}ms`);
      expect(image.style.animationDuration).toBe('486ms');
    });
  });

  it('이미지 로드가 지연되어도 400ms 뒤에는 폴백으로 애니메이션을 재생한다', () => {
    jest.useFakeTimers();

    const { container } = render(
      <ShopStickerHero headerContent={null} placeId={101} stickerImages={STICKER_IMAGES} />
    );
    const [firstImage] = container.querySelectorAll<HTMLImageElement>('img');

    expect(firstImage).not.toHaveClass('shop-sticker-hero__stamp--playing');

    act(() => {
      jest.advanceTimersByTime(400);
    });

    expect(firstImage).toHaveClass('shop-sticker-hero__stamp--playing');
  });

  it('빈 목록에서 스티커가 추가되면 새 이미지 로드를 기다린 뒤 애니메이션을 재생한다', () => {
    const { container, rerender } = render(
      <ShopStickerHero headerContent={null} placeId={101} stickerImages={[]} />
    );

    rerender(
      <ShopStickerHero headerContent={null} placeId={101} stickerImages={['new-sticker.png']} />
    );
    const image = container.querySelector('img') as HTMLImageElement;
    expect(image).not.toHaveClass('shop-sticker-hero__stamp--playing');

    fireEvent.load(image);

    expect(image).toHaveClass('shop-sticker-hero__stamp--playing');
  });

  it('같은 개수의 스티커 URL이 바뀌면 로드 상태를 초기화한다', () => {
    const initialImages = ['sticker-a.png', 'sticker-b.png'];
    const nextImages = ['sticker-c.png', 'sticker-d.png'];
    const { container, rerender } = render(
      <ShopStickerHero headerContent={null} placeId={101} stickerImages={initialImages} />
    );
    Array.from(container.querySelectorAll('img')).forEach((image) => fireEvent.load(image));

    rerender(<ShopStickerHero headerContent={null} placeId={101} stickerImages={nextImages} />);
    const replacedImages = Array.from(container.querySelectorAll<HTMLImageElement>('img'));
    replacedImages.forEach((image) => {
      expect(image).not.toHaveClass('shop-sticker-hero__stamp--playing');
    });

    replacedImages.forEach((image) => fireEvent.load(image));
    replacedImages.forEach((image) => {
      expect(image).toHaveClass('shop-sticker-hero__stamp--playing');
    });
  });

  it('newestStickerIndex로 지정한 스티커는 나머지가 다 찍힌 뒤 강조 애니메이션으로 재생한다', () => {
    const { container } = render(
      <ShopStickerHero
        headerContent={null}
        newestStickerIndex={2}
        placeId={101}
        stickerImages={STICKER_IMAGES}
      />
    );
    const images = Array.from(container.querySelectorAll<HTMLImageElement>('img'));

    images.forEach((image) => fireEvent.load(image));

    const newestImage = images[2] as HTMLImageElement;
    const stampDelays = createShopStickerStampDelays(STICKER_IMAGES.length, 2);
    expect(newestImage).toHaveClass('shop-sticker-hero__stamp--playing-newest');
    expect(newestImage).not.toHaveClass('shop-sticker-hero__stamp--playing');
    expect(newestImage.style.animationDelay).toBe(`${stampDelays[2]}ms`);
    expect(newestImage.style.animationDuration).toBe('657ms');
  });
});
