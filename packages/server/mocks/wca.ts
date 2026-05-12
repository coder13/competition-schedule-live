import type { Activity, Competition } from '@wca/helpers';
import { MOCK_COMPETITION_ID, MOCK_USER_ID } from './config';

const mockServerStartTime = new Date();

const addMinutes = (minutes: number) =>
  new Date(mockServerStartTime.getTime() + minutes * 60 * 1000).toISOString();

const activity = (
  id: number,
  name: string,
  activityCode: string,
  startOffsetMinutes: number
): Activity => ({
  id,
  name,
  activityCode,
  startTime: addMinutes(startOffsetMinutes),
  endTime: addMinutes(startOffsetMinutes + 10),
  childActivities: [],
  extensions: [],
});

export const getMockCompetition = (): Competition => ({
  formatVersion: '1.0',
  id: MOCK_COMPETITION_ID,
  name: 'Mock Auto Advance 2026',
  shortName: 'Mock Auto Advance',
  persons: [
    {
      name: 'Mock Delegate',
      wcaUserId: MOCK_USER_ID,
      wcaId: '2026MOCK01',
      registrantId: 1,
      countryIso2: 'US',
      gender: 'o',
      roles: ['delegate', 'organizer'],
      assignments: [],
      registration: null,
      avatar: null,
      extensions: [],
    },
  ],
  events: [
    {
      id: '333',
      rounds: [],
      extensions: [],
    },
  ],
  schedule: {
    startDate: addMinutes(5).split('T')[0],
    numberOfDays: 1,
    venues: [
      {
        id: 1,
        name: 'Mock Venue',
        latitudeMicrodegrees: 0,
        longitudeMicrodegrees: 0,
        countryIso2: 'US',
        timezone: 'America/Los_Angeles',
        rooms: [
          {
            id: 1,
            name: 'Main Room',
            color: '#1976d2',
            activities: [
              activity(1, 'Check-in', 'other-checkin', 5),
              activity(2, '3x3x3 Round 1 Group 1', '333-r1-g1', 15),
              activity(3, '3x3x3 Round 1 Group 2', '333-r1-g2', 25),
              activity(4, '2x2x2 Round 1 Group 1', '222-r1-g1', 35),
            ],
            extensions: [],
          },
        ],
        extensions: [],
      },
    ],
  },
  series: [],
  competitorLimit: null,
  extensions: [],
  registrationInfo: {
    openTime: addMinutes(-60),
    closeTime: addMinutes(-30),
    baseEntryFee: 0,
    currencyCode: 'USD',
    onTheSpotRegistration: false,
    useWcaRegistration: false,
  },
});

export const getMockCompetitionSearchResult = () => {
  const competition = getMockCompetition();

  return [
    {
      id: competition.id,
      name: competition.name,
      city: 'Mock City',
      country_iso2: 'US',
      start_date: competition.schedule.startDate,
      end_date: competition.schedule.startDate,
    },
  ];
};
