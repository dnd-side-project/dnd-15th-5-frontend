import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { StickerEyesImage } from '@/shared/assets/images/stickers';

import ShopStickerHero from './ShopStickerHero';
import {
  createShopStickerPlacements,
  createShopStickerStampDelays,
  getShopStickerDimensions,
  getShopStickerSlotStyle,
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
  it('실패한 사진은 다시 붙여도 대체 스티커를 유지한다', async () => {
    const user = userEvent.setup();
    render(
      <ShopStickerHero
        headerContent={null}
        placeId={101}
        stickerImages={['https://example.com/expired.png']}
      />
    );
    const button = screen.getByRole('button', { name: '1번째 스티커 다시 붙이기' });
    fireEvent.error(button.querySelector('img')!);
    const fallback = button.querySelector('img')!.getAttribute('src');
    fireEvent.load(button.querySelector('img')!);
    await user.click(button);
    expect(button.querySelector('img')).toHaveAttribute('src', fallback);
  });

  it('같은 사진의 재생 로드 이벤트를 다른 사진의 로드 완료로 세지 않는다', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <ShopStickerHero
        headerContent={null}
        placeId={101}
        stickerImages={['https://example.com/first.png', 'https://example.com/slow.png']}
      />
    );
    fireEvent.load(container.querySelector('img')!);
    await user.click(screen.getByRole('button', { name: '1번째 스티커 다시 붙이기' }));
    fireEvent.load(container.querySelector('img')!);
    expect(container.querySelectorAll('img')[1]).not.toHaveClass(
      'shop-sticker-hero__stamp--playing'
    );
    fireEvent.load(container.querySelectorAll('img')[1]!);
    expect(container.querySelectorAll('img')[1]).toHaveClass('shop-sticker-hero__stamp--playing');
  });
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

  it('가로형 스티커의 실제 렌더링 크기와 회전을 기준으로 겹침을 제한한다', () => {
    const placements = createShopStickerPlacements(106, 4, [1.8, 1.8, 1.8, 1.8]);
    const bounds = (placement: (typeof placements)[number]) => {
      const radians = (placement.rotate * Math.PI) / 180;
      return {
        width:
          placement.width * Math.abs(Math.cos(radians)) +
          placement.height * Math.abs(Math.sin(radians)),
        height:
          placement.width * Math.abs(Math.sin(radians)) +
          placement.height * Math.abs(Math.cos(radians)),
      };
    };

    expect(placements).toHaveLength(4);
    expect(
      placements.every(
        (placement) =>
          placement.top + placement.height / 2 + bounds(placement).height / 2 <=
          HERO_HEIGHT - BOTTOM_STICKER_INSET
      )
    ).toBe(true);

    placements.forEach((placement, index) => {
      placements.slice(0, index).forEach((previousPlacement) => {
        const overlapX =
          (bounds(placement).width + bounds(previousPlacement).width) / 2 -
          Math.abs(
            placement.left +
              placement.width / 2 -
              (previousPlacement.left + previousPlacement.width / 2)
          );
        const overlapY =
          (bounds(placement).height + bounds(previousPlacement).height) / 2 -
          Math.abs(
            placement.top +
              placement.height / 2 -
              (previousPlacement.top + previousPlacement.height / 2)
          );
        expect(Math.min(overlapX, overlapY)).toBeLessThanOrEqual(MAX_STICKER_EDGE_OVERLAP);
      });
    });
  });

  it.each([320, 375])(
    '좁은 화면에서도 회전한 스티커가 좌우로 20px 넘게 잘리지 않는다: %s',
    (heroWidth) => {
      const placements = createShopStickerPlacements(
        106,
        6,
        [1.8, 0.6, 1.8, 1, 1.8, 0.6],
        heroWidth
      );
      placements.forEach((placement) => {
        const radians = (placement.rotate * Math.PI) / 180;
        const boundingWidth =
          placement.width * Math.abs(Math.cos(radians)) +
          placement.height * Math.abs(Math.sin(radians));
        const center = placement.left + placement.width / 2;
        expect(center - boundingWidth / 2).toBeGreaterThanOrEqual(-20.000001);
        expect(center + boundingWidth / 2).toBeLessThanOrEqual(heroWidth + 20.000001);
        const style = getShopStickerSlotStyle(placement, heroWidth);
        expect(style.width).toBe(`${placement.width}px`);
        expect(style.height).toBe(`${placement.height}px`);
        expect(style.transform).toBe(`translateX(-50%) rotate(${placement.rotate}deg)`);
        expect(style.left).toContain(`clamp(${boundingWidth / 2 - 20}px,`);
      });
    }
  );

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

  it('가로형과 세로형의 비율을 유지하면서 같은 표시 면적으로 맞춘다', () => {
    const landscape = getShopStickerDimensions(1.25);
    const portrait = getShopStickerDimensions(0.8);
    const square = getShopStickerDimensions(1);

    expect(landscape.width / landscape.height).toBeCloseTo(1.25);
    expect(portrait.width / portrait.height).toBeCloseTo(0.8);
    expect(landscape.width * landscape.height).toBeCloseTo(square.width * square.height);
    expect(portrait.width * portrait.height).toBeCloseTo(square.width * square.height);

    const narrow = getShopStickerDimensions(0.2);
    expect(narrow.height).toBeLessThanOrEqual(160);
    expect(narrow.width / narrow.height).toBeCloseTo(0.2);
  });

  it('실제 이미지 비율로 크기를 보정해 쿠키와 버블티의 표시 면적 차이를 줄인다', () => {
    const { container } = render(
      <ShopStickerHero
        headerContent={null}
        placeId={101}
        stickerImages={['cookie.png', 'bubble-tea.png']}
      />
    );
    const images = Array.from(container.querySelectorAll('img'));
    const dimensions = [
      { width: 512, height: 482 },
      { width: 289, height: 512 },
    ];
    images.forEach((image, index) => {
      Object.defineProperties(image, {
        naturalWidth: { value: dimensions[index]!.width },
        naturalHeight: { value: dimensions[index]!.height },
      });
      fireEvent.load(image);
    });

    const [cookie, bubbleTea] = getStickerSlots(container).map((slot) => ({
      width: parseFloat(slot.style.width),
      height: parseFloat(slot.style.height),
    }));
    expect(cookie!.width / cookie!.height).toBeCloseTo(512 / 482);
    expect(bubbleTea!.width / bubbleTea!.height).toBeCloseTo(289 / 512);
    const areaRatio = (cookie!.width * cookie!.height) / (bubbleTea!.width * bubbleTea!.height);
    expect(areaRatio).toBeGreaterThanOrEqual(1);
    expect(areaRatio).toBeLessThan(1.25);
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

  it('실패한 사진은 대체 스티커로 바꾸고 성공·실패가 모두 끝나면 애니메이션을 시작한다', () => {
    jest.useFakeTimers();
    const { container } = render(
      <ShopStickerHero
        headerContent={null}
        placeId={101}
        stickerImages={['photo.png', 'sticker.png', 'last.png']}
      />
    );
    const [photo, sticker, last] = Array.from(container.querySelectorAll('img'));
    fireEvent.error(photo!);
    expect(photo).toHaveAttribute('src', StickerEyesImage);
    fireEvent.load(sticker!);
    fireEvent.load(sticker!);
    expect(sticker).not.toHaveClass('shop-sticker-hero__stamp--playing');
    fireEvent.load(last!);
    expect(sticker).toHaveClass('shop-sticker-hero__stamp--playing');
    expect(last).toHaveClass('shop-sticker-hero__stamp--playing');
  });

  it('모든 사진이 실패해도 깨진 이미지가 남지 않고 새 URL은 다시 로드한다', () => {
    const { container, rerender } = render(
      <ShopStickerHero headerContent={null} placeId={101} stickerImages={['expired.png']} />
    );
    fireEvent.error(container.querySelector('img')!);
    expect(container.querySelector('img')).toHaveAttribute('src', StickerEyesImage);
    rerender(
      <ShopStickerHero headerContent={null} placeId={101} stickerImages={['renewed.png']} />
    );
    expect(container.querySelector('img')).toHaveAttribute('src', 'renewed.png');
  });

  it('폴백으로 애니메이션을 시작한 뒤 늦게 로드된 이미지가 스티커 배치를 바꾸지 않는다', () => {
    jest.useFakeTimers();
    const { container } = render(
      <ShopStickerHero headerContent={null} placeId={106} stickerImages={STICKER_IMAGES} />
    );
    act(() => jest.advanceTimersByTime(400));
    const originalStyles = getStickerStyles(container);
    const image = container.querySelector('img')!;
    Object.defineProperties(image, { naturalWidth: { value: 900 }, naturalHeight: { value: 400 } });
    fireEvent.load(image);
    expect(image).toHaveClass('shop-sticker-hero__stamp--playing');
    expect(getStickerStyles(container)).toEqual(originalStyles);
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

  it('같은 상세 화면에서 스티커 URL이 바뀌어도 애니메이션을 다시 재생하지 않는다', () => {
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
      expect(image).not.toHaveClass('shop-sticker-hero__stamp--playing');
    });
  });

  it('애니메이션을 생략하는 새 이미지 집합도 최초 로드 시 실제 비율로 배치한다', () => {
    const { container, rerender } = render(
      <ShopStickerHero headerContent={null} placeId={101} stickerImages={['old.png']} />
    );
    fireEvent.load(container.querySelector('img')!);
    rerender(
      <ShopStickerHero headerContent={null} placeId={101} stickerImages={['new-landscape.png']} />
    );
    const image = container.querySelector('img')!;
    Object.defineProperties(image, { naturalWidth: { value: 900 }, naturalHeight: { value: 400 } });
    fireEvent.load(image);
    const slot = image.parentElement!;
    expect(parseFloat(slot.style.width) / parseFloat(slot.style.height)).toBeCloseTo(2.25);
    expect(image).not.toHaveClass('shop-sticker-hero__stamp--playing');
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

  it('스티커를 누르면 해당 스티커의 붙이기 애니메이션만 다시 재생한다', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <ShopStickerHero headerContent={null} placeId={101} stickerImages={STICKER_IMAGES} />
    );
    const initialImages = Array.from(container.querySelectorAll<HTMLImageElement>('img'));
    initialImages.forEach((image) => fireEvent.load(image));
    initialImages.forEach((image) => fireEvent.animationEnd(image));

    await user.click(screen.getByRole('button', { name: '2번째 스티커 다시 붙이기' }));

    const replayedImages = Array.from(container.querySelectorAll<HTMLImageElement>('img'));
    replayedImages.forEach((image, index) => {
      expect(image).toHaveClass(
        index === 1 ? 'shop-sticker-hero__stamp--playing' : 'shop-sticker-hero__stamp'
      );
      if (index !== 1) {
        expect(image).not.toHaveClass('shop-sticker-hero__stamp--playing');
      }
    });
    expect(replayedImages[1]?.style.animationDelay).toBe('0ms');

    const firstReplayImage = replayedImages[1] as HTMLImageElement;
    fireEvent.animationEnd(firstReplayImage);
    await user.click(screen.getByRole('button', { name: '2번째 스티커 다시 붙이기' }));

    const secondReplayImage = container.querySelectorAll<HTMLImageElement>('img')[1];
    expect(secondReplayImage).not.toBe(firstReplayImage);
    expect(secondReplayImage).toHaveClass('shop-sticker-hero__stamp--playing');
  });

  it('스티커 배경을 누르면 모든 스티커의 붙이기 애니메이션을 동시에 재생한다', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <ShopStickerHero
        headerContent={null}
        newestStickerIndex={2}
        placeId={101}
        stickerImages={STICKER_IMAGES}
      />
    );
    const initialImages = Array.from(container.querySelectorAll<HTMLImageElement>('img'));
    initialImages.forEach((image) => fireEvent.load(image));
    initialImages.forEach((image) => fireEvent.animationEnd(image));

    await user.click(screen.getByRole('button', { name: '모든 스티커 다시 붙이기' }));

    const replayedImages = Array.from(container.querySelectorAll<HTMLImageElement>('img'));
    replayedImages.forEach((image, index) => {
      expect(image).toHaveClass(
        index === 2
          ? 'shop-sticker-hero__stamp--playing-newest'
          : 'shop-sticker-hero__stamp--playing'
      );
      expect(image.style.animationDelay).toBe('0ms');
    });
  });

  it('스티커가 없으면 빈 상태 안내를 보여준다', () => {
    render(<ShopStickerHero headerContent={null} placeId={101} stickerImages={[]} />);

    expect(screen.getByText('아직 획득한 스티커가 없어요')).toBeInTheDocument();
  });

  it('빈 상태로 나갔다가 스티커가 생긴 뒤 다시 들어오면 등장 애니메이션을 재생한다', () => {
    const { unmount } = render(
      <ShopStickerHero headerContent={null} placeId={101} stickerImages={[]} />
    );
    unmount();

    const { container } = render(
      <ShopStickerHero headerContent={null} placeId={101} stickerImages={STICKER_IMAGES} />
    );
    Array.from(container.querySelectorAll<HTMLImageElement>('img')).forEach((image) =>
      fireEvent.load(image)
    );

    expect(container.querySelector('img')).toHaveClass('shop-sticker-hero__stamp--playing');
  });

  it('같은 매장을 다시 열 때마다 등장 애니메이션을 재생한다', () => {
    const { container, unmount } = render(
      <ShopStickerHero headerContent={null} placeId={101} stickerImages={STICKER_IMAGES} />
    );
    Array.from(container.querySelectorAll<HTMLImageElement>('img')).forEach((image) =>
      fireEvent.load(image)
    );
    expect(container.querySelector('img')).toHaveClass('shop-sticker-hero__stamp--playing');
    unmount();

    const { container: revisitContainer } = render(
      <ShopStickerHero headerContent={null} placeId={101} stickerImages={STICKER_IMAGES} />
    );
    const revisitImages = Array.from(revisitContainer.querySelectorAll<HTMLImageElement>('img'));
    revisitImages.forEach((image) =>
      expect(image).not.toHaveClass('shop-sticker-hero__stamp--playing')
    );
    revisitImages.forEach((image) => fireEvent.load(image));
    revisitImages.forEach((image) =>
      expect(image).toHaveClass('shop-sticker-hero__stamp--playing')
    );
  });
});
