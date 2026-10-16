import { createImglyBackgroundEngine } from './createImglyBackgroundEngine';

const photo = new Blob(['photo']);
const warmup = new Blob(['warmup']);
const foreground = new Blob(['foreground']);
const setup = (hasGpu = true, forceCpu = false) => {
  const api = {
    preload: jest.fn().mockResolvedValue(undefined),
    removeBackground: jest.fn().mockResolvedValue(foreground),
  };
  const getGpuSupport = jest.fn().mockResolvedValue({
    supported: hasGpu,
    reason: hasGpu ? undefined : 'WebGPU API 없음',
  });
  const createWarmupImage = jest.fn().mockResolvedValue(warmup);
  const engine = createImglyBackgroundEngine({ api, getGpuSupport, createWarmupImage, forceCpu });
  return { engine, api, getGpuSupport, createWarmupImage };
};

it('GPU 사전 로딩과 워밍업을 한 번 수행하고 같은 설정으로 다음 사진을 처리한다', async () => {
  const { engine, api } = setup();
  await engine.prepare(jest.fn());
  await expect(engine.remove(photo, jest.fn())).resolves.toBe(foreground);
  await engine.remove(photo, jest.fn());
  expect(api.preload).toHaveBeenCalledTimes(1);
  expect(api.removeBackground).toHaveBeenCalledTimes(3);
  const config = api.preload.mock.calls[0][0];
  expect(config).toMatchObject({ device: 'gpu', model: 'isnet_fp16', proxyToWorker: false });
  expect(api.removeBackground.mock.calls[0]).toEqual([warmup, config]);
  expect(api.removeBackground.mock.calls[1][1]).toBe(config);
  expect(api.removeBackground.mock.calls[2][1]).toBe(config);
});

it('CPU에서는 오래 걸리는 예비 추론을 생략하고 IMG.LY로 사진을 처리한다', async () => {
  const { engine, api, createWarmupImage } = setup(false);
  await engine.prepare(jest.fn());
  expect(api.removeBackground).not.toHaveBeenCalled();
  await engine.remove(photo, jest.fn());
  expect(api.preload).toHaveBeenCalledWith(
    expect.objectContaining({ device: 'cpu', model: 'isnet_quint8' })
  );
  expect(api.removeBackground).toHaveBeenCalledTimes(1);
  expect(createWarmupImage).not.toHaveBeenCalled();
});

it('GPU 실패 후 새 CPU Worker에서는 GPU 감지와 워밍업을 다시 하지 않는다', async () => {
  const { engine, api, getGpuSupport, createWarmupImage } = setup(true, true);
  await engine.remove(photo, jest.fn());
  expect(getGpuSupport).not.toHaveBeenCalled();
  expect(createWarmupImage).not.toHaveBeenCalled();
  expect(api.preload).toHaveBeenCalledWith(
    expect.objectContaining({ device: 'cpu', model: 'isnet_quint8' })
  );
});

it('세션에 저장된 진행률 콜백이 현재 사진 요청으로 전달된다', async () => {
  const { engine, api } = setup(false);
  const prepareUpdate = jest.fn();
  await engine.prepare(prepareUpdate);
  prepareUpdate.mockClear();
  const imageUpdate = jest.fn();
  api.removeBackground.mockImplementation(async (_, config) => {
    config.progress('compute:inference', 1, 4);
    return foreground;
  });
  await engine.remove(photo, imageUpdate);
  expect(imageUpdate).toHaveBeenCalledWith({
    type: 'progress',
    key: 'compute:inference',
    current: 1,
    total: 4,
  });
  expect(prepareUpdate).not.toHaveBeenCalled();
});

it('GPU 워밍업 실패를 숨기지 않고 CPU 복구가 가능하도록 실행 장치를 보존한다', async () => {
  const { engine, api } = setup();
  api.removeBackground.mockRejectedValueOnce(new Error('GPU device lost'));
  await expect(engine.prepare(jest.fn())).rejects.toThrow('GPU device lost');
  expect(engine.getDevice()).toBe('gpu');
});

it('CPU 선택 원인과 사용 모델을 완료 로그에도 남긴다', async () => {
  const { engine } = setup(false);
  await engine.prepare(jest.fn());
  const update = jest.fn();
  await engine.remove(photo, update);
  expect(update).toHaveBeenLastCalledWith(
    expect.objectContaining({
      phase: 'complete',
      backend: 'cpu',
      model: 'isnet_quint8',
      details: 'WebGPU API 없음',
    })
  );
});

it('사진이 바로 들어오면 예비 추론 없이 실제 사진을 한 번만 처리한다', async () => {
  const { engine, api, createWarmupImage } = setup();
  await expect(engine.remove(photo, jest.fn())).resolves.toBe(foreground);
  expect(api.preload).toHaveBeenCalledTimes(1);
  expect(api.removeBackground).toHaveBeenCalledTimes(1);
  expect(api.removeBackground).toHaveBeenCalledWith(photo, expect.any(Object));
  expect(createWarmupImage).not.toHaveBeenCalled();
});

it('모델 로딩 중 사진이 도착하면 큐에서 기다리는 사진을 위해 예비 추론을 생략한다', async () => {
  const { engine, api, createWarmupImage } = setup();
  let finishPreload = () => {};
  api.preload.mockImplementationOnce(
    () =>
      new Promise<void>((resolve) => {
        finishPreload = resolve;
      })
  );
  const preparing = engine.prepare(jest.fn());
  engine.prioritizePhoto();
  await Promise.resolve();
  finishPreload();
  await preparing;
  await engine.remove(photo, jest.fn());
  expect(api.removeBackground).toHaveBeenCalledTimes(1);
  expect(createWarmupImage).not.toHaveBeenCalled();
});

it('예비 이미지 인코딩 중 사진이 도착해도 불필요한 추론을 생략한다', async () => {
  const { engine, api, createWarmupImage } = setup();
  let finishEncoding: (blob: Blob) => void = () => {};
  let notifyEncodingStarted = () => {};
  const encodingStarted = new Promise<void>((resolve) => {
    notifyEncodingStarted = resolve;
  });
  createWarmupImage.mockImplementationOnce(
    () =>
      new Promise<Blob>((resolve) => {
        finishEncoding = resolve;
        notifyEncodingStarted();
      })
  );
  const preparing = engine.prepare(jest.fn());
  await encodingStarted;
  engine.prioritizePhoto();
  finishEncoding(warmup);
  await preparing;
  await engine.remove(photo, jest.fn());
  expect(api.removeBackground).toHaveBeenCalledTimes(1);
  expect(api.removeBackground).toHaveBeenCalledWith(photo, expect.any(Object));
});
