import { getIsnetGpuAdapter } from './isnetBackend';
import { createIsnetEngine } from './isnetEngine';
import { createIsnetInput, createIsnetMask, ISNET_INPUT_SIZE } from './isnetImage';
import { loadCachedIsnetModel } from './isnetModelCache';
import { ISNET_MODELS } from './isnetModels';

import type { IsnetGpuAdapter, IsnetGpuApi } from './isnetBackend';
import type { IsnetSession } from './isnetEngine';
import type { IsnetBackend } from './isnetModels';
import type { StickerWorkerUpdate } from './stickerWorkerTypes';
import type * as OnnxRuntime from 'onnxruntime-web/wasm';

const RUNTIME_PATH = import.meta.env.BASE_URL + 'isnet-runtime/';
const MODELS_PATH = import.meta.env.BASE_URL + 'models/';
let adapterPromise: Promise<IsnetGpuAdapter | null> | undefined;
const getAdapter = () => {
  adapterPromise ??= getIsnetGpuAdapter((navigator as Navigator & { gpu?: IsnetGpuApi }).gpu);
  return adapterPromise;
};
const getCacheStorage = () => {
  try {
    return globalThis.caches;
  } catch {
    return undefined;
  }
};
const createCanvas = (width: number, height: number) => {
  const canvas = new OffscreenCanvas(width, height);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('이 환경에서는 이미지 편집을 지원하지 않아요.');
  return { canvas, context };
};
const assertImageSupport = () => {
  if (typeof OffscreenCanvas === 'undefined' || typeof createImageBitmap === 'undefined') {
    throw new Error(
      '이 브라우저에서는 배경 제거를 지원하지 않아요. 최신 브라우저로 다시 시도해주세요.'
    );
  }
};
const createSession = async (
  backend: IsnetBackend,
  onUpdate: (update: StickerWorkerUpdate) => void
): Promise<IsnetSession> => {
  const config = ISNET_MODELS[backend];
  const runtimeUrl = new URL(RUNTIME_PATH + config.runtime, self.location.href).href;
  let runtime: typeof OnnxRuntime;
  try {
    // NOTE: 원본 public 모듈은 Vite의 Worker HMR·사전 번들링 변환을 피합니다.
    runtime = await import(/* @vite-ignore */ runtimeUrl);
  } catch (cause) {
    throw new Error('배경 제거 기능을 불러오지 못했어요. 화면을 새로고침하고 다시 시도해주세요.', {
      cause,
    });
  }
  const { env, InferenceSession, Tensor } = runtime;
  env.wasm.numThreads = 1;
  env.wasm.proxy = false;
  env.wasm.wasmPaths = {
    mjs: new URL(RUNTIME_PATH + config.wasmModule, self.location.href).href,
    wasm: new URL(RUNTIME_PATH + config.wasmBinary, self.location.href).href,
  };
  if (backend === 'webgpu') {
    const adapter = await getAdapter();
    if (adapter) env.webgpu.adapter = adapter;
  }
  onUpdate({ type: 'diagnostic', backend, phase: 'selected' });
  let model: Uint8Array;
  try {
    model = await loadCachedIsnetModel({
      url: new URL(MODELS_PATH + config.filename, self.location.href).href,
      bytes: config.bytes,
      version: config.checksum.value,
      cacheStorage: getCacheStorage(),
      onProgress: (current, total) =>
        onUpdate({ type: 'progress', key: 'fetch:isnet:' + backend, current, total }),
    });
  } catch (cause) {
    throw new Error(
      '배경 제거 데이터를 불러오지 못했어요. 네트워크를 확인하고 다시 시도해주세요.',
      { cause }
    );
  }
  const destroyDevice = () => {
    if (backend !== 'webgpu') return;
    const device = Object.getOwnPropertyDescriptor(env.webgpu, 'device')?.value as
      { destroy: () => void } | undefined;
    device?.destroy();
  };
  let session: OnnxRuntime.InferenceSession;
  try {
    onUpdate({ type: 'diagnostic', backend, phase: 'initializing' });
    session = await InferenceSession.create(model, { executionProviders: [backend] });
  } catch (cause) {
    destroyDevice();
    throw new Error('배경 제거 모델을 시작하지 못했어요. 화면을 새로고침하고 다시 시도해주세요.', {
      cause,
    });
  }
  return {
    backend,
    run: async (pixels) => {
      const input = new Tensor('float32', pixels, [1, 3, ISNET_INPUT_SIZE, ISNET_INPUT_SIZE]);
      let outputs: OnnxRuntime.InferenceSession.ReturnType | undefined;
      try {
        const outputName = session.outputNames[0];
        outputs = await session.run({ [session.inputNames[0]]: input }, [outputName]);
        const prediction = outputs[outputName];
        const [batch, channels, height, width] = prediction.dims;
        if (
          prediction.type !== 'float32' ||
          batch !== 1 ||
          channels !== 1 ||
          height !== ISNET_INPUT_SIZE ||
          width !== ISNET_INPUT_SIZE ||
          prediction.data.length !== width * height
        ) {
          throw new Error('피사체 마스크 형식이 올바르지 않아요.');
        }
        const data = new Float32Array(prediction.data as Float32Array);
        if (!data.every(Number.isFinite)) throw new Error('피사체 마스크를 읽지 못했어요.');
        return data;
      } finally {
        input.dispose();
        Object.values(outputs ?? {}).forEach((output) => output.dispose());
      }
    },
    dispose: async () => {
      try {
        await session.release();
      } finally {
        destroyDevice();
      }
    },
  };
};

