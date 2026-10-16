import { getImglyGpuSupport } from './getImglyGpuSupport';

const environment = { secureContext: true, crossOriginIsolated: false };
const fakeGpu = (supportsFp16: boolean) => ({
  requestAdapter: jest
    .fn()
    .mockResolvedValue({ features: new Set(supportsFp16 ? ['shader-f16'] : []) }),
});

it('보안 컨텍스트가 아니면 adapter를 요청하지 않고 원인을 안내한다', async () => {
  const gpu = fakeGpu(true);
  const result = await getImglyGpuSupport({ ...environment, secureContext: false, gpu });
  expect(result.supported).toBe(false);
  expect(result.reason).toContain('HTTPS');
  expect(gpu.requestAdapter).not.toHaveBeenCalled();
});

it('GPU API가 없으면 브라우저 설정과 격리 상태를 안내한다', async () => {
  const result = await getImglyGpuSupport(environment);
  expect(result.supported).toBe(false);
  expect(result.reason).toContain('WebGPU API 없음');
  expect(result.reason).toContain('crossOriginIsolated=false');
});

it('사용 가능한 adapter가 없으면 CPU 선택 원인을 보존한다', async () => {
  const gpu = { requestAdapter: jest.fn().mockResolvedValue(null) };
  expect(await getImglyGpuSupport({ ...environment, gpu })).toEqual({
    supported: false,
    reason: expect.stringContaining('adapter가 없습니다'),
  });
});

it('adapter가 FP16을 지원하지 않으면 구체적인 기능명을 안내한다', async () => {
  expect(await getImglyGpuSupport({ ...environment, gpu: fakeGpu(false) })).toEqual({
    supported: false,
    reason: expect.stringContaining('shader-f16'),
  });
});

it('FP16 지원 GPU는 고성능 adapter로 실행한다', async () => {
  const gpu = fakeGpu(true);
  expect(await getImglyGpuSupport({ ...environment, gpu })).toEqual({ supported: true });
  expect(gpu.requestAdapter).toHaveBeenCalledWith({ powerPreference: 'high-performance' });
});

it('adapter 요청 오류가 발생하면 CPU로 전환하고 원인을 보존한다', async () => {
  const gpu = { requestAdapter: jest.fn().mockRejectedValue(new Error('GPU blocked')) };
  const result = await getImglyGpuSupport({ ...environment, gpu });
  expect(result.supported).toBe(false);
  expect(result.reason).toContain('GPU blocked');
});
