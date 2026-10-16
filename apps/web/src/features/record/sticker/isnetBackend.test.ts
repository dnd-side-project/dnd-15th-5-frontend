import { getIsnetGpuAdapter, runIsnetWithFallback } from './isnetBackend';

it('실제 adapter가 FP16을 지원하면 GPU를 선택한다', async () => {
  const adapter = { features: new Set(['shader-f16']) };
  const requestAdapter = jest.fn().mockResolvedValue(adapter);
  expect(await getIsnetGpuAdapter({ requestAdapter })).toBe(adapter);
  expect(requestAdapter).toHaveBeenCalledWith({ powerPreference: 'high-performance' });
});

it('GPU API가 없으면 adapter 요청 없이 CPU를 사용한다', async () => {
  expect(await getIsnetGpuAdapter()).toBeNull();
});

it.each([null, { features: new Set() }])(
  'FP16 adapter가 없으면 CPU를 선택한다',
  async (adapter) => {
    expect(
      await getIsnetGpuAdapter({ requestAdapter: jest.fn().mockResolvedValue(adapter) })
    ).toBeNull();
  }
);

it('GPU adapter 접근이 차단되면 CPU를 선택한다', async () => {
  expect(
    await getIsnetGpuAdapter({ requestAdapter: jest.fn().mockRejectedValue(new Error('blocked')) })
  ).toBeNull();
});

it('GPU가 성공하면 CPU 추론을 실행하지 않는다', async () => {
  const run = jest.fn().mockResolvedValue('gpu-mask');
  const onFallback = jest.fn();
  expect(await runIsnetWithFallback(true, run, onFallback)).toBe('gpu-mask');
  expect(run.mock.calls).toEqual([['webgpu']]);
  expect(onFallback).not.toHaveBeenCalled();
});

it('GPU 실행 실패 시 원인을 보존하고 CPU에서 한 번만 재시도한다', async () => {
  const error = new Error('device lost');
  const run = jest.fn().mockRejectedValueOnce(error).mockResolvedValueOnce('cpu-mask');
  const onFallback = jest.fn();
  expect(await runIsnetWithFallback(true, run, onFallback)).toBe('cpu-mask');
  expect(run.mock.calls).toEqual([['webgpu'], ['wasm']]);
  expect(onFallback).toHaveBeenCalledWith(error);
});

it('GPU 미지원 환경에서는 GPU 모델을 로드하지 않는다', async () => {
  const run = jest.fn().mockResolvedValue('cpu-mask');
  expect(await runIsnetWithFallback(false, run, jest.fn())).toBe('cpu-mask');
  expect(run.mock.calls).toEqual([['wasm']]);
});

it('CPU 재시도도 실패하면 오류를 전달하고 반복 실행하지 않는다', async () => {
  const error = new Error('cpu failed');
  const run = jest.fn().mockRejectedValueOnce(new Error('gpu failed')).mockRejectedValueOnce(error);
  await expect(runIsnetWithFallback(true, run, jest.fn())).rejects.toBe(error);
  expect(run).toHaveBeenCalledTimes(2);
});
