import { BRIDGE_MESSAGE_KIND } from '@chapchap/shared/bridge';

import { createBridgeResponse } from './createBridgeResponse';

import type { BridgeRequest } from '@chapchap/shared/bridge';

const createRequest = (overrides: Partial<BridgeRequest> = {}): BridgeRequest =>
  ({
    kind: BRIDGE_MESSAGE_KIND.REQUEST,
    id: 'request-01',
    type: 'ping',
    payload: { sentAt: 0 },
    ...overrides,
  }) as BridgeRequest;

describe('createBridgeResponse', () => {
  it('요청을 처리하고 같은 식별자로 응답한다', async () => {
    const response = await createBridgeResponse(createRequest());

    expect(response.id).toBe('request-01');
    expect(response.type).toBe('ping');
    expect(response.ok).toBe(true);
  });

  it('처리할 수 없는 요청이면 실패로 응답한다', async () => {
    const response = await createBridgeResponse(
      createRequest({ type: 'unknown' as BridgeRequest['type'] })
    );

    expect(response.ok).toBe(false);
    expect(response).toHaveProperty('error.message', expect.stringContaining('처리할 수 없는'));
  });
});
