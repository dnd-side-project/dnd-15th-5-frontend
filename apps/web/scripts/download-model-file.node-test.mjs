import assert from 'node:assert/strict';
import { access, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import { downloadModelFile } from './download-model-file.mjs';

const model = { filename: 'model.onnx', url: 'https://example.com/model.onnx' };

/** 실제 임시 파일을 사용하되 네트워크 요청과 대기는 테스트에서 대체합니다. */
const createTemporaryFile = async (context) => {
  const directory = await mkdtemp(join(tmpdir(), 'model-download-'));
  context.after(() => rm(directory, { recursive: true, force: true }));
  return join(directory, 'model.download');
};

test('본문 수신 실패 후 부분 파일을 제거하고 처음부터 다시 저장한다', async (context) => {
  const temporary = await createTemporaryFile(context);
  let attempts = 0;
  const waits = [];
  await downloadModelFile(model, temporary, {
    fetchResponse: async () => {
      attempts += 1;
      if (attempts === 1) {
        let sent = false;
        return new Response(
          new ReadableStream({
            pull(controller) {
              if (sent) controller.error(new Error('본문 연결 끊김'));
              else {
                sent = true;
                controller.enqueue(new TextEncoder().encode('partial'));
              }
            },
          })
        );
      }
      await assert.rejects(access(temporary), { code: 'ENOENT' });
      return new Response('complete');
    },
    wait: async (milliseconds) => waits.push(milliseconds),
  });
  assert.equal(attempts, 2);
  assert.equal(await readFile(temporary, 'utf8'), 'complete');
  assert.deepEqual(waits, [1000]);
});

for (const [name, headers, expectedDelay] of [
  ['RateLimit', { RateLimit: '"resolvers";r=0;t=30' }, 30000],
  ['Retry-After 초', { 'Retry-After': '8' }, 8000],
  ['두 헤더 중 긴 시간', { RateLimit: '"resolvers";r=0;t=30', 'Retry-After': '8' }, 30000],
  ['유효하지 않은 헤더', { RateLimit: '"resolvers";t=invalid', 'Retry-After': 'invalid' }, 1000],
  ['헤더 없음', {}, 1000],
]) {
  test(`429 응답 대기: ${name}`, async (context) => {
    const temporary = await createTemporaryFile(context);
    let attempts = 0;
    const waits = [];
    await downloadModelFile(model, temporary, {
      fetchResponse: async () =>
        ++attempts === 1
          ? new Response('limited', { status: 429, headers })
          : new Response('complete'),
      wait: async (milliseconds) => waits.push(milliseconds),
    });
    assert.deepEqual(waits, [expectedDelay]);
    assert.equal(await readFile(temporary, 'utf8'), 'complete');
  });
}

test('Retry-After HTTP 날짜를 대기 시간으로 변환한다', async (context) => {
  const temporary = await createTemporaryFile(context);
  const now = Date.parse('2026-01-01T00:00:00Z');
  context.mock.method(Date, 'now', () => now);
  let attempts = 0;
  const waits = [];
  await downloadModelFile(model, temporary, {
    fetchResponse: async () =>
      ++attempts === 1
        ? new Response('limited', {
            status: 429,
            headers: { 'Retry-After': new Date(now + 10000).toUTCString() },
          })
        : new Response('complete'),
    wait: async (milliseconds) => waits.push(milliseconds),
  });
  assert.deepEqual(waits, [10000]);
});

test('네트워크 오류는 세 번까지만 요청하고 지수형 대기를 적용한다', async (context) => {
  const temporary = await createTemporaryFile(context);
  let attempts = 0;
  const waits = [];
  await assert.rejects(
    downloadModelFile(model, temporary, {
      fetchResponse: async () => {
        attempts += 1;
        throw new Error('연결 실패');
      },
      wait: async (milliseconds) => waits.push(milliseconds),
    }),
    /연결 실패/
  );
  assert.equal(attempts, 3);
  assert.deepEqual(waits, [1000, 2000]);
  await assert.rejects(access(temporary), { code: 'ENOENT' });
});

test('404 응답은 재시도하지 않는다', async (context) => {
  const temporary = await createTemporaryFile(context);
  let attempts = 0;
  await assert.rejects(
    downloadModelFile(model, temporary, {
      fetchResponse: async () => {
        attempts += 1;
        return new Response('missing', { status: 404 });
      },
      wait: async () => assert.fail('404 응답은 대기하지 않아야 합니다.'),
    }),
    /HTTP 404/
  );
  assert.equal(attempts, 1);
});
