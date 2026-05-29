/* eslint-disable import/first */
const jwtVerify = jest.fn();
const jwtDecode = jest.fn();
const verifyCompetitionGroupsToken = jest.fn();

jest.mock('jsonwebtoken', () => ({
  __esModule: true,
  default: {
    verify: jwtVerify,
    decode: jwtDecode,
  },
}));

jest.mock('../lib/competitionGroupsToken', () => ({
  verifyCompetitionGroupsToken,
}));

import {
  authMiddlewareDecode,
  authMiddlewareVerify,
  authMiddlewareVerifyIgnoringExpiration,
} from './AuthMiddleware';

const createRequest = (authorization?: string) => ({
  headers: {
    ...(authorization && { authorization }),
  },
});

const callAuthMiddlewareVerify = authMiddlewareVerify as unknown as (
  req: ReturnType<typeof createRequest>,
  res: unknown,
  next: jest.Mock
) => void;

const callAuthMiddlewareDecode = authMiddlewareDecode as unknown as (
  req: ReturnType<typeof createRequest>,
  res: unknown,
  next: jest.Mock
) => void;

const callAuthMiddlewareVerifyIgnoringExpiration =
  authMiddlewareVerifyIgnoringExpiration as unknown as (
    req: ReturnType<typeof createRequest>,
    res: unknown,
    next: jest.Mock
  ) => void;

describe('AuthMiddleware', () => {
  const originalPublicKey = process.env.PUBLIC_KEY;

  beforeEach(() => {
    process.env.PUBLIC_KEY = 'test-public-key';
    jwtVerify.mockReset();
    jwtDecode.mockReset();
    verifyCompetitionGroupsToken.mockReset();
  });

  afterAll(() => {
    process.env.PUBLIC_KEY = originalPublicKey;
  });

  it('continues without a user when no authorization header is present', () => {
    const request = createRequest();
    const next = jest.fn();

    callAuthMiddlewareVerify(request, {}, next);

    expect(next).toHaveBeenCalledWith();
    expect(jwtVerify).not.toHaveBeenCalled();
  });

  it('continues without verifying non-Bearer authorization headers', () => {
    const request = createRequest('Basic credentials');
    const next = jest.fn();

    callAuthMiddlewareVerify(request, {}, next);

    expect(next).toHaveBeenCalledWith(null);
    expect(jwtVerify).not.toHaveBeenCalled();
    expect(verifyCompetitionGroupsToken).not.toHaveBeenCalled();
  });

  it('verifies normal bearer JWT users', () => {
    const user = { id: 123, name: 'Test User' };
    const request = createRequest('Bearer jwt-token');
    const next = jest.fn();
    jwtVerify.mockReturnValue(user);

    callAuthMiddlewareVerify(request, {}, next);

    expect(jwtVerify).toHaveBeenCalledWith('jwt-token', expect.anything());
    expect(request).toMatchObject({ user });
    expect(next).toHaveBeenCalledWith(null);
  });

  it('can verify expired app JWTs for refresh without checking expiration', () => {
    const user = { id: 123, name: 'Expired User' };
    const request = createRequest('Bearer expired-jwt-token');
    const next = jest.fn();
    jwtVerify.mockReturnValue(user);

    callAuthMiddlewareVerifyIgnoringExpiration(request, {}, next);

    expect(jwtVerify).toHaveBeenCalledWith(
      'expired-jwt-token',
      expect.anything(),
      {
        ignoreExpiration: true,
      }
    );
    expect(request).toMatchObject({ user });
    expect(next).toHaveBeenCalledWith(null);
  });

  it('does not fall back to Competition Groups tokens for refresh JWT verification', () => {
    const request = createRequest('Bearer competition-groups-token');
    const next = jest.fn();
    const jwtError = new Error('invalid jwt');
    jwtVerify.mockImplementation(() => {
      throw jwtError;
    });

    callAuthMiddlewareVerifyIgnoringExpiration(request, {}, next);

    expect(verifyCompetitionGroupsToken).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(jwtError);
  });

  it('falls back to Competition Groups tokens for remote-control users', () => {
    const request = createRequest('Bearer competition-groups-token');
    const next = jest.fn();
    const claims = {
      sub: 'remote-user',
      name: 'Remote User',
      scope: 'notifycomp.remote',
      competitionIds: ['TestComp2026'],
      wcaUserIds: [456],
      iat: 10,
      exp: 20,
    };
    jwtVerify.mockImplementation(() => {
      throw new Error('invalid jwt');
    });
    verifyCompetitionGroupsToken.mockReturnValue(claims);

    callAuthMiddlewareVerify(request, {}, next);

    expect(request).toMatchObject({
      competitionGroups: claims,
      user: {
        type: 2,
        id: 456,
        name: 'Remote User',
        competitionGroups: {
          competitionIds: ['TestComp2026'],
          scopes: ['notifycomp.remote'],
        },
        iat: 10,
        exp: 20,
      },
    });
    expect(next).toHaveBeenCalledWith(null);
  });

  it('uses explicit Competition Groups WCA user IDs and scopes arrays', () => {
    const request = createRequest('Bearer competition-groups-token');
    const next = jest.fn();
    const claims = {
      sub: 'remote-user',
      scopes: ['notifycomp.remote'],
      wcaUserId: 789,
      wcaUserIds: [456],
    };
    jwtVerify.mockImplementation(() => {
      throw new Error('invalid jwt');
    });
    verifyCompetitionGroupsToken.mockReturnValue(claims);

    callAuthMiddlewareVerify(request, {}, next);

    expect(request).toMatchObject({
      user: {
        id: 789,
        name: 'remote-user',
        competitionGroups: {
          scopes: ['notifycomp.remote'],
        },
      },
    });
    expect(next).toHaveBeenCalledWith(null);
  });

  it('passes the JWT verification error when Competition Groups claims lack remote scope', () => {
    const request = createRequest('Bearer competition-groups-token');
    const next = jest.fn();
    const jwtError = new Error('invalid jwt');
    jwtVerify.mockImplementation(() => {
      throw jwtError;
    });
    verifyCompetitionGroupsToken.mockReturnValue({
      sub: 'remote-user',
      scopes: [],
      wcaUserIds: [456],
    });

    callAuthMiddlewareVerify(request, {}, next);

    expect(next).toHaveBeenCalledWith(jwtError);
  });

  it('passes the original JWT verification error when fallback verification fails', () => {
    const request = createRequest('Bearer invalid-token');
    const next = jest.fn();
    const jwtError = new Error('invalid jwt');
    jwtVerify.mockImplementation(() => {
      throw jwtError;
    });
    verifyCompetitionGroupsToken.mockImplementation(() => {
      throw new Error('invalid competition groups token');
    });

    callAuthMiddlewareVerify(request, {}, next);

    expect(next).toHaveBeenCalledWith(jwtError);
  });

  it('decodes bearer tokens without verifying them', () => {
    const user = { id: 123, name: 'Decoded User' };
    const request = createRequest('Bearer jwt-token');
    const next = jest.fn();
    jwtDecode.mockReturnValue(user);

    callAuthMiddlewareDecode(request, {}, next);

    expect(jwtDecode).toHaveBeenCalledWith('jwt-token');
    expect(request).toMatchObject({ user });
    expect(next).toHaveBeenCalledWith();
  });

  it('continues without decoding when no authorization header is present', () => {
    const request = createRequest();
    const next = jest.fn();

    callAuthMiddlewareDecode(request, {}, next);

    expect(jwtDecode).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith();
  });
});
