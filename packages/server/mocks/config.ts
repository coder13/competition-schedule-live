export const MOCK_COMPETITION_ID = 'MockAutoAdvance2026';
export const MOCK_USER_ID = 8184;

export const isMocksMode = () =>
  process.env.MOCKS_MODE === 'true' || process.env.NODE_ENV === 'mocks';

export const getMockUser = (): Omit<User, 'iat' | 'exp'> => ({
  type: 1,
  id: MOCK_USER_ID,
  name: 'Mock Delegate',
  wcaId: '2026MOCK01',
  countryId: 'US',
  avatar: {
    url: '',
  },
  wca: {
    accessToken: 'mock-wca-access-token',
    expiration: Date.now() + 24 * 60 * 60 * 1000,
    refreshToken: 'mock-wca-refresh-token',
    code: 'mock-wca-code',
  },
});
