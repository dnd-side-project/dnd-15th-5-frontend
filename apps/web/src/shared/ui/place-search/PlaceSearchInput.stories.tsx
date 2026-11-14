import { useEffect, useState } from 'react';
import { fn } from 'storybook/test';

import { PlaceSearchInput } from './PlaceSearchInput';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Shared/PlaceSearchInput',
  component: PlaceSearchInput,
  args: { onSearch: fn() },
  argTypes: {
    placeholder: { control: 'text' },
    appliedKeyword: { control: false },
  },
} satisfies Meta<typeof PlaceSearchInput>;

export default meta;
type Story = StoryObj<typeof meta>;

function AppliedKeywordExample({
  onSearch,
  placeholder,
}: {
  onSearch: (keyword: string) => void;
  placeholder?: string;
}) {
  const [appliedKeyword, setAppliedKeyword] = useState<{ keyword: string }>();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setAppliedKeyword({ keyword: '투썸플레이스' });
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <PlaceSearchInput
      onSearch={onSearch}
      appliedKeyword={appliedKeyword}
      placeholder={placeholder}
    />
  );
}

/** 입력 중에는 검색하지 않고 완료·Enter 또는 검색 버튼으로 제출합니다. */
export const Default: Story = {};

/** 최근 검색어로 입력을 채운 뒤 직접 제출하는 예시입니다. */
export const AppliedKeyword: Story = {
  render: (args) => (
    <AppliedKeywordExample onSearch={args.onSearch} placeholder={args.placeholder} />
  ),
};
