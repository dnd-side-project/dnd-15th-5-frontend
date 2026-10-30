import { createIsnetEngine } from './isnetEngine';

import type { IsnetSession } from './isnetEngine';

const prediction = new Float32Array([0, 1]);
const makeSession = (backend: IsnetSession['backend']): IsnetSession => ({
  backend,
  run: jest.fn().mockResolvedValue(prediction),
  dispose: jest.fn().mockResolvedValue(undefined),
});

it('동시에 준비·사진 요청이 들어와도 세션과 GPU 워밍업을 한 번만 만든다', async () => {
  const gpu = makeSession('webgpu');
  const createSession = jest.fn().mockResolvedValue(gpu);
  const warmupInput = jest.fn(() => new Float32Array([0]));
  const engine = createIsnetEngine({ canUseGpu: async () => true, createSession, warmupInput });
  const update = jest.fn();
  await Promise.all([
    engine.prepare(update),
    engine.prepare(update),
    engine.run(new Float32Array([1]), update),
  ]);
  await engine.run(new Float32Array([2]), update);
  expect(createSession).toHaveBeenCalledTimes(1);
  expect(warmupInput).toHaveBeenCalledTimes(1);
  expect(gpu.run).toHaveBeenCalledTimes(3);
  expect(gpu.dispose).not.toHaveBeenCalled();
  expect(update).toHaveBeenCalledWith(expect.objectContaining({ phase: 'reused' }));
});

it('CPU는 긴 테스트 추론 없이 세션만 준비한다', async () => {
  const cpu = makeSession('wasm');
  const warmupInput = jest.fn();
  const engine = createIsnetEngine({
    canUseGpu: async () => false,
    createSession: jest.fn().mockResolvedValue(cpu),
    warmupInput,
  });
  await engine.prepare(jest.fn());
  expect(cpu.run).not.toHaveBeenCalled();
  expect(warmupInput).not.toHaveBeenCalled();
});

it('GPU 워밍업 실패 시 GPU를 정리하고 CPU 세션을 재사용한다', async () => {
  const gpu = makeSession('webgpu');
  const cpu = makeSession('wasm');
  jest.mocked(gpu.run).mockRejectedValue(new Error('shader failed'));
  const createSession = jest.fn().mockResolvedValueOnce(gpu).mockResolvedValueOnce(cpu);
  const engine = createIsnetEngine({
    canUseGpu: async () => true,
    createSession,
    warmupInput: () => new Float32Array(),
  });
  const update = jest.fn();
  await engine.prepare(update);
  await engine.run(new Float32Array(), update);
  await engine.run(new Float32Array(), update);
  expect(gpu.dispose).toHaveBeenCalledTimes(1);
  expect(createSession).toHaveBeenCalledTimes(2);
  expect(update).toHaveBeenCalledWith(
    expect.objectContaining({ phase: 'fallback', backend: 'wasm' })
  );
  expect(cpu.run).toHaveBeenCalledTimes(2);
});

it('준비한 GPU가 사진 처리 중 유실돼도 CPU로 한 번만 전환한다', async () => {
  const gpu = makeSession('webgpu');
  const cpu = makeSession('wasm');
  jest
    .mocked(gpu.run)
    .mockResolvedValueOnce(prediction)
    .mockRejectedValueOnce(new Error('device lost'));
  const createSession = jest.fn().mockResolvedValueOnce(gpu).mockResolvedValueOnce(cpu);
  const engine = createIsnetEngine({
    canUseGpu: async () => true,
    createSession,
    warmupInput: () => new Float32Array(),
  });
  await engine.prepare(jest.fn());
  await expect(engine.run(new Float32Array(), jest.fn())).resolves.toBe(prediction);
  await engine.run(new Float32Array(), jest.fn());
  expect(createSession).toHaveBeenCalledTimes(2);
  expect(gpu.dispose).toHaveBeenCalledTimes(1);
  expect(cpu.run).toHaveBeenCalledTimes(2);
});

it('CPU 준비 실패 뒤에는 다음 요청에서 세션 준비를 재시도한다', async () => {
  const createSession = jest
    .fn()
    .mockRejectedValueOnce(new Error('offline'))
    .mockResolvedValueOnce(makeSession('wasm'));
  const engine = createIsnetEngine({
    canUseGpu: async () => false,
    createSession,
    warmupInput: () => new Float32Array(),
  });
  await expect(engine.prepare(jest.fn())).rejects.toThrow('offline');
  await engine.prepare(jest.fn());
  expect(createSession).toHaveBeenCalledTimes(2);
});
