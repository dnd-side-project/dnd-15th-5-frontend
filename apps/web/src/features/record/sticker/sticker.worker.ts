import { removeBackground } from '@imgly/background-removal';

self.onmessage = async (event: MessageEvent<Blob>) => {
  try {
    const blob = await removeBackground(event.data, {
      device: 'cpu',
      model: 'isnet_fp16',
      output: { format: 'image/png' },
      progress: (key, current, total) => {
        self.postMessage({ type: 'progress', key, current, total });
      },
    });
    self.postMessage({ type: 'success', blob });
  } catch {
    self.postMessage({ type: 'error' });
  }
};