const engine = createIsnetEngine({
  canUseGpu: async () => Boolean(await getAdapter()),
  createSession,
  warmupInput: () => new Float32Array(3 * ISNET_INPUT_SIZE * ISNET_INPUT_SIZE),
});

/** 화면 진입 시 호출해 모델 로딩과 GPU 워밍업을 먼저 완료합니다. */
export const prepareIsnetBackground = async (onUpdate: (update: StickerWorkerUpdate) => void) => {
  assertImageSupport();
  await engine.prepare(onUpdate);
};

/** 준비한 세션으로 사진을 처리하고 GPU 실행 실패 시 CPU로 전환합니다. */
export const removeIsnetBackground = async (
  image: Blob,
  onUpdate: (update: StickerWorkerUpdate) => void
): Promise<Blob> => {
  assertImageSupport();
  const bitmap = await createImageBitmap(image);
  try {
    const resized = createCanvas(ISNET_INPUT_SIZE, ISNET_INPUT_SIZE);
    resized.context.drawImage(bitmap, 0, 0, ISNET_INPUT_SIZE, ISNET_INPUT_SIZE);
    const pixels = resized.context.getImageData(0, 0, ISNET_INPUT_SIZE, ISNET_INPUT_SIZE);
    const prediction = await engine.run(createIsnetInput(pixels.data), onUpdate);
    const mask = createCanvas(ISNET_INPUT_SIZE, ISNET_INPUT_SIZE);
    mask.context.putImageData(
      new ImageData(createIsnetMask(prediction), ISNET_INPUT_SIZE, ISNET_INPUT_SIZE),
      0,
      0
    );
    const foreground = createCanvas(bitmap.width, bitmap.height);
    foreground.context.drawImage(bitmap, 0, 0);
    foreground.context.globalCompositeOperation = 'destination-in';
    foreground.context.imageSmoothingEnabled = true;
    foreground.context.imageSmoothingQuality = 'high';
    foreground.context.drawImage(mask.canvas, 0, 0, bitmap.width, bitmap.height);
    return await foreground.canvas.convertToBlob({ type: 'image/png' });
  } catch (cause) {
    throw new Error('사진에서 배경을 지우지 못했어요. 더 작은 사진으로 다시 시도해주세요.', {
      cause,
    });
  } finally {
    bitmap.close();
  }
};
