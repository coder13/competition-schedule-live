const NOTIFAPI_ORIGIN = import.meta.env.VITE_NOTIFAPI_ORIGIN;

export const notifApiFetch = async (
  url: string | URL,
  options = {} as RequestInit
) => {
  console.log(options.method || 'GET', url, options);
  const res = await fetch(`${NOTIFAPI_ORIGIN}${url}`, {
    mode: 'cors',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message);
  }

  return await res.json();
};

export const getCompetitionSubscriptions = (competitionId: string) =>
  notifApiFetch(`/v0/internal/subscriptions/competitions/${competitionId}`);

export const addCompetitionSubscriptions = (
  competitionId: string,
  subscriptions: [
    {
      type: string;
      value: string;
    }
  ]
) =>
  notifApiFetch(`/v0/internal/subscriptions/competitions/${competitionId}`, {
    method: 'POST',
    body: JSON.stringify(subscriptions),
  });

export const updateCompetitionSubscriptions = (
  competitionId: string,
  subscriptions: Subscription[]
) =>
  notifApiFetch(`/v0/internal/subscriptions/competitions/${competitionId}`, {
    method: 'PUT',
    body: JSON.stringify(subscriptions),
  });
