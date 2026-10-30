import { ISNET_ORIGINAL_MODEL } from '@chapchap/shared/record/isnet-model';

export const ISNET_MODELS = {
  wasm: {
    ...ISNET_ORIGINAL_MODEL,
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
