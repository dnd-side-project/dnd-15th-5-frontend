export const ISNET_MODELS = {
  wasm: {
    filename: 'isnet-general-use.onnx',
    bytes: 178648008,
    url: 'https://github.com/danielgatis/rembg/releases/download/v0.0.0/isnet-general-use.onnx',
    checksum: { algorithm: 'md5', value: 'fc16ebd8b0c10d971d3513d564d01e29' },
    runtime: 'ort.wasm.min.mjs',
    wasmModule: 'ort-wasm-simd-threaded.mjs',
    wasmBinary: 'ort-wasm-simd-threaded.wasm',
  },
  webgpu: {
    filename: 'isnet-general-use-fp16.onnx',
    bytes: 88141111,
    url: 'https://huggingface.co/Ko033/isnet-general-use-onnx/resolve/5349b617911fd60c619b52f32e2b593517b78df3/onnx/model_fp16.onnx',
    checksum: {
      algorithm: 'sha256',
      value: '0857167263ad816d67c26852b99c2861e46a86c9a889527061a5eb2a6f90d32c',
    },
    runtime: 'ort.webgpu.min.mjs',
    wasmModule: 'ort-wasm-simd-threaded.jsep.mjs',
    wasmBinary: 'ort-wasm-simd-threaded.jsep.wasm',
  },
} as const;

export type IsnetBackend = keyof typeof ISNET_MODELS;
