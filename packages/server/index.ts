import { init } from './server';

const port = process.env.PORT ? +process.env.PORT : 8080;
const host = process.env.HOST ?? '0.0.0.0';

console.log('Connecting to database at ', process.env.DATABASE_URL);

init()
  .then((app) =>
    app.listen(port, host, () => {
      console.log('Server is running on port', port);
    })
  )
  .catch((e) => console.error(e));
