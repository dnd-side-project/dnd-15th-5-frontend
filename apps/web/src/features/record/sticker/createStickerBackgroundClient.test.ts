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
let diagnostics: jest.Mock;
const image = new Blob(['photo']);
const result = new Blob(['png']);
beforeEach(() => {
  jest.useFakeTimers();
  workers = [];
  diagnostics = jest.fn();
  client = createStickerBackgroundClient(() => {
    const worker = new FakeWorker();
    workers.push(worker);
    return worker as unknown as Worker;
  }, diagnostics);
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
  workers[0].respond({ type: 'progress', key: 'fetch:imgly', current: 1, total: 2 });
  expect(progress).toHaveBeenCalledWith(expect.stringContaining('50%'));
  workers[0].respond({ type: 'success', requestId: 1, blob: result });
  await promise;
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

it('GPU 실패 시 새 Worker에서 같은 사진을 CPU로 한 번만 재시도한다', async () => {
  const progress = jest.fn();
  const promise = client.remove(image, new AbortController().signal, progress);
  workers[0].respond({ type: 'error', requestId: 1, message: 'GPU failed', retryOnCpu: true });
  expect(workers[0].terminate).toHaveBeenCalledTimes(1);
  expect(workers[1].postMessage).toHaveBeenCalledWith({
    type: 'remove',
    requestId: 1,
    image,
    device: 'cpu',
  });
  expect(progress).toHaveBeenCalledWith(expect.stringContaining('CPU'));
  workers[0].respond({ type: 'success', requestId: 1, blob: new Blob(['stale']) });
  workers[1].respond({ type: 'success', requestId: 1, blob: result });
  await expect(promise).resolves.toBe(result);
  const next = client.remove(image, new AbortController().signal, jest.fn());
  expect(workers[1].postMessage).toHaveBeenLastCalledWith({
    type: 'remove',
    requestId: 2,
    image,
    device: 'cpu',
  });
  workers[1].respond({ type: 'error', requestId: 2, message: 'CPU failed', retryOnCpu: true });
  await expect(next).rejects.toThrow('CPU failed');
  expect(workers).toHaveLength(2);
});

it('GPU 준비 중 대기하던 사진은 실패 후 새 CPU Worker에서 처리한다', async () => {
  client.prepare();
  const promise = client.remove(image, new AbortController().signal, jest.fn());
  workers[0].respond({ type: 'error', message: 'GPU init failed', retryOnCpu: true });
  expect(workers[1].postMessage).toHaveBeenCalledWith({
    type: 'remove',
    requestId: 1,
    image,
    device: 'cpu',
  });
  workers[1].respond({ type: 'success', requestId: 1, blob: result });
  await expect(promise).resolves.toBe(result);
});

it('GPU 사전 준비가 실패하면 사진 선택 전에도 CPU 모델 준비를 시작한다', () => {
  client.prepare();
  workers[0].respond({ type: 'error', message: 'GPU init failed', retryOnCpu: true });
  expect(workers[1].postMessage).toHaveBeenCalledWith({ type: 'prepare', device: 'cpu' });
  workers[1].respond({ type: 'ready' });
  jest.advanceTimersByTime(180_000);
  expect(workers[1].terminate).not.toHaveBeenCalled();
});

it('CPU 재시도 중에도 최초 사진 요청의 취소와 시간 제한을 유지한다', async () => {
  const controller = new AbortController();
  const promise = client.remove(image, controller.signal, jest.fn());
  jest.advanceTimersByTime(179_000);
  workers[0].respond({ type: 'error', requestId: 1, message: 'GPU failed', retryOnCpu: true });
  jest.advanceTimersByTime(1_000);
  await expect(promise).rejects.toThrow('시간이 초과');
  expect(workers[1].terminate).toHaveBeenCalledTimes(1);
  const next = client.remove(image, controller.signal, jest.fn());
  controller.abort();
  await expect(next).rejects.toMatchObject({ name: 'AbortError' });
  expect(workers[2].terminate).toHaveBeenCalledTimes(1);
});

it('CPU 완료 로그에도 GPU 실패 원문을 남기고 화면 이탈 시 초기화한다', async () => {
  client.prepare();
  workers[0].respond({
    type: 'error',
    message: 'GPU failed',
    details: 'Error: dynamic import failed',
    retryOnCpu: true,
  });
  const complete = {
    type: 'diagnostic' as const,
    backend: 'cpu' as const,
    phase: 'complete' as const,
    elapsedMs: 123,
  };
  workers[1].respond(complete);
  expect(diagnostics).toHaveBeenLastCalledWith({
    ...complete,
    gpuFailure: 'Error: dynamic import failed',
  });
  client.dispose();
  client.prepare();
  workers[2].respond(complete);
  expect(diagnostics).toHaveBeenLastCalledWith(complete);
});
