const NOTIFAPI_ORIGIN = import.meta.env.VITE_NOTIFAPI_ORIGIN;

export const notifApiFetch = (url: string | URL, options: RequestInit) =>
  fetch(new URL(url, NOTIFAPI_ORIGIN), {
    method: 'POST',
    mode: 'cors',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': window.location.origin,
      ...options.headers,
    },
    ...options,
  });
