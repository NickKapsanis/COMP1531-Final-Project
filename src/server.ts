import express from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';
import { authRegisterV1, authLoginV1, authLogoutV1 } from './auth';
import { channelJoinV2, channelInviteV2, addChannelOwnerV1, removeChannelOwnerV1 } from './channel';
import { clearV1 } from './other';
import { usersAllV1, userSetnameV1, userSetemailV1, userSethandlelV1 } from './users';
import { channelsCreateV2 } from './channels';

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
  res.json(channelJoinV2(data.token, data.channelId));
});
// channelInvite
app.post('/channel/invite/v2', (req, res) => {
  const data = req.body;
  res.json(channelInviteV2(data.token, data.channelId, data.uId));
});
// addChannelOwner
app.post('/channel/addowner/v1', (req, res) => {
  const data = req.body;
  res.json(addChannelOwnerV1(data.token, data.channelId, data.uId));
});
// removeChannelOwner
app.post('/channel/removeowner/v1', (req, res) => {
  const data = req.body;
  res.json(removeChannelOwnerV1(data.token, data.channelId, data.uId));
});
// clear
app.delete('/clear/v1', (req, res) => {
  res.json(clearV1());
});
// usersAll
app.get('/users/all/v1', (req, res) => {
  const token = req.query.token;
  if (typeof token !== 'string') {
    res.status(500).json({ error: 'Invalid dataset' });
    return;
  }
  res.send(JSON.stringify(usersAllV1(token)));
});
app.post('/channels/create/v2', (req, res) => {
  const data = req.body;
  res.json(channelsCreateV2(data.token, data.name, data.isPublic));
})

//userSetnameV1
app.put('/user/profile/setname/v1', (req, res) => {
  const { token, nameFirst, nameLast } = req.body;
  res.json(userSetnameV1(token, nameFirst, nameLast));
});

//userSetemailV1
app.put('/user/profile/setemail/v1', (req, res) => {
  const { token, email } = req.body;
  res.json(userSetemailV1(token, email));
});

//userSethandlelV1
app.put('/user/profile/sethandle/v1', (req, res) => {
  const { token, handleStr } = req.body;
  res.json(userSethandlelV1(token, handleStr));
});










// for logging errors
app.use(morgan('dev'));

// start server
app.listen(PORT, HOST, () => {
  console.log(`⚡️ Server listening on port ${PORT} at ${HOST}`);
});
