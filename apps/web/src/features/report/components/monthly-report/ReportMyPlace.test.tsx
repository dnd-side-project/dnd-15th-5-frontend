import { render, screen } from '@testing-library/react';

import ReportMyPlace from './ReportMyPlace';

describe('ReportMyPlace', () => {
  it('동네가 두 곳이면 남은 한 자리를 빈 카드로 표시한다', () => {
    render(
      <ReportMyPlace
        districts={[
          { name: '역삼1동', visits: 6 },
          { name: '잠실6동', visits: 1 },
        ]}
      />
    );

    expect(screen.getByText('두 동네에 진심이었던 달')).toBeInTheDocument();
  });

  it('동네가 한 곳이면 오른쪽 빈 영역을 하나의 카드로 표시한다', () => {
    render(<ReportMyPlace districts={[{ name: '역삼1동', visits: 6 }]} />);

    expect(screen.getByText('한 동네에 진심이었던 달')).toBeInTheDocument();
  });

  it('동네가 세 곳이면 빈 카드를 표시하지 않는다', () => {
    render(
      <ReportMyPlace
        districts={[
          { name: '역삼1동', visits: 6 },
          { name: '잠실6동', visits: 2 },
          { name: '서초2동', visits: 1 },
        ]}
      />
    );

    expect(screen.queryByText(/동네에 진심이었던 달/)).not.toBeInTheDocument();
  });
});
