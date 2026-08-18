import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import BottomTabBar from './BottomTabBar';

describe('BottomTabBar', () => {
  it('"홈" 탭을 클릭하면 onHomeClick을 호출한다', () => {
    const onHomeClick = jest.fn();
    render(
      <MemoryRouter initialEntries={['/home']}>
        <BottomTabBar onHomeClick={onHomeClick} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('link', { name: '홈' }));

    expect(onHomeClick).toHaveBeenCalledTimes(1);
  });

  it('주요 화면으로 이동하는 세 개의 링크를 제공한다', () => {
    render(
      <MemoryRouter initialEntries={['/home']}>
        <BottomTabBar />
      </MemoryRouter>
    );

    expect(screen.getByRole('navigation', { name: '주요 메뉴' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '홈' })).toHaveAttribute('href', '/home');
    expect(screen.getByRole('link', { name: '기록하기' })).toHaveAttribute('href', '/record');
    expect(screen.getByRole('link', { name: '리포트' })).toHaveAttribute('href', '/report');
  });

  it('현재 경로에 해당하는 탭을 활성 상태로 표시한다', () => {
    render(
      <MemoryRouter initialEntries={['/report']}>
        <BottomTabBar />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: '리포트' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: '홈' })).not.toHaveAttribute('aria-current');
  });
});
