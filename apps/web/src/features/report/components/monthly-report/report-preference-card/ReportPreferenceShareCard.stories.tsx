import ReportPreferenceShareScreen from './ReportPreferenceShareScreen';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  component: ReportPreferenceShareScreen,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: {
    description:
      '익숙한 동네와 단골 가게를 자주 찾아요. 마음에 들면 꾸준히 찾는 편이에요. 사장님이 알아볼지도 모르는 찐 단골 타입이에요.',
    metrics: [
      { leftLabel: '신규 탐색형', rightLabel: '단골 반복형', value: 78 },
      { leftLabel: '동네 확장형', rightLabel: '동네 집중형', value: 67 },
      { leftLabel: '낮소비형', rightLabel: '밤소비형', value: 19 },
      { leftLabel: '즉흥형', rightLabel: '규칙형', value: 79 },
    ],
    month: 8,
    nickname: '이앤더',
    tags: ['낮 활동파', '단골형', '규칙적'],
    title: '동네 터줏대감',
    variant: 'local-regular',
  },
} satisfies Meta<typeof ReportPreferenceShareScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const LocalRegular: Story = {};

export const AlleyExplorer: Story = {
  args: {
    description:
      '익숙한 동네에서도 새로운 가게를 찾아다녀요. 골목 속 숨은 맛집을 발견하는 재미를 즐겨요.',
    tags: ['낮 활동파', '단골형', '즉흥적'],
    title: '골목 발굴러',
    variant: 'alley-explorer',
  },
};

export const FoodNomad: Story = {
  args: {
    description: '맛있는 곳이라면 어디든 찾아가요. 한곳에 머물기엔 궁금한 맛집이 너무 많아요.',
    tags: ['야행성', '유목형', '즉흥적'],
    title: '미식 유목민',
    variant: 'food-nomad',
  },
};

export const NightWatch: Story = {
  args: {
    description:
      '정해진 동네, 익숙한 가게를 밤에 즐겨 찾는 편이에요. 새로운 곳보다 아는 곳에서 확실한 만족을 얻는 타입이에요.',
    tags: ['야행성', '단골형', '규칙적'],
    title: '골목 야간반장',
    variant: 'night-watch',
  },
};
