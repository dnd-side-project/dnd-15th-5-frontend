import { fn } from 'storybook/test';

import { PlaceSearchInput } from './PlaceSearchInput';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Shared/PlaceSearchInput',
  component: PlaceSearchInput,
  args: { onSearch: fn() },
  argTypes: {
    debounceMs: { control: 'number' },
    placeholder: { control: 'text' },
    appliedKeyword: { control: false },
  },
} satisfies Meta<typeof PlaceSearchInput>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 입력 후 debounce 시간이 지나면 자동 검색하고 Enter 또는 검색 버튼으로 즉시 제출합니다. */
export const Default: Story = {};

/** 최근 검색어 선택처럼 외부에서 키워드를 채워 즉시 검색하는 예시입니다. */
export const AppliedKeyword: Story = {
  args: { appliedKeyword: { keyword: '투썸플레이스' } },
};
