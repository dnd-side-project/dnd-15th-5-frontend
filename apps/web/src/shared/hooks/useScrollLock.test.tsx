import { render } from '@testing-library/react';

import { useScrollLock } from './useScrollLock';

function ScrollLockFixture() {
  useScrollLock();
  return null;
}

describe('useScrollLock', () => {
  it('마운트 중 body 스크롤을 잠그고 언마운트하면 기존 값을 복원한다', () => {
    document.body.style.overflow = 'auto';
    const { unmount } = render(<ScrollLockFixture />);

    expect(document.body.style.overflow).toBe('hidden');

    unmount();

    expect(document.body.style.overflow).toBe('auto');
    document.body.style.overflow = '';
  });
});
