/* eslint-disable import/first */
const pushDeliveryFindFirst = jest.fn();
const pushDeliveryCreate = jest.fn();
const pushDeliveryUpdateMany = jest.fn();
const pushDeliveryUpdate = jest.fn();

jest.mock('../db', () => ({
  __esModule: true,
  default: {
    pushDelivery: {
      findFirst: pushDeliveryFindFirst,
      create: pushDeliveryCreate,
      updateMany: pushDeliveryUpdateMany,
      update: pushDeliveryUpdate,
    },
  },
}));

import { claimPushDelivery, completePushDelivery } from './pushDeliveries';

const claimInput = {
  pushSubscriptionId: 10,
  competitionId: 'TestComp2026',
  wcaUserId: 123,
  dedupeKey: 'assignment-change:TestComp2026:123:hash',
};

describe('push delivery claims', () => {
  beforeEach(() => {
    pushDeliveryFindFirst.mockReset().mockResolvedValue(null);
    pushDeliveryCreate.mockReset().mockResolvedValue({ id: 20 });
    pushDeliveryUpdateMany.mockReset().mockResolvedValue({ count: 1 });
    pushDeliveryUpdate.mockReset().mockResolvedValue({ id: 20 });
    jest.spyOn(Date, 'now').mockReturnValue(1000000);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('creates and claims a new delivery', async () => {
    await expect(claimPushDelivery(claimInput)).resolves.toEqual({
      status: 'claimed',
      deliveryId: 20,
    });

    expect(pushDeliveryCreate).toHaveBeenCalledWith({
      data: {
        pushSubscriptionId: 10,
        competitionId: 'TestComp2026',
        wcaUserId: 123,
        dedupeKey: 'assignment-change:TestComp2026:123:hash',
        status: 'pending',
      },
    });
  });

  it('does not claim deliveries that were already sent', async () => {
    pushDeliveryFindFirst.mockResolvedValue({ id: 20, status: 'sent' });

    await expect(claimPushDelivery(claimInput)).resolves.toEqual({
      status: 'already-sent',
    });

    expect(pushDeliveryCreate).not.toHaveBeenCalled();
    expect(pushDeliveryUpdateMany).not.toHaveBeenCalled();
  });

  it('leaves fresh pending deliveries in flight', async () => {
    pushDeliveryFindFirst.mockResolvedValue({
      id: 20,
      status: 'pending',
      updatedAt: new Date(999000),
    });
    pushDeliveryUpdateMany.mockResolvedValue({ count: 0 });

    await expect(claimPushDelivery(claimInput)).resolves.toEqual({
      status: 'in-flight',
    });
  });

  it('claims stale pending deliveries for retry', async () => {
    pushDeliveryFindFirst.mockResolvedValue({
      id: 20,
      status: 'pending',
      updatedAt: new Date(1),
    });

    await expect(claimPushDelivery(claimInput)).resolves.toEqual({
      status: 'claimed',
      deliveryId: 20,
    });

    expect(pushDeliveryUpdateMany).toHaveBeenCalledWith({
      where: expect.objectContaining({
        id: 20,
      }),
      data: {
        status: 'pending',
        error: expect.anything(),
      },
    });
  });

  it('records successful delivery completion', async () => {
    await completePushDelivery(20, { success: true, error: null });

    expect(pushDeliveryUpdate).toHaveBeenCalledWith({
      where: {
        id: 20,
      },
      data: {
        status: 'sent',
        error: expect.anything(),
      },
    });
  });
});
