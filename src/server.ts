import express from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';

import { messageRemoveV1 } from './message';

// Set up web app, use JSON
const app = express();
app.use(express.json());

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || 'localhost';

// Example get request
app.get('/echo', (req, res, next) => {
  try {
    const data = req.query.echo as string;
    return res.json(echo(data));
  } catch (err) {
    next(err);
  }
});

// messageRemoveV1
app.delete('/message/remove/v1', (req, res) => {
  const token = String(req.query.token);
  const messageId = Number(req.query.messageId);
  res.json(messageRemoveV1(token, messageId));
});

// for logging errors
app.use(morgan('dev'));

// start server
app.listen(PORT, HOST, () => {
  console.log(`⚡️ Server listening on port ${PORT} at ${HOST}`);
});
