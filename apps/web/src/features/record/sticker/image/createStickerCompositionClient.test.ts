import { createStickerCompositionClient } from './createStickerCompositionClient';
import { StickerCompositionUnavailableError } from './stickerCompositionTypes';

import type { StickerCompositionMessage } from './stickerCompositionTypes';

class FakeWorker {
  onmessage: ((event: MessageEvent<StickerCompositionMessage>) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  onmessageerror: (() => void) | null = null;
  postMessage = jest.fn();
  terminate = jest.fn();
  respond(message: StickerCompositionMessage) {
    this.onmessage?.({ data: message } as MessageEvent<StickerCompositionMessage>);
  }
}

const foreground = new Blob(['foreground']);
const png = new Blob(['sticker'], { type: 'image/png' });
let workers: FakeWorker[];
const createWorker = jest.fn(() => {
  const worker = new FakeWorker();
  workers.push(worker);
  return worker as unknown as Worker;
});
const compose = createStickerCompositionClient(createWorker);

beforeEach(() => {
  jest.useFakeTimers();
  createWorker.mockClear();
  workers = [];
});
afterEach(() => jest.useRealTimers());

it('합성한 PNG를 반환하고 Worker와 타이머를 정리한다', async () => {
  const task = compose(foreground, new AbortController().signal);
  expect(workers[0].postMessage).toHaveBeenCalledWith(foreground);
  workers[0].respond({ type: 'success', blob: png });
  await expect(task).resolves.toBe(png);
  expect(workers[0].terminate).toHaveBeenCalledTimes(1);
  expect(workers[0].onmessage).toBeNull();
  expect(workers[0].onerror).toBeNull();
  expect(workers[0].onmessageerror).toBeNull();
  expect(jest.getTimerCount()).toBe(0);
});

it('이미 취소한 작업은 Worker를 만들지 않는다', async () => {
  const controller = new AbortController();
  controller.abort();
  await expect(compose(foreground, controller.signal)).rejects.toMatchObject({
    name: 'AbortError',
  });
  expect(createWorker).not.toHaveBeenCalled();
});

it('취소한 Worker의 늦은 응답이 다음 합성에 반영되지 않는다', async () => {
  const controller = new AbortController();
  const first = compose(foreground, controller.signal);
  controller.abort();
  await expect(first).rejects.toMatchObject({ name: 'AbortError' });
  const next = compose(foreground, new AbortController().signal);
  workers[0].respond({ type: 'success', blob: new Blob(['late']) });
  workers[1].respond({ type: 'success', blob: png });
  await expect(next).resolves.toBe(png);
  expect(workers[0].terminate).toHaveBeenCalledTimes(1);
  expect(workers[1].terminate).toHaveBeenCalledTimes(1);
});

it('Worker를 지원하지 않는 환경은 기존 합성으로 복구할 수 있게 구분한다', async () => {
  const task = compose(foreground, new AbortController().signal);
  workers[0].respond({ type: 'unsupported' });
  await expect(task).rejects.toBeInstanceOf(StickerCompositionUnavailableError);
  expect(workers[0].terminate).toHaveBeenCalledTimes(1);
});

it('피사체 오류는 지원 여부 오류로 바꾸지 않고 전달한다', async () => {
  const task = compose(foreground, new AbortController().signal);
  workers[0].respond({ type: 'error', message: '피사체를 찾지 못했어요.' });
  await expect(task).rejects.toThrow('피사체');
  expect(workers[0].terminate).toHaveBeenCalledTimes(1);
});

it('Worker 로드 실패는 오류 이벤트를 처리하고 기존 합성으로 복구할 수 있게 한다', async () => {
  const task = compose(foreground, new AbortController().signal);
  const event = new ErrorEvent('error', { cancelable: true });
  workers[0].onerror?.(event);
  await expect(task).rejects.toBeInstanceOf(StickerCompositionUnavailableError);
  expect(event.defaultPrevented).toBe(true);
  expect(workers[0].terminate).toHaveBeenCalledTimes(1);
});

it('생성이 거부된 Worker는 타이머를 만들지 않고 기존 합성으로 복구한다', async () => {
  createWorker.mockImplementationOnce(() => {
    throw new Error('CSP');
  });
  await expect(compose(foreground, new AbortController().signal)).rejects.toBeInstanceOf(
    StickerCompositionUnavailableError
  );
  expect(jest.getTimerCount()).toBe(0);
});

it('합성 시간이 초과하면 연산을 종료하고 재시도할 수 있다', async () => {
  const task = compose(foreground, new AbortController().signal);
  jest.advanceTimersByTime(30_000);
  await expect(task).rejects.toThrow('시간이 초과');
  expect(workers[0].terminate).toHaveBeenCalledTimes(1);
  const next = compose(foreground, new AbortController().signal);
  workers[1].respond({ type: 'success', blob: png });
  await expect(next).resolves.toBe(png);
});

it('이미지를 Worker로 전달하지 못해도 핸들러와 타이머를 정리한다', async () => {
  const worker = new FakeWorker();
  worker.postMessage.mockImplementation(() => {
    throw new Error('DataCloneError');
  });
  createWorker.mockReturnValueOnce(worker as unknown as Worker);

  await expect(compose(foreground, new AbortController().signal)).rejects.toBeInstanceOf(
    StickerCompositionUnavailableError
  );
  expect(worker.terminate).toHaveBeenCalledTimes(1);
  expect(worker.onmessage).toBeNull();
  expect(worker.onerror).toBeNull();
  expect(worker.onmessageerror).toBeNull();
  expect(jest.getTimerCount()).toBe(0);
});

it('Worker 응답을 읽지 못하면 폴백으로 복구할 수 있게 종료한다', async () => {
  const task = compose(foreground, new AbortController().signal);
  workers[0].onmessageerror?.();
  await expect(task).rejects.toBeInstanceOf(StickerCompositionUnavailableError);
  expect(workers[0].terminate).toHaveBeenCalledTimes(1);
  expect(jest.getTimerCount()).toBe(0);
});
