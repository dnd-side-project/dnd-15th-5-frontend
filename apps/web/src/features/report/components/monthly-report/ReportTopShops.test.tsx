import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import ReportTopShops from './ReportTopShops';

const createShop = (rank: 1 | 2 | 3) => ({
  id: String(rank),
  months: 2,
  name: `${rank}위 가게`,
  rank,
  stickerImages: [],
  visits: 3,
});

describe('ReportTopShops', () => {
  it('가게가 한 곳이면 2위와 3위를 빈 카드로 표시한다', () => {
    render(
      <MemoryRouter>
        <ReportTopShops shops={[createShop(1)]} />
      </MemoryRouter>
    );

    expect(screen.getByText('단골 한 곳에 올인했어요')).toBeInTheDocument();
    expect(screen.getByText('이번달 단골은 여기까지')).toBeInTheDocument();
    expect(screen.getByLabelText('2위')).toBeInTheDocument();
    expect(screen.getByLabelText('3위')).toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(1);
  });

  it('가게가 세 곳이면 빈 카드를 표시하지 않는다', () => {
    render(
      <MemoryRouter>
        <ReportTopShops shops={[createShop(1), createShop(2), createShop(3)]} />
      </MemoryRouter>
    );

    expect(screen.queryByText('단골 한 곳에 올인했어요')).not.toBeInTheDocument();
    expect(screen.queryByText('이번달 단골은 여기까지')).not.toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(3);
  });
});
