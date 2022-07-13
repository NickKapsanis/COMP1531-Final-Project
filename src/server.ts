import express from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';
import { dmDetailsV1, dmLeaveV1 } from './dm';

// Set up web app, use JSON
const app = express();
app.use(express.json());

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || 'localhost';

export { PORT, HOST };

// Example get request
app.get('/echo', (req, res, next) => {
  try {
    const data = req.query.echo as string;
    return res.json(echo(data));
  } catch (err) {
    next(err);
  }
});
// request dm details V1
app.get('/dm/details/v1', (req, res) => {
  const token = req.query.token as string;
  const dmId = parseInt(req.query.dmId as string);
  res.json(dmDetailsV1(token, dmId));
});
// request dm leave V1
app.post('/dm/leave/v1', (req, res) => {
  const data = req.body;
  res.json(dmLeaveV1(data.token, data.dmId));
});

// for logging errors
app.use(morgan('dev'));

// start server
app.listen(PORT, HOST, () => {
  console.log(`⚡️ Server listening on port ${PORT} at ${HOST}`);
});
