import { NATIVE_PAGE_BACK_EVENT } from '@chapchap/shared/bridge';

/** 허용된 문서에만 시스템 뒤로가기 이벤트를 전달합니다. */
export const createPageBackScript = (trustedOrigin: string) =>
  `if (window.location.origin === ${JSON.stringify(trustedOrigin)}) { window.dispatchEvent(new Event(${JSON.stringify(NATIVE_PAGE_BACK_EVENT)})); } true;`;
