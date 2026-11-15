import '@testing-library/jest-dom';

import { TextDecoder, TextEncoder } from 'node:util';
import { runInThisContext } from 'node:vm';

Object.assign(globalThis, { TextDecoder, TextEncoder });

// NOTE: jsdom에 없는 Fetch API는 Node의 구현으로 보충해 데이터 라우터를 실행합니다.
Object.assign(globalThis, runInThisContext('({ Request, Response, Headers })'));

Object.defineProperty(window, 'scrollTo', {
  value: () => {},
  writable: true,
});
