import { fn } from 'storybook/test';

import { PlaceSearchResultList } from './PlaceSearchResultList';

import type { Meta, StoryObj } from '@storybook/react-vite';

const places = [
  {
    id: 'twosome-gangnam',
    name: '투썸플레이스 강남점',
    address: '서울특별시 강남구 봉은사로 125 1층',
  },
  {
    id: 'starbucks-sinnonhyeon',
    name: '스타벅스 신논현점',
    address: '서울특별시 강남구 강남대로 476',
  },
];

const meta = {
  title: 'Shared/PlaceSearchResultList',
  component: PlaceSearchResultList,
  args: {
    hasKeyword: true,
    isLoading: false,
    isError: false,
    places,
    onSelect: fn(),
  },
  argTypes: {
    hasKeyword: { control: 'boolean' },
    isLoading: { control: 'boolean' },
    isError: { control: 'boolean' },
  },
} satisfies Meta<typeof PlaceSearchResultList>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 검색어가 있고 결과가 있을 때의 목록입니다. 결과 카드를 누르면 해당 장소를 전달합니다. */
export const Results: Story = {};

/** 키워드가 비어 있으면 결과 영역을 렌더링하지 않습니다. */
export const BeforeSearch: Story = {
  args: { hasKeyword: false, places: [] },
};

/** 요청 중에는 진행 표시를 보여줍니다. */
export const Loading: Story = {
  args: { isLoading: true, places: [] },
};

/** 요청 실패 안내를 보여줍니다. */
export const Error: Story = {
  args: { isError: true, places: [] },
};

/** 검색은 완료됐지만 일치하는 장소가 없을 때의 상태입니다. */
export const Empty: Story = {
  args: { places: [] },
};
