/* eslint-disable import/first */
import { activityFixture, scheduleFixture } from '../test/helpers';

jest.mock('../db', () => ({
  __esModule: true,
  default: {
    competition: {
      findFirst: jest.fn(),
    },
  },
}));

import { getFlatActivities } from './utils';

describe('scheduler utils', () => {
  it('flattens child activities when rounds contain groups', () => {
    const childA = activityFixture(2, '333-r1-a');
    const childB = activityFixture(3, '333-r1-b');
    const parent = {
      ...activityFixture(1, '333-r1'),
      childActivities: [childA, childB],
    };
    const standalone = activityFixture(4, '222-r1');

    expect(getFlatActivities(scheduleFixture([parent, standalone]))).toEqual([
      childA,
      childB,
      standalone,
    ]);
  });
});
