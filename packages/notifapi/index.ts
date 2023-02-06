import logger from './lib/logger';
import { init } from './server';

const port = process.env.PORT ? +process.env.PORT : 8090;
const host = process.env.HOST;

init()
  .then((app) => {
    if (host) {
      app.listen(port, host, () => {
        logger.info(`Server is running on ${host}:${port}`);
      });
    } else {
      app.listen(port, () => {
        logger.info(`Server is running on port ${port}`);
      });
    }
  })
  .catch((e) => logger.error(e));
