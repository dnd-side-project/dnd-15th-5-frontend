import { StartClient } from '@/features/auth/apis/dto';

import { getAuthClient } from './authClient';
import { saveCodeVerifier } from './oauthSession';
import { createCodeChallenge, createCodeVerifier } from './pkce';
import { prepareOAuthLogin } from './prepareOAuthLogin';

jest.mock('./authClient', () => ({ getAuthClient: jest.fn() }));
jest.mock('./oauthSession', () => ({ saveCodeVerifier: jest.fn() }));
jest.mock('./pkce', () => ({
  createCodeChallenge: jest.fn(),
  createCodeVerifier: jest.fn(),
}));

const mockGetAuthClient = jest.mocked(getAuthClient);
const mockSaveCodeVerifier = jest.mocked(saveCodeVerifier);
const mockCreateCodeChallenge = jest.mocked(createCodeChallenge);
const mockCreateCodeVerifier = jest.mocked(createCodeVerifier);

describe('prepareOAuthLogin', () => {
  it('verifier를 저장하고 로그인 시작 파라미터를 반환한다', async () => {
    mockCreateCodeVerifier.mockReturnValue('code-verifier');
    mockCreateCodeChallenge.mockResolvedValue('code-challenge');
    mockGetAuthClient.mockReturnValue(StartClient.APP);

    await expect(prepareOAuthLogin()).resolves.toEqual({
      client: StartClient.APP,
      codeChallenge: 'code-challenge',
    });
    expect(mockCreateCodeChallenge).toHaveBeenCalledWith('code-verifier');
    expect(mockSaveCodeVerifier).toHaveBeenCalledWith('code-verifier');
  });
});
