/** 웹과 네이티브가 동일한 원본 ISNet 가중치를 사용하도록 파일 버전을 고정합니다. */
export const ISNET_ORIGINAL_MODEL = {
  filename: 'isnet-general-use.onnx',
  bytes: 178648008,
  url: 'https://github.com/danielgatis/rembg/releases/download/v0.0.0/isnet-general-use.onnx',
  checksum: { algorithm: 'md5', value: 'fc16ebd8b0c10d971d3513d564d01e29' },
} as const;
