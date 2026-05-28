import { AppHttpServer, init } from './server';

const port = process.env.PORT ? +process.env.PORT : 8080;
const host = process.env.HOST ?? '0.0.0.0';

const maskDatabaseUrl = (value: string | undefined) => {
  if (!value) {
    return 'not configured';
  }

  try {
    const url = new URL(value);
    if (url.password) {
      url.password = '***';
    }
    return url.toString();
  } catch {
    return 'configured';
  }
};

console.log(
  'Connecting to database at ',
  maskDatabaseUrl(process.env.DATABASE_URL)
);

let server: AppHttpServer | undefined;
let shutdownStarted = false;

const shutdown = (signal: string) => {
  if (shutdownStarted) {
    return;
  }

  shutdownStarted = true;
  console.log(`Received ${signal}, shutting down`);

  if (!server) {
    process.exit(0);
  }

  void server
    .shutdown()
    .then(() => {
      process.exit(0);
    })
    .catch((e) => {
      console.error('Graceful shutdown failed', e);
      process.exit(1);
    });
};

process.once('SIGTERM', () => shutdown('SIGTERM'));
process.once('SIGINT', () => shutdown('SIGINT'));

init()
  .then((app) => {
    server = app;
    app.listen(port, host, () => {
      console.log('Server is running on port', port);
    });
  })
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  });
