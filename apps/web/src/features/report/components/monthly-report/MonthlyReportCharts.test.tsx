import { render, screen } from '@testing-library/react';

import CategoryChart from './CategoryChart';
import WeekdaySpendingChart from './WeekdaySpendingChart';

describe('monthly report charts', () => {
  it('카테고리 비율을 합계 100으로 정규화해 안내한다', () => {
    render(
      <CategoryChart
        categories={[
          { category: '카페', percentage: 60 },
          { category: '음식점', percentage: 30 },
          { category: '운동', percentage: 20 },
        ]}
      />
    );

    expect(
      screen.getByRole('group', {
        name: '카테고리 분포: 카페 55%, 음식점 27%, 운동 18%',
      })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '카페 55%' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '음식점 27%' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '운동 18%' })).toBeInTheDocument();
  });

  it('요일별 실제 소비 금액을 접근 가능한 이름으로 제공한다', () => {
    render(
      <WeekdaySpendingChart
        insight="금요일에 가장 많이 소비했어요"
        items={[
          { day: '월', amount: 25_000 },
          { day: '금', amount: 100_000 },
        ]}
      />
    );

    expect(screen.getByRole('button', { name: '월요일 소비 25,000원' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '금요일 소비 100,000원' })).toBeInTheDocument();
  });

  it('카테고리 합계가 0이면 포커스 가능한 차트 대신 빈 상태를 보여준다', () => {
    render(
      <CategoryChart
        categories={[
          { category: '카페', percentage: 0 },
          { category: '음식점', percentage: 0 },
        ]}
      />
    );

    expect(screen.getByText('카테고리 소비 데이터가 없어요')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
