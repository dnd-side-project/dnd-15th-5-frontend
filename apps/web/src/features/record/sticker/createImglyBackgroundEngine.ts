import type { ImglyGpuSupport } from './getImglyGpuSupport';
import type { StickerDevice, StickerDiagnostic, StickerWorkerUpdate } from './stickerWorkerTypes';
import type { Config, ImageSource } from '@imgly/background-removal';

type EngineOptions = {
  api: {
    preload: (config: Config) => Promise<void>;
    removeBackground: (image: ImageSource, config: Config) => Promise<Blob>;
  };
  getGpuSupport: () => Promise<ImglyGpuSupport>;
  createWarmupImage: () => Promise<Blob>;
  forceCpu?: boolean;
};

/** 동일한 설정과 Worker를 유지해 IMG.LY 내부 모델 세션을 재사용합니다. */
export const createImglyBackgroundEngine = ({
  api,
  getGpuSupport,
  createWarmupImage,
  forceCpu = false,
}: EngineOptions) => {
  let device: StickerDevice = 'cpu';
  let ready: Promise<void> | undefined;
  let hasPhotoRequest = false;
  let onUpdate: (update: StickerWorkerUpdate) => void = () => {};
  let config: Config;
  let model: 'isnet_fp16' | 'isnet_quint8';
  let deviceReason: string | undefined;
  const report = (phase: StickerDiagnostic['phase'], elapsedMs?: number) =>
    onUpdate({
      type: 'diagnostic',
      backend: device,
      phase,
      model,
      details: deviceReason,
      elapsedMs,
    });

  const prepare = (update: typeof onUpdate) => {
    onUpdate = update;
    if (ready) return ready;
    const initialize = async () => {
      const gpu = forceCpu
        ? { supported: false, reason: 'GPU 실행 실패 후 새 Worker에서 CPU로 재시도합니다' }
        : await getGpuSupport();
      device = gpu.supported ? 'gpu' : 'cpu';
      deviceReason = gpu.reason;
      // NOTE: CPU는 FP16을 네이티브로 연산하지 못하므로 IMG.LY의 UINT8 모델을 사용합니다.
      model = device === 'gpu' ? 'isnet_fp16' : 'isnet_quint8';
      // NOTE: IMG.LY는 설정의 JSON 값을 세션 캐시 키로 쓰므로 요청마다 바꾸지 않습니다.
      config = {
        device,
        model,
        proxyToWorker: false,
        fetchArgs: { cache: 'force-cache' },
        output: { format: 'image/png' },
        progress: (key, current, total) => onUpdate({ type: 'progress', key, current, total }),
      };
      report('selected');
      await api.preload(config);
      if (device === 'gpu' && !hasPhotoRequest) {
        const warmup = await createWarmupImage();
        // NOTE: 로딩·이미지 인코딩 중 사진이 도착하면 예비 추론 대신 실제 사진을 먼저 처리합니다.
        if (!hasPhotoRequest) {
          report('warming');
          await api.removeBackground(warmup, config);
        }
      }
      report('ready');
    };
    ready = initialize();
    return ready;
  };

  const remove = async (image: Blob, update: typeof onUpdate) => {
    hasPhotoRequest = true;
    const wasPrepared = Boolean(ready);
    await prepare(update);
    if (wasPrepared) report('reused');
    const startedAt = performance.now();
    const result = await api.removeBackground(image, config);
    report('complete', Math.round(performance.now() - startedAt));
    return result;
  };

  return {
    prepare,
    remove,
    getDevice: () => device,
    prioritizePhoto: () => {
      hasPhotoRequest = true;
    },
  };
};
