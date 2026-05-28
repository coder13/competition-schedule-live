import { createHash } from 'crypto';
import type { Schedule } from '@wca/helpers';

export interface WcifPersonAssignment {
  activityId?: number;
  assignmentCode?: string;
  stationNumber?: number | null;
}

export interface WcifPerson {
  wcaUserId?: number | null;
  assignments?: WcifPersonAssignment[];
}

export interface WcifPayload {
  id: string;
  name?: string | null;
  persons: WcifPerson[];
  schedule?: Schedule | null;
}

const sortObject = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(sortObject);
  }

  if (value && typeof value === 'object') {
    return Object.keys(value)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = sortObject((value as Record<string, unknown>)[key]);
        return acc;
      }, {});
  }

  return value;
};

export const hashAssignments = (assignments: WcifPersonAssignment[] = []) =>
  createHash('sha256')
    .update(JSON.stringify(sortObject(assignments)))
    .digest('hex');

export const createAssignmentSnapshot = (
  wcif: WcifPayload,
  wcaUserId: number
) => {
  const person = wcif.persons.find((p) => p.wcaUserId === wcaUserId);

  if (!person) {
    return null;
  }

  return {
    competitionId: wcif.id,
    wcaUserId,
    assignmentsHash: hashAssignments(person.assignments),
  };
};
