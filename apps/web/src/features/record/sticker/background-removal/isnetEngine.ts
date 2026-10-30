import { runIsnetWithFallback } from './isnetBackend';

import type { IsnetBackend } from './isnetModels';
import type { StickerWorkerUpdate } from './stickerWorkerTypes';

export type IsnetSession = {
  backend: IsnetBackend;
  run: (pixels: Float32Array) => Promise<Float32Array>;
  dispose: () => Promise<void>;
};
type EngineOptions = {
  canUseGpu: () => Promise<boolean>;
  createSession: (
    backend: IsnetBackend,
    onUpdate: (update: StickerWorkerUpdate) => void
  ) => Promise<IsnetSession>;
  warmupInput: () => Float32Array;
};

/** Worker 생명주기 동안 초기화·GPU 워밍업을 한 번만 수행하고 세션을 재사용합니다. */
export const createIsnetEngine = ({ canUseGpu, createSession, warmupInput }: EngineOptions) => {
  let ready: Promise<IsnetSession> | null = null;
  let isGpuDisabled = false;
  const reportFallback = (error: unknown, onUpdate: (update: StickerWorkerUpdate) => void) => {
    isGpuDisabled = true;
    onUpdate({
      type: 'diagnostic',
      backend: 'wasm',
      phase: 'fallback',
      details: error instanceof Error ? error.stack : String(error),
    });
  };
  const release = async (session: IsnetSession) => {
    try {
      await session.dispose();
    } catch {
      /* 장치 유실 중 정리 실패가 CPU 재시도를 막지 않도록 합니다. */
    }
  };
  const prepare = (onUpdate: (update: StickerWorkerUpdate) => void): Promise<IsnetSession> => {
    if (ready) return ready;
    const initialize = async () =>
      runIsnetWithFallback(
        !isGpuDisabled && (await canUseGpu()),
        async (backend) => {
          const session = await createSession(backend, onUpdate);
          try {
            if (backend === 'webgpu') {
              onUpdate({ type: 'diagnostic', backend, phase: 'warming' });
              await session.run(warmupInput());
            }
            onUpdate({ type: 'diagnostic', backend, phase: 'ready' });
            return session;
          } catch (error) {
            await release(session);
            throw error;
          }
        },
        (error) => reportFallback(error, onUpdate)
      );
    ready = initialize().catch((error) => {
      ready = null;
      throw error;
    });
    return ready;
  };
  const run = async (pixels: Float32Array, onUpdate: (update: StickerWorkerUpdate) => void) => {
    const wasPrepared = Boolean(ready);
    let session = await prepare(onUpdate);
    if (wasPrepared) onUpdate({ type: 'diagnostic', backend: session.backend, phase: 'reused' });
    onUpdate({ type: 'progress', key: 'inference:isnet:' + session.backend, current: 0, total: 0 });
    let startedAt = performance.now();
    let prediction: Float32Array;
    try {
      prediction = await session.run(pixels);
    } catch (error) {
      if (session.backend !== 'webgpu') throw error;
      reportFallback(error, onUpdate);
      await release(session);
      ready = null;
      session = await prepare(onUpdate);
      startedAt = performance.now();
      prediction = await session.run(pixels);
    }
    onUpdate({
      type: 'diagnostic',
      backend: session.backend,
      phase: 'complete',
      elapsedMs: Math.round(performance.now() - startedAt),
    });
    return prediction;
  };
  return { prepare, run };
};
