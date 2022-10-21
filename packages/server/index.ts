import express from 'express';
import dotenv from 'dotenv';
dotenv.config({
  debug: true,
});

const port = process.env.PORT;

const app = express();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log('Server is running on port', port);
});
