import { init } from './server';

const port = process.env.PORT ? +process.env.PORT : 8090;
const host = process.env.HOST;

init()
  .then((app) => {
    if (host) {
      app.listen(port, host, () => {
        console.log('Server is running on port', port, 'host', host);
      });
    } else {
      app.listen(port, () => {
        console.log('Server is running on port', port);
      });
    }
  })
  .catch((e) => console.error(e));
