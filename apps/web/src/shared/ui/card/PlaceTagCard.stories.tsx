import { BlueLocationPinIcon } from '@/shared/assets/icons';

import { PlaceTagCard } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

// INFO: Chromatic 스냅샷이 외부 네트워크에 의존하지 않도록 실제 이미지 대신 data URI를 사용한다.
const PLACEHOLDER_THUMBNAIL_SRC =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='128'%3E%3Crect width='128' height='128' fill='%23cbd5ff'/%3E%3C/svg%3E";

const meta = {
  title: 'Shared/PlaceTagCard',
  component: PlaceTagCard,
  // INFO: 실제 사용 화면(모바일 프레임, 393px 기준)과 같은 폭에서 말줄임 동작을 확인할 수 있게 한다.
  decorators: [
    (Story) => (
      <div style={{ width: 360 }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    thumbnailSrc: {
      control: 'text',
      description:
        '썸네일 이미지 URL. `null`이거나 로드에 실패하면 기본 썸네일 아이콘으로 대체한다.',
    },
    title: {
      control: 'text',
    },
    tags: {
      control: 'object',
    },
  },
  args: {
    thumbnailSrc: null,
    title: '투썸플레이스',
    tags: [{ label: '용산구', icon: BlueLocationPinIcon }, { label: '카페' }],
  },
} satisfies Meta<typeof PlaceTagCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 썸네일이 없어 기본 썸네일 아이콘으로 대체되는 기본 상태입니다. */
export const Default: Story = {};

/** 썸네일 이미지가 있는 상태입니다. */
export const WithThumbnail: Story = {
  args: {
    thumbnailSrc: PLACEHOLDER_THUMBNAIL_SRC,
  },
};

/** 태그가 하나만 있는 상태입니다. */
export const SingleTag: Story = {
  args: {
    tags: [{ label: '카페' }],
  },
};

/** 태그가 여러 개라 줄바꿈될 수 있는 상태입니다. */
export const ManyTags: Story = {
  args: {
    tags: [
      { label: '용산구', icon: BlueLocationPinIcon },
      { label: '카페' },
      { label: '디저트' },
      { label: '24시간' },
    ],
  },
};

/** 이름이 카드 폭(360px)보다 길어 말줄임되는 상태입니다. */
export const LongTitle: Story = {
  args: {
    title: '투썸플레이스 강남역아이파크타워점(장기 임시 휴업 안내)',
  },
};
