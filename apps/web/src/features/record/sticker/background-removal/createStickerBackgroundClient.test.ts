import { createStickerBackgroundClient } from './createStickerBackgroundClient';

import type { StickerWorkerMessage } from './stickerWorkerTypes';

class FakeWorker {
  onmessage: ((event: MessageEvent<StickerWorkerMessage>) => void) | null = null;
  onerror: (() => void) | null = null;
  onmessageerror: (() => void) | null = null;
  postMessage = jest.fn();
  terminate = jest.fn();
  respond(message: StickerWorkerMessage) {
    this.onmessage?.({ data: message } as MessageEvent<StickerWorkerMessage>);
  }
}
let workers: FakeWorker[];
let client: ReturnType<typeof createStickerBackgroundClient>;
const image = new Blob(['photo']);
const result = new Blob(['png']);
beforeEach(() => {
  jest.useFakeTimers();
  workers = [];
  client = createStickerBackgroundClient(() => {
    const worker = new FakeWorker();
    workers.push(worker);
    return worker as unknown as Worker;
  });
});
afterEach(() => {
  client.dispose();
  jest.useRealTimers();
});

it('사전 준비는 한 번만 요청하고 완료 후에도 Worker를 유지한다', () => {
  client.prepare();
  client.prepare();
  expect(workers).toHaveLength(1);
  expect(workers[0].postMessage).toHaveBeenCalledTimes(1);
  expect(workers[0].postMessage).toHaveBeenCalledWith({ type: 'prepare' });
  workers[0].respond({ type: 'ready' });
  jest.advanceTimersByTime(180_000);
  expect(workers[0].terminate).not.toHaveBeenCalled();
});

it('성공한 Worker를 다음 사진에도 사용하고 완료된 신호의 abort는 무시한다', async () => {
  client.prepare();
  workers[0].respond({ type: 'ready' });
  const firstController = new AbortController();
  const first = client.remove(image, firstController.signal, jest.fn());
  workers[0].respond({ type: 'success', requestId: 1, blob: result });
  await expect(first).resolves.toBe(result);
  firstController.abort();
  const next = client.remove(image, new AbortController().signal, jest.fn());
  workers[0].respond({ type: 'success', requestId: 1, blob: new Blob(['late']) });
  workers[0].respond({ type: 'success', requestId: 2, blob: result });
  await expect(next).resolves.toBe(result);
  expect(workers).toHaveLength(1);
  expect(workers[0].terminate).not.toHaveBeenCalled();
});

it('워밍업 중 진행률을 기다리는 사진 요청에 전달한다', async () => {
  client.prepare();
  const progress = jest.fn();
  const promise = client.remove(image, new AbortController().signal, progress);
  workers[0].respond({ type: 'progress', key: 'fetch:isnet', current: 1, total: 2 });
  expect(progress).toHaveBeenCalledWith(expect.stringContaining('50%'));
  workers[0].respond({ type: 'success', requestId: 1, blob: result });
  await promise;
});

it('사진 선택 전 다운로드 상태를 대기 중인 사진에 즉시 표시한다', async () => {
  client.prepare();
  workers[0].respond({ type: 'progress', key: 'fetch:isnet', current: 3, total: 4 });
  const progress = jest.fn();
  const promise = client.remove(image, new AbortController().signal, progress);
  expect(progress).toHaveBeenLastCalledWith(expect.stringContaining('75%'));
  workers[0].respond({ type: 'success', requestId: 1, blob: result });
  await promise;
});

it('모델 초기화와 실제 배경 제거를 구분해서 표시한다', async () => {
  const progress = jest.fn();
  const promise = client.remove(image, new AbortController().signal, progress);
  workers[0].respond({ type: 'progress', key: 'fetch:isnet', current: 100, total: 100 });
  expect(progress).toHaveBeenLastCalledWith('배경 제거 모델을 시작하고 있어요');
  workers[0].respond({ type: 'diagnostic', backend: 'wasm', phase: 'initializing' });
  expect(progress).toHaveBeenLastCalledWith('배경 제거 모델을 시작하고 있어요');
  workers[0].respond({
    type: 'progress',
    requestId: 1,
    key: 'inference:isnet:wasm',
    current: 0,
    total: 0,
  });
  expect(progress).toHaveBeenLastCalledWith('사진에서 배경을 지우고 있어요');
  workers[0].respond({ type: 'success', requestId: 1, blob: result });
  await promise;
});

it('대기 중인 사진이 있을 때 사전 로딩에 실패하면 바로 오류를 전달한다', async () => {
  client.prepare();
  const promise = client.remove(image, new AbortController().signal, jest.fn());
  workers[0].respond({ type: 'error', message: '모델을 시작하지 못했어요' });
  await expect(promise).rejects.toThrow('모델을 시작하지 못했어요');
  expect(workers[0].terminate).toHaveBeenCalledTimes(1);
});

it('취소하면 실제 Worker를 종료하고 다음 요청에는 새 Worker를 사용한다', async () => {
  const controller = new AbortController();
  const first = client.remove(image, controller.signal, jest.fn());
  controller.abort();
  await expect(first).rejects.toMatchObject({ name: 'AbortError' });
  const next = client.remove(image, new AbortController().signal, jest.fn());
  workers[0].respond({ type: 'success', requestId: 1, blob: result });
  workers[0].onerror?.();
  expect(workers[1].terminate).not.toHaveBeenCalled();
  workers[1].respond({ type: 'success', requestId: 2, blob: result });
  await expect(next).resolves.toBe(result);
  expect(workers[0].terminate).toHaveBeenCalledTimes(1);
});

it('중복 사진 요청은 이전 연산을 중단하고 최신 요청만 완료한다', async () => {
  const first = client.remove(image, new AbortController().signal, jest.fn());
  const firstError = expect(first).rejects.toMatchObject({ name: 'AbortError' });
  const next = client.remove(image, new AbortController().signal, jest.fn());
  workers[1].respond({ type: 'success', requestId: 2, blob: result });
  await firstError;
  await expect(next).resolves.toBe(result);
  expect(workers[0].terminate).toHaveBeenCalledTimes(1);
});

it('화면 이탈은 준비 중인 Worker와 사진 요청을 모두 정리한다', async () => {
  client.prepare();
  const promise = client.remove(image, new AbortController().signal, jest.fn());
  client.dispose();
  await expect(promise).rejects.toMatchObject({ name: 'AbortError' });
  expect(workers[0].terminate).toHaveBeenCalledTimes(1);
});

it('워밍업 실패는 조용히 정리하고 사진 선택 시 새 Worker로 재시도한다', async () => {
  client.prepare();
  workers[0].respond({ type: 'error', message: 'prepare failed' });
  const promise = client.remove(image, new AbortController().signal, jest.fn());
  workers[1].respond({ type: 'success', requestId: 1, blob: result });
  await expect(promise).resolves.toBe(result);
  expect(workers[0].terminate).toHaveBeenCalledTimes(1);
});

it('요청 시간이 초과되면 Worker를 종료하고 오류를 전달한다', async () => {
  const promise = client.remove(image, new AbortController().signal, jest.fn());
  jest.advanceTimersByTime(180_000);
  await expect(promise).rejects.toThrow('시간이 초과');
  expect(workers[0].terminate).toHaveBeenCalledTimes(1);
});

it('이미 취소된 요청은 Worker를 만들지 않는다', async () => {
  const controller = new AbortController();
  controller.abort();
  await expect(client.remove(image, controller.signal, jest.fn())).rejects.toMatchObject({
    name: 'AbortError',
  });
  expect(workers).toHaveLength(0);
});
