import { init } from './server';

const port = process.env.PORT ? +process.env.PORT : 8080;

init()
  .then((app) =>
    app.listen(port, () => {
      console.log('Server is running on port', port);
    })
  )
  .catch((e) => console.error(e));
