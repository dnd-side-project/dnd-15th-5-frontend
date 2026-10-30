import { prepareIsnetBackground, removeIsnetBackground } from './isnetBackgroundRemoval';

import type { StickerWorkerRequest, StickerWorkerUpdate } from './stickerWorkerTypes';

const handleRequest = async (request: StickerWorkerRequest) => {
  const requestId = request.type === 'remove' ? request.requestId : undefined;
  const onUpdate = (update: StickerWorkerUpdate) => self.postMessage({ ...update, requestId });
  try {
    if (request.type === 'prepare') {
      await prepareIsnetBackground(onUpdate);
      self.postMessage({ type: 'ready' });
      return;
    }
    const blob = await removeIsnetBackground(request.image, onUpdate);
    self.postMessage({ type: 'success', requestId, blob });
  } catch (error) {
    const cause = error instanceof Error && error.cause instanceof Error ? error.cause : error;
    self.postMessage({
      type: 'error',
      requestId,
      message:
        error instanceof Error ? error.message : '배경을 제거하지 못했어요. 다시 시도해주세요.',
      details: cause instanceof Error ? cause.stack : String(cause),
    });
  }
};

// NOTE: 워밍업 중 들어온 사진은 준비 뒤 처리해 GPU 세션을 동시에 실행하지 않습니다.
let queue = Promise.resolve();
self.onmessage = (event: MessageEvent<StickerWorkerRequest>) => {
  queue = queue.then(() => handleRequest(event.data));
  return queue;
};
