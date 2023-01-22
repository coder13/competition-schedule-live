import { useCallback, useEffect, useRef, useState } from 'react';

interface APIStatus {
  lastPinged?: Date;
  statusCode?: number;
  message?: string;
}

function APISection({ name, url }: { name: string; url: string }) {
  const interval = useRef(5000);
  const [apiStatus, setApiStatus] = useState<APIStatus>({});

  const pingApi = useCallback(async () => {
    const res = await fetch(new URL('/ping', url));

    setApiStatus({
      statusCode: res.status,
      message: res.statusText,
      lastPinged: new Date(),
    });

    const text = await res.text();
    if (!res.ok) {
      throw new Error(text);
    }
  }, []);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    async function retry() {
      try {
        await pingApi();
        console.log(
          url,
          interval.current,
          'doubling ping',
          interval.current * 2
        );
        interval.current = Math.min(interval.current * 2, 1000 * 60 * 15);
      } catch (e) {
        interval.current = 5000;
        setApiStatus({
          message: (e as Error).message,
          lastPinged: new Date(),
        });
      }
      setTimeout(retry, interval.current);
    }

    retry();

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, []);

  return (
    <div className="p-2">
      <b>{name}</b>
      <span>
        {' '}
        (<b>{url}</b>)
      </span>
      <br />
      <span>
        status: <b>{apiStatus.message}</b> as of{' '}
        <b>{apiStatus.lastPinged?.toLocaleString()}</b>
        <br />
        pinging again in <b>{interval.current / 1000}</b> seconds
      </span>
    </div>
  );
}

function Footer() {
  console.log({
    apiOrigin: import.meta.env.VITE_API_ORIGIN,
    notifApiOrigin: import.meta.env.VITE_NOTIFAPI_ORIGIN,
  });
  return (
    <footer className="flex p-2 justify-evenly shadow-inner ">
      <APISection url={import.meta.env.VITE_API_ORIGIN} name="core-api" />
      <br />
      <APISection url={import.meta.env.VITE_NOTIFAPI_ORIGIN} name="notifapi" />
    </footer>
  );
}

export default Footer;
