import {
  StickerCoffeeImage,
  StickerDonutImage,
  StickerEyesImage,
  StickerFriesImage,
  StickerPizzaImage,
  StickerSpecialImage,
} from '@/shared/assets/images/stickers';

import StickerCollection from './StickerCollection';

import type { Meta, StoryObj } from '@storybook/react-vite';

const stickers = [
  StickerCoffeeImage,
  StickerDonutImage,
  StickerEyesImage,
  StickerFriesImage,
  StickerPizzaImage,
  StickerSpecialImage,
];

const meta = {
  title: 'Shared/StickerCollection',
  component: StickerCollection,
  args: { stickers },
  argTypes: {
    size: { control: 'inline-radio', options: ['default', 'compact'] },
    maxItems: { control: 'number' },
    replayStampAnimationOnClick: { control: 'boolean' },
  },
} satisfies Meta<typeof StickerCollection>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 기본 크기의 스티커 모음입니다. 마지막 줄은 빈 슬롯으로 채워집니다. */
export const Default: Story = {};

/** 목록 카드에 맞춘 작은 크기입니다. */
export const Compact: Story = {
  args: { size: 'compact' },
};

/** 표시 개수를 제한하고 스티커를 눌러 도장 애니메이션을 다시 재생합니다. */
export const InteractivePreview: Story = {
  args: { maxItems: 5, replayStampAnimationOnClick: true },
};
