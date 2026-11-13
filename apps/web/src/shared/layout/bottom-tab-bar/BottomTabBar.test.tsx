import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

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

    expect(screen.getByRole('navigation', { name: '주요 메뉴' })).toHaveClass(
      'mobile-frame',
      'fixed',
      'bottom-0',
      'pb-[calc(2rem+env(safe-area-inset-bottom))]'
    );
    expect(screen.getByRole('navigation', { name: '주요 메뉴' })).not.toHaveClass('sticky');
    expect(screen.getByRole('link', { name: '홈' })).toHaveAttribute('href', '/home');
    expect(screen.getByRole('link', { name: '기록하기' })).toHaveAttribute('href', '/record');
    expect(screen.getByRole('link', { name: '리포트' })).toHaveAttribute('href', '/report');
  });

  it.each([
    ['/home', '홈'],
    ['/report', '리포트'],
    ['/report/monthly', '리포트'],
    ['/record', null],
    ['/home/shop/123', null],
  ])('%s에서 해당 탭만 활성 상태로 표시한다', (path, activeLabel) => {
    render(
      <MemoryRouter initialEntries={[path]}>
        <BottomTabBar />
      </MemoryRouter>
    );

    for (const label of ['홈', '리포트']) {
      const link = screen.getByRole('link', { name: label });
      if (label === activeLabel) {
        expect(link).toHaveAttribute('aria-current', 'page');
      } else {
        expect(link).not.toHaveAttribute('aria-current');
      }
    }
  });

  it('탭과 기록하기 링크로 이동하고 기존 분석 식별자를 유지한다', () => {
    const onHomeClick = jest.fn();
    render(
      <MemoryRouter initialEntries={['/home']}>
        <BottomTabBar onHomeClick={onHomeClick} />
        <Routes>
          <Route path="/home" element={<main>홈 화면</main>} />
          <Route path="/report" element={<main>리포트 화면</main>} />
          <Route path="/record" element={<main>기록 화면</main>} />
        </Routes>
      </MemoryRouter>
    );

    for (const [label, id] of [
      ['홈', 'home'],
      ['리포트', 'report'],
      ['기록하기', 'record'],
    ]) {
      expect(screen.getByRole('link', { name: label })).toHaveAttribute(
        'data-analytics-id',
        `bottom-navigation-${id}`
      );
    }

    fireEvent.click(screen.getByRole('link', { name: '리포트' }));
    expect(screen.getByRole('main')).toHaveTextContent('리포트 화면');
    expect(screen.getByRole('link', { name: '리포트' })).toHaveAttribute('aria-current', 'page');
    fireEvent.click(screen.getByRole('link', { name: '홈' }));
    expect(screen.getByRole('main')).toHaveTextContent('홈 화면');
    expect(onHomeClick).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('link', { name: '기록하기' }));
    expect(screen.getByRole('main')).toHaveTextContent('기록 화면');
    expect(onHomeClick).toHaveBeenCalledTimes(1);
  });
});
