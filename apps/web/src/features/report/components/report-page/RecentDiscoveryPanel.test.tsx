import { render, screen } from '@testing-library/react';

import RecentDiscoveryPanel from './RecentDiscoveryPanel';

describe('RecentDiscoveryPanel', () => {
  it('문구 길이와 관계없이 고정 높이에서 최대 두 줄로 표시한다', () => {
    const { container } = render(
      <RecentDiscoveryPanel messages="최근 발견 문구가 길어지더라도 패널 높이가 달라지지 않도록 최대 두 줄까지만 표시합니다." />
    );

    expect(container.firstChild).toHaveClass('h-18');
    expect(screen.getByText(/최근 발견 문구가 길어지더라도/)).toHaveClass('line-clamp-2');
  });
});
