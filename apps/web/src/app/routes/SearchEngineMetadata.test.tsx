import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Link, MemoryRouter } from 'react-router-dom';

import SearchEngineMetadata from './SearchEngineMetadata';

it('개인 화면으로 이동하면 색인과 루트 canonical을 제거하고 돌아오면 복원한다', async () => {
  const user = userEvent.setup();
  const view = render(
    <MemoryRouter>
      <SearchEngineMetadata />
      <Link to="/report">리포트</Link>
      <Link to="/">시작 화면</Link>
    </MemoryRouter>
  );

  expect(document.querySelector('meta[name="robots"]')).toHaveAttribute('content', 'index, follow');
  expect(document.head.querySelector('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://chapchap.kr/'
  );

  await user.click(screen.getByRole('link', { name: '리포트' }));
  expect(document.querySelector('meta[name="robots"]')).toHaveAttribute(
    'content',
    'noindex, nofollow'
  );
  expect(document.querySelector('link[rel="canonical"]')).not.toBeInTheDocument();

  await user.click(screen.getByRole('link', { name: '시작 화면' }));
  expect(document.querySelectorAll('meta[name="robots"]')).toHaveLength(1);
  expect(document.querySelector('meta[name="robots"]')).toHaveAttribute('content', 'index, follow');
  expect(document.head.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
  expect(document.head.querySelector('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://chapchap.kr/'
  );

  view.unmount();
  expect(document.head.querySelector('link[rel="canonical"]')).not.toBeInTheDocument();
});

it.each(['/home', '/auth/callback', '/share/example', '/unknown'])(
  '%s 직접 진입 시에도 색인을 제외한다',
  (pathname) => {
    const view = render(
      <MemoryRouter initialEntries={[pathname]}>
        <SearchEngineMetadata />
      </MemoryRouter>
    );

    expect(document.querySelector('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex, nofollow'
    );
    view.unmount();
    expect(document.querySelector('meta[name="robots"]')).not.toBeInTheDocument();
  }
);
