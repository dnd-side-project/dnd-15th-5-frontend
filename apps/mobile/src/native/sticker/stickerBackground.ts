import { requireOptionalNativeModule } from 'expo';

import type { BridgeResult, BridgePayload, StickerInferenceBackend } from '@chapchap/shared/bridge';

type NativeIsnetModule = {
  prepare: () => Promise<StickerInferenceBackend>;
  remove: (requestId: string, base64: string) => Promise<BridgeResult<'removeStickerBackground'>>;
  cancel: (requestId: string) => void;
};
const getModule = () => {
  const module = requireOptionalNativeModule<NativeIsnetModule>('ChapChapIsnet');
  if (!module)
    throw new Error('네이티브 누끼 기능이 없는 앱 빌드예요. 새 개발 빌드를 설치해주세요.');
  return module;
};
export const hasNativeStickerBackground = () =>
  Boolean(requireOptionalNativeModule<NativeIsnetModule>('ChapChapIsnet'));
let ready: Promise<BridgeResult<'prepareStickerBackground'>> | null = null;
let active: { requestId: string; controller: AbortController; started: boolean } | null = null;
let running: Promise<BridgeResult<'removeStickerBackground'>> | null = null;

const cancelled = () => new Error('사진 처리를 취소했어요.');

/** 네이티브 연산이 남아 있어도 취소된 요청의 대기와 이벤트 리스너는 즉시 정리합니다. */
const waitForJob = <T>(operation: Promise<T>, signal: AbortSignal): Promise<T> =>
  new Promise((resolve, reject) => {
    const cleanup = () => signal.removeEventListener('abort', onAbort);
    const onAbort = () => {
      cleanup();
      reject(cancelled());
    };
    void operation.then(
      (value) => {
        cleanup();
        resolve(value);
      },
      (error: unknown) => {
        cleanup();
        reject(error);
      }
    );
    if (signal.aborted) onAbort();
    else signal.addEventListener('abort', onAbort, { once: true });
  });

/** 모델은 앱 시작 시 미리 준비하고 앱 내 기록 화면이 바뀌어도 재사용합니다. */
export const prepareNativeStickerBackground = (): Promise<
  BridgeResult<'prepareStickerBackground'>
> => {
  ready ??= Promise.resolve()
    .then(async () => ({ ready: true as const, backend: await getModule().prepare() }))
    .catch((error) => {
      ready = null;
      throw error;
    });
  return ready;
};

export const removeNativeStickerBackground = async (
  payload: BridgePayload<'removeStickerBackground'>
): Promise<BridgeResult<'removeStickerBackground'>> => {
  if (active && !active.controller.signal.aborted)
    throw new Error('이전 사진을 처리하고 있어요. 잠시 후 다시 시도해주세요.');
  const job = { requestId: payload.requestId, controller: new AbortController(), started: false };
  active = job;
  const { signal } = job.controller;
  try {
    await waitForJob(prepareNativeStickerBackground(), signal);
    // NOTE: 취소된 이전 연산과 새 추론을 겹쳐 실행하지 않고 같은 모델을 안전하게 재사용합니다.
    if (running)
      await waitForJob(
        running.then(
          () => undefined,
          () => undefined
        ),
        signal
      );
    if (signal.aborted) throw cancelled();
    job.started = true;
    const operation = getModule().remove(payload.requestId, payload.base64);
    running = operation;
    const clearRunning = () => {
      if (running === operation) running = null;
    };
    void operation.then(clearRunning, clearRunning);
    const result = await waitForJob(operation, signal);
    if (signal.aborted) throw cancelled();
    if (__DEV__) {
      // eslint-disable-next-line no-console -- 실기기의 실제 추론 경로·시간만 기록하고 사진 데이터는 남기지 않습니다.
      console.info('[ISNet native]', {
        backend: result.backend,
        elapsedMs: Math.round(result.elapsedMs),
      });
    }
    return result;
  } finally {
    if (active === job) active = null;
  }
};

/** 요청은 즉시 취소하고, 남은 네이티브 연산이 끝나면 대기 중인 새 사진을 처리합니다. */
export const cancelNativeStickerBackground = ({
  requestId,
}: BridgePayload<'cancelStickerBackground'>) => {
  const job = active;
  if (job?.requestId === requestId) {
    job.controller.abort();
    if (job.started) getModule().cancel(requestId);
  }
  return { cancelled: true as const };
};
