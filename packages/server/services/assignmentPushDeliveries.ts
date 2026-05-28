import { PushSubscription } from '../prisma/generated/client';
import { claimPushDelivery, completePushDelivery } from './pushDeliveries';
import type { PushPayload } from './webPush';
import { sendAssignmentPush } from './webPush';

interface AssignmentPushDeliveryInput {
  subscription: PushSubscription;
  competitionId: string;
  wcaUserId: number;
  dedupeKey: string;
  payload: PushPayload;
}

export const deliverAssignmentPush = async ({
  subscription,
  competitionId,
  wcaUserId,
  dedupeKey,
  payload,
}: AssignmentPushDeliveryInput) => {
  const deliveryClaim = await claimPushDelivery({
    pushSubscriptionId: subscription.id,
    competitionId,
    wcaUserId,
    dedupeKey,
  });

  if (deliveryClaim.status === 'already-sent') {
    return true;
  }

  if (deliveryClaim.status === 'in-flight') {
    return false;
  }

  const result = await sendAssignmentPush(subscription, payload);
  await completePushDelivery(deliveryClaim.deliveryId, result);

  return result.success;
};
