import express from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';
import { authRegisterV1, authLoginV1, authLogoutV1 } from './auth';
import { channelJoinV2, channelInviteV2, addChannelOwnerV1, removeChannelOwnerV1 } from './channel';
import { clearV1 } from './other';

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
// channelJoin
app.post('/channel/join/v2', (req, res) => {
  const data = req.body;
  res.json(channelJoinV2(data.token, data.channelId))
})
// channelInvite
app.post('/channel/invite/v2', (req, res) => {
  const data = req.body;
  res.json(channelInviteV2(data.token, data.channelId, data.uId))
})
// addChannelOwner
app.post('/channel/addowner/v1', (req, res) => {
  const data = req.body;
  res.json(addChannelOwnerV1(data.token, data.channelId, data.uId))
})
// removeChannelOwner
app.post('/channel/removeowner/v1', (req, res) => {
  const data = req.body;
  res.json(removeChannelOwnerV1(data.token, data.channelId, data.uId))
})
// clear
app.delete('/clear/v1', (req, res) => {
  res.json(clearV1());
});

// for logging errors
app.use(morgan('dev'));

// start server
app.listen(PORT, HOST, () => {
  console.log(`⚡️ Server listening on port ${PORT} at ${HOST}`);
});
