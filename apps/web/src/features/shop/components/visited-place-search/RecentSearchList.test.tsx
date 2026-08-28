import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { RecentSearchList } from './RecentSearchList';

describe('RecentSearchList', () => {
  it('최근 검색어가 없으면 아무것도 렌더링하지 않는다', () => {
    const { container } = render(
      <RecentSearchList keywords={[]} onSelect={jest.fn()} onRemove={jest.fn()} />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('최근 검색어 목록을 순서대로 표시한다', () => {
    render(
      <RecentSearchList keywords={['투썸', '카페']} onSelect={jest.fn()} onRemove={jest.fn()} />
    );

    expect(screen.getByText('최근 검색어')).toBeInTheDocument();
    const items = screen.getAllByRole('listitem');
    expect(items[0]).toHaveTextContent('투썸');
    expect(items[1]).toHaveTextContent('카페');
  });

  it('검색어를 클릭하면 onSelect에 해당 검색어를 전달한다', async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();
    render(<RecentSearchList keywords={['투썸']} onSelect={onSelect} onRemove={jest.fn()} />);

    await user.click(screen.getByRole('button', { name: '투썸' }));

    expect(onSelect).toHaveBeenCalledWith('투썸');
  });

  it('삭제 버튼을 클릭하면 onRemove에 해당 검색어를 전달한다', async () => {
    const user = userEvent.setup();
    const onRemove = jest.fn();
    render(<RecentSearchList keywords={['투썸']} onSelect={jest.fn()} onRemove={onRemove} />);

    await user.click(screen.getByRole('button', { name: '투썸 최근 검색어 삭제' }));

    expect(onRemove).toHaveBeenCalledWith('투썸');
  });
});
