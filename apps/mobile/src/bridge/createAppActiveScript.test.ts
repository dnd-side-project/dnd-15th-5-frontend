import { NATIVE_APP_ACTIVE_EVENT } from '@chapchap/shared/bridge';

import { createAppActiveScript } from './createAppActiveScript';

describe('createAppActiveScript', () => {
  it('신뢰한 origin에서만 앱 활성화 이벤트를 발생시킨다', () => {
    const script = createAppActiveScript('https://chapchap.kr');

    expect(script).toContain('window.location.origin === "https://chapchap.kr"');
    expect(script).toContain(JSON.stringify(NATIVE_APP_ACTIVE_EVENT));
    expect(script).toContain('window.dispatchEvent');
  });
});
