import express from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';
import { dmDetailsV1, dmLeaveV1, dmMessagesV1 } from './dm';
import { dmCreateV1, dmListV1, dmRemoveV1 } from './dm';
import { authRegisterV1, authLoginV1, authLogoutV1 } from './auth';
import { clearV1 } from './other';
import cors from 'cors';

// Set up web app, use JSON
const app = express();
app.use(express.json());
// Use middleware that allows for access from other domains
app.use(cors());

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
// request dm messages V1
app.get('/dm/messages/v1', (req, res) => {
  const token = req.query.token as string;
  const dmId = parseInt(req.query.dmId as string);
  const start = parseInt(req.query.start as string);
  res.json(dmMessagesV1(token, dmId, start));
});

// dmCreate
app.post('/dm/create/v1', (req, res) => {
  const token = req.body.token;
  const uIds = req.body.uIds;
  res.json(dmCreateV1(token, uIds));
});
// dmList
app.get('/dm/list/v1', (req, res) => {
  const token = String(req.query.token);
  res.json(dmListV1(token));
});
// dmRemove
app.delete('/dm/remove/v1', (req, res) => {
  const token = String(req.query.token);
  const dmId = Number(req.query.dmId);
  res.json(dmRemoveV1(token, dmId));
});
// authRegister
app.post('/auth/register/v2', (req, res) => {
  const data = req.body;
  res.json(authRegisterV1(data.email, data.password, data.nameFirst, data.nameLast));
});
// authLogin
app.post('/auth/login/v2', (req, res) => {
  const data = req.body;
  res.json(authLoginV1(data.email, data.password));
});
// authLogout
app.post('/auth/logout/v1', (req, res) => {
  const data = req.body;
  res.json(authLogoutV1(data.token));
});
// clearV1()
app.delete('/clear/v1', (req, res) => {
  res.json(clearV1());
});

// for logging errors
app.use(morgan('dev'));

// start server
app.listen(PORT, HOST, () => {
  console.log(`⚡️ Server listening on port ${PORT} at ${HOST}`);
});
