import '@testing-library/jest-dom';

import { TextDecoder, TextEncoder } from 'node:util';

Object.assign(globalThis, { TextDecoder, TextEncoder });

Object.defineProperty(window, 'scrollTo', {
  value: () => {},
  writable: true,
});
