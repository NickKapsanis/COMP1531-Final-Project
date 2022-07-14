import express from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';
import { dmCreateV1, dmListV1, dmRemoveV1 } from './dm';

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

app.post('/dm/create/v1', (req, res) => {
  const token = req.body.token;
  const uIds = req.body.uIds;
  res.json(dmCreateV1(token, uIds));
});

app.get('/dm/list/v1', (req, res) => {
  const token = String(req.query.token);
  res.json(dmListV1(token));
});

app.delete('/dm/remove/v1', (req, res) => {
  const token = String(req.query.token);
  const dmId = Number(req.query.dmId);
  res.json(dmRemoveV1(token, dmId));
});

// for logging errors
app.use(morgan('dev'));

// start server
app.listen(PORT, HOST, () => {
  console.log(`⚡️ Server listening on port ${PORT} at ${HOST}`);
});
