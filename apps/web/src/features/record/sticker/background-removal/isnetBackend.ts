import type { IsnetBackend } from './isnetModels';

export type IsnetGpuAdapter = GPUAdapter;
export type IsnetGpuApi = Pick<GPU, 'requestAdapter'>;

/** API 노출 여부뿐 아니라 실제 adapter와 FP16 shader 지원 여부도 확인합니다. */
export const getIsnetGpuAdapter = async (gpu?: IsnetGpuApi) => {
  if (!gpu) return null;
  try {
    const adapter = await gpu.requestAdapter({ powerPreference: 'high-performance' });
    return adapter?.features.has('shader-f16') ? adapter : null;
  } catch {
    return null;
  }
};

/** GPU 모델 초기화·추론 실패 모두 CPU 원본 모델로 한 번만 재시도합니다. */
export const runIsnetWithFallback = async <T>(
  hasGpu: boolean,
  run: (backend: IsnetBackend) => Promise<T>,
  onFallback: (error: unknown) => void
): Promise<T> => {
  if (hasGpu) {
    try {
      return await run('webgpu');
    } catch (error) {
      onFallback(error);
    }
  }
  return run('wasm');
};
