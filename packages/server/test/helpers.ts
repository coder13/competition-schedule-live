import type { Activity, Competition, Schedule } from '@wca/helpers';

export const fixedDate = (value: string) => new Date(value);

export const iso = (value: string) => fixedDate(value).toISOString();

export const activityFixture = (
  id: number,
  name = `activity-${id}`,
  startTime = '2026-01-01T10:00:00Z',
  endTime = '2026-01-01T10:30:00Z'
): Activity => ({
  id,
  name,
  activityCode: name,
  startTime: iso(startTime),
  endTime: iso(endTime),
  childActivities: [],
  extensions: [],
});

export const scheduleFixture = (activities: Activity[]): Schedule =>
  ({
    startDate: '2026-01-01',
    numberOfDays: 1,
    venues: [
      {
        id: 1,
        name: 'Main venue',
        latitudeMicrodegrees: 0,
        longitudeMicrodegrees: 0,
        countryIso2: 'US',
        timezone: 'UTC',
        rooms: [
          {
            id: 1,
            name: 'Main room',
            color: '#ffffff',
            activities,
            extensions: [],
          },
        ],
        extensions: [],
      },
    ],
  });

export const competitionFixture = (
  props: Partial<Competition> = {}
): Competition =>
  ({
    formatVersion: '1.0',
    id: 'TestComp2026',
    name: 'Test Competition 2026',
    shortName: 'Test 2026',
    persons: [],
    events: [],
    schedule: scheduleFixture([]),
    series: [],
    competitorLimit: null,
    extensions: [],
    registrationInfo: {
      openTime: '2025-01-01T00:00:00Z',
      closeTime: '2025-12-01T00:00:00Z',
      baseEntryFee: 0,
      currencyCode: 'USD',
      onTheSpotRegistration: false,
      useWcaRegistration: false,
    },
    ...props,
  });

export const userFixture = (props: Partial<User> = {}): User => {
  const user: User = {
    type: 2,
    id: 123,
    name: 'Test User',
    wcaId: '2026TEST01',
    countryId: 'US',
    avatar: {
      url: '',
    },
    wca: {
      accessToken: '',
      expiration: 0,
      refreshToken: '',
      code: '',
    },
    iat: 0,
    exp: 0,
    ...props,
  };

  return user;
};

export const mockPubsub = () => ({
  publish: jest.fn().mockResolvedValue(undefined),
  asyncIterator: jest.fn(),
});
