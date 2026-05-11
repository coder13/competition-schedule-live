import fetch from 'node-fetch';
import { WcifPayload } from '../lib/assignmentSnapshots';

export const fetchWcif = async (competitionId: string): Promise<WcifPayload> => {
  const origin = process.env.WCA_ORIGIN ?? 'https://www.worldcubeassociation.org';
  const headers: Record<string, string> = {};

  if (process.env.WCA_OAUTH_TOKEN) {
    headers.Authorization = `Bearer ${process.env.WCA_OAUTH_TOKEN}`;
  }

  const response = await fetch(
    `${origin}/api/v0/competitions/${competitionId}/wcif`,
    { headers }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch WCIF for ${competitionId}: ${response.status} ${response.statusText}`
    );
  }

  return (await response.json()) as WcifPayload;
};
