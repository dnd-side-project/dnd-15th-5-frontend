export type ImglyGpuSupport = { supported: boolean; reason?: string };

type GpuEnvironment = {
  gpu?: Pick<GPU, 'requestAdapter'>;
  secureContext: boolean;
  crossOriginIsolated: boolean;
};

/** GPU를 사용할 수 없는 원인과 CPU 멀티스레드 가능 여부를 함께 진단합니다. */
export const getImglyGpuSupport = async ({
  gpu,
  secureContext,
  crossOriginIsolated,
}: GpuEnvironment): Promise<ImglyGpuSupport> => {
  const unavailable = (reason: string): ImglyGpuSupport => ({
    supported: false,
    reason: `${reason}; crossOriginIsolated=${crossOriginIsolated}`,
  });
  if (!secureContext) return unavailable('WebGPU에는 HTTPS 또는 localhost 접속이 필요합니다');
  if (!gpu) return unavailable('WebGPU API 없음: 브라우저 지원 및 그래픽 가속 설정을 확인해주세요');
  try {
    const adapter = await gpu.requestAdapter({ powerPreference: 'high-performance' });
    if (!adapter) return unavailable('사용 가능한 WebGPU adapter가 없습니다');
    if (!adapter.features.has('shader-f16'))
      return unavailable('GPU가 IMG.LY FP16 실행에 필요한 shader-f16을 지원하지 않습니다');
    return { supported: true };
  } catch (error) {
    return unavailable(
      'WebGPU adapter 요청 실패: ' + (error instanceof Error ? error.message : String(error))
    );
  }
};
