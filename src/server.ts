import express from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';
import { dmDetailsV1, dmLeaveV1, dmMessagesV1 } from './dm';
import { dmCreateV1, dmListV1, dmRemoveV1 } from './dm';
import { channelsCreateV1, channelsListV2, channelsListallV2 } from './channels';
import { channelJoinV2, channelInviteV2, addChannelOwnerV1, removeChannelOwnerV1, channelsLeaveV1 } from './channel';
import { authRegisterV1, authLoginV1, authLogoutV1 } from './auth';
import cors from 'cors';
import { usersAllV1, userProfileV2 } from './users';
import { clearV1, getUId } from './other';
import { userSetemailV1, userSethandlelV1, userSetnameV1 } from './users';
import { messageSendV2, messageSendDmV1, messageRemoveV1, messageEditV1 } from './message';
import { channelDetailsV2, channelMessagesV2 } from './channel';
import errorHandler from 'middleware-http-errors';

// Set up web app, use JSON
const app = express();
app.use(express.json());

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
app.post('/channels/create/v2', (req, res) => {
  const token = String(req.body.token);
  const name = String(req.body.name);
  const isPublic = Boolean(req.body.isPublic);
  res.json(channelsCreateV1(token, name, isPublic));
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
// channelsListV2
app.get('/channels/list/v2', (req, res) => {
  const data = req.query.token as string;
  res.json(channelsListV2(data));
});

// channelsListallV2
app.get('/channels/listall/v2', (req, res) => {
  const data = req.query.token as string;
  res.json(channelsListallV2(data));
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
// clearV1
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
// userProfile
app.get('/user/profile/v2', (req, res) => {
  const token = String(req.query.token);
  const uId = Number(req.query.uId);
  res.json(userProfileV2(token, uId));
});
app.post('/other/getUId/v1', (req, res) => {
  const data = req.body;
  res.json(getUId(data.authUserId));
});
// channelsListV2
app.get('/channels/list/v2', (req, res) => {
  const data = req.query.token as string;
  res.json(channelsListV2(data));
});
// channelsListallV2
app.get('/channels/listall/v2', (req, res) => {
  const data = req.query.token as string;
  res.json(channelsListallV2(data));
});
app.post('/channels/create/v2', (req, res) => {
  const token = String(req.body.token);
  const name = String(req.body.name);
  const isPublic = Boolean(req.body.isPublic);
  res.json(channelsCreateV1(token, name, isPublic));
});
// userSetnameV1
app.put('/user/profile/setname/v1', (req, res) => {
  const { token, nameFirst, nameLast } = req.body;
  res.json(userSetnameV1(token, nameFirst, nameLast));
  // console.log(userSetnameV1(token, nameFirst, nameLast));
});
// userSetemailV1
app.put('/user/profile/setemail/v1', (req, res) => {
  const { token, email } = req.body;
  res.json(userSetemailV1(token, email));
});
// userSethandlelV1
app.put('/user/profile/sethandle/v1', (req, res) => {
  const { token, handleStr } = req.body;
  res.json(userSethandlelV1(token, handleStr));
});

// channelsListV2
app.get('/channels/list/v2', (req, res) => {
  const data = req.query.token as string;
  res.json(channelsListV2(data));
});

// channelsListallV2
app.get('/channels/listall/v2', (req, res) => {
  const data = req.query.token as string;
  res.json(channelsListallV2(data));
});

// channelDetailsV2
app.get('/channel/details/v2', (req, res) => {
  const token = String(req.query.token);
  const channelId = Number(req.query.channelId);
  res.json(channelDetailsV2(token, channelId));
});

// channelMessagesV2
app.get('/channel/messages/v2', (req, res) => {
  const token = String(req.query.token);
  const channelId = Number(req.query.channelId);
  const start = Number(req.query.start);

  res.json(channelMessagesV2(token, channelId, start));
});

// channelsLeaveV1
app.post('/channel/leave/v1', (req, res) => {
  const data = req.body;
  res.json(channelsLeaveV1(data.token, data.channelId));
});

// messegeSendV1
app.post('/message/send/v2', (req, res) => {
  const token = String(req.header('token'));
  const { channelId, message } = req.body;
  res.json(messageSendV2(token, channelId, message));
});

// messegeSendDmV1
app.post('/message/senddm/v1', (req, res) => {
  const { token, dmId, message } = req.body;
  res.json(messageSendDmV1(token, dmId, message));
});

// messageRemoveV1
app.delete('/message/remove/v1', (req, res) => {
  const token = String(req.query.token);
  const messageId = Number(req.query.messageId);
  res.json(messageRemoveV1(token, messageId));
});

// messageEditV1
app.put('/message/edit/v1', (req, res) => {
  const { token, messageId, message } = req.body;
  res.json(messageEditV1(token, messageId, message));
});

// handles errors nicely
app.use(errorHandler());

// for logging errors
app.use(morgan('dev'));

// start server
const server = app.listen(PORT, HOST, () => {
  console.log(`⚡️ Server listening on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => console.log('Shutting down server gracefully.'));
});
