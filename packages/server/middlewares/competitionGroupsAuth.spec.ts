/* eslint-disable import/first */
const verifyCompetitionGroupsToken = jest.fn();

jest.mock('../lib/competitionGroupsToken', () => ({
  verifyCompetitionGroupsToken,
}));

import { competitionGroupsAuth } from './competitionGroupsAuth';

const createResponse = () => {
  const response = {
    status: jest.fn(),
    json: jest.fn(),
  };
  response.status.mockReturnValue(response);
  return response;
};

const callCompetitionGroupsAuth = competitionGroupsAuth as unknown as (
  req: { headers: { authorization?: string }; competitionGroups?: unknown },
  res: ReturnType<typeof createResponse>,
  next: jest.Mock
) => void;

describe('competitionGroupsAuth', () => {
  beforeEach(() => {
    verifyCompetitionGroupsToken.mockReset();
  });

  it('rejects requests without a bearer token', () => {
    const response = createResponse();
    const next = jest.fn();

    callCompetitionGroupsAuth({ headers: {} }, response, next);

    expect(response.status).toHaveBeenCalledWith(401);
    expect(response.json).toHaveBeenCalledWith({
      success: false,
      message: 'Missing bearer token',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('stores verified claims and continues', () => {
    const claims = { sub: 'remote-user', wcaUserIds: [123] };
    const request = { headers: { authorization: 'Bearer valid-token' } };
    const response = createResponse();
    const next = jest.fn();
    verifyCompetitionGroupsToken.mockReturnValue(claims);

    callCompetitionGroupsAuth(request, response, next);

    expect(verifyCompetitionGroupsToken).toHaveBeenCalledWith('valid-token');
    expect(request).toMatchObject({ competitionGroups: claims });
    expect(next).toHaveBeenCalledWith();
    expect(response.status).not.toHaveBeenCalled();
  });

  it('returns verification errors as unauthorized responses', () => {
    const response = createResponse();
    const next = jest.fn();
    verifyCompetitionGroupsToken.mockImplementation(() => {
      throw new Error('Invalid token audience');
    });

    callCompetitionGroupsAuth(
      { headers: { authorization: 'Bearer invalid-token' } },
      response,
      next
    );

    expect(response.status).toHaveBeenCalledWith(401);
    expect(response.json).toHaveBeenCalledWith({
      success: false,
      message: 'Invalid token audience',
    });
    expect(next).not.toHaveBeenCalled();
  });
});
