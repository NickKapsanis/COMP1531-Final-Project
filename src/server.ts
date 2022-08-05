import express from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';
import { dmDetailsV2, dmLeaveV2, dmMessagesV2 } from './dm';
import { dmCreateV2, dmListV2, dmRemoveV2 } from './dm';
import { authRegisterV3, authLoginV3, authLogoutV2, authPasswordresetRequestV1, authPasswordresetResetV1 } from './auth';
import { channelsCreateV3, channelsListV2, channelsListallV2 } from './channels';
import { channelJoinV3, channelInviteV3, addChannelOwnerV2, removeChannelOwnerV2, channelsLeaveV1 } from './channel';
import cors from 'cors';
import { usersAllV2, userProfileV3 } from './users';
import { clearV1, getUId, searchV1 } from './other';
import { userSetemailV1, userSethandlelV1, userSetnameV1 } from './users';
import { messageSendV2, messageSendDmV2, messageRemoveV2, messageEditV2, messageShareV1, messageSendLaterV1, messageSendLaterDmV1, messagePinV1, messageUnPinV1, messageReactV1, messageUnReactV1 } from './message';
import { channelDetailsV3, channelMessagesV3 } from './channel';
import errorHandler from 'middleware-http-errors';
import { adminUserpermissionChangeV1, adminUserRemoveV1 } from './admin';
import { standupActiveV1, standupSendV1, standupStartV1 } from './standup';

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
// request dm details V2
app.get('/dm/details/v2', (req, res) => {
  const token = req.header('token');
  const dmId = parseInt(req.query.dmId as string);
  res.json(dmDetailsV2(token, dmId));
});
// request dm leave V2
app.post('/dm/leave/v2', (req, res) => {
  const token = req.header('token');
  const data = req.body;
  res.json(dmLeaveV2(token, data.dmId));
});
// request dm messages V2
app.get('/dm/messages/v2', (req, res) => {
  const token = req.header('token');
  const dmId = parseInt(req.query.dmId as string);
  const start = parseInt(req.query.start as string);
  res.json(dmMessagesV2(token, dmId, start));
});
// dmCreate V2
app.post('/dm/create/v2', (req, res) => {
  const token = req.header('token');
  const uIds = req.body.uIds;
  res.json(dmCreateV2(token, uIds));
});
// dmList V2
app.get('/dm/list/v2', (req, res) => {
  const token = req.header('token');
  res.json(dmListV2(token));
});
// dmRemove
app.delete('/dm/remove/v2', (req, res) => {
  const token = req.header('token');
  const dmId = Number(req.query.dmId);
  res.json(dmRemoveV2(token, dmId));
});
// channelsCreate
app.post('/channels/create/v3', (req, res) => {
  const token = String(req.header('token'));
  const name = String(req.body.name);
  const isPublic = Boolean(req.body.isPublic);
  res.json(channelsCreateV3(token, name, isPublic));
});
// authRegisterv3
app.post('/auth/register/v3', (req, res) => {
  const data = req.body;
  res.json(authRegisterV3(data.email, data.password, data.nameFirst, data.nameLast));
});
// authLoginv3
app.post('/auth/login/v3', (req, res) => {
  const data = req.body;
  res.json(authLoginV3(data.email, data.password));
});
// authLogoutV2
app.post('/auth/logout/v2', (req, res) => {
  const token = req.header('token');
  res.json(authLogoutV2(token));
});

// authPasswordresetRequestV1
app.post('/auth/passwordreset/request/v1', (req, res) => {
  const email = req.body.email;
  res.json(authPasswordresetRequestV1(email));
});

// authPasswordresetResetV1
app.post('/auth/passwordreset/reset/v1', (req, res) => {
  const resetCode = req.body.resetCode;
  const newPassword = req.body.newPassword;
  res.json(authPasswordresetResetV1(resetCode, newPassword));
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
app.post('/channel/join/v3', (req, res) => {
  const { channelId } = req.body;
  const token = String(req.header('token'));
  res.json(channelJoinV3(token, channelId));
});
// channelInvite
app.post('/channel/invite/v3', (req, res) => {
  const { channelId, uId } = req.body;
  const token = String(req.header('token'));
  res.json(channelInviteV3(token, channelId, uId));
});
// addChannelOwner
app.post('/channel/addowner/v2', (req, res) => {
  const { channelId, uId } = req.body;
  const token = String(req.header('token'));
  res.json(addChannelOwnerV2(token, channelId, uId));
});
// removeChannelOwner
app.post('/channel/removeowner/v2', (req, res) => {
  const { channelId, uId } = req.body;
  const token = String(req.header('token'));
  res.json(removeChannelOwnerV2(token, channelId, uId));
});
// clearV1
app.delete('/clear/v1', (req, res) => {
  res.json(clearV1());
});
// usersAll
app.get('/users/all/v2', (req, res) => {
  const token = String(req.header('token'));
  res.send(JSON.stringify(usersAllV2(token)));
});
// userProfile
app.get('/user/profile/v3', (req, res) => {
  const token = String(req.header('token'));
  const uId = Number(req.query.uId);
  res.json(userProfileV3(token, uId));
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
// SearchV1
app.get('/search/v1', (req, res) => {
  const token = String(req.header('token'));
  const queryStr = String(req.query.queryStr);
  res.json(searchV1(token, queryStr));
});
// channelsListallV2
app.get('/channels/listall/v2', (req, res) => {
  const data = req.query.token as string;
  res.json(channelsListallV2(data));
});
// channelDetailsV2
app.get('/channel/details/v3', (req, res) => {
  const token = String(req.header('token'));
  const channelId = Number(req.query.channelId);
  res.json(channelDetailsV3(token, channelId));
});
// channelMessagesV2
app.get('/channel/messages/v3', (req, res) => {
  const token = String(req.header('token'));
  const channelId = Number(req.query.channelId);
  const start = Number(req.query.start);
  res.json(channelMessagesV3(token, channelId, start));
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

// messegeSendDmV2
app.post('/message/senddm/v2', (req, res) => {
  const token = String(req.header('token'));
  const { dmId, message } = req.body;
  res.json(messageSendDmV2(token, dmId, message));
});
// messageRemoveV1
app.delete('/message/remove/v2', (req, res) => {
  const token = String(req.header('token'));
  const messageId = Number(req.query.messageId);
  res.json(messageRemoveV2(token, messageId));
});
// messageEditV1
app.put('/message/edit/v2', (req, res) => {
  const token = String(req.header('token'));
  const { messageId, message } = req.body;
  res.json(messageEditV2(token, messageId, message));
});

app.post('/message/share/v1', (req, res) => {
  const token = String(req.header('token'));
  const { ogMessageId, message, channelId, dmId } = req.body;
  res.json(messageShareV1(token, ogMessageId, message, channelId, dmId));
});

// messageSendLaterV1
app.post('/message/sendlater/v1', (req, res) => {
  const token = String(req.header('token'));
  const { channelId, message, timeSent } = req.body;
  res.json(messageSendLaterV1(token, channelId, message, timeSent));
});

// messageSendLaterDmV1
app.post('/message/sendlaterdm/v1', (req, res) => {
  const token = String(req.header('token'));
  const { dmId, message, timeSent } = req.body;
  res.json(messageSendLaterDmV1(token, dmId, message, timeSent));
});

// messagePinV1
app.post('/message/pin/v1', (req, res) => {
  const token = String(req.header('token'));
  const { messageId } = req.body;
  res.json(messagePinV1(token, messageId));
});

// messageUnPinV1
app.post('/message/unpin/v1', (req, res) => {
  const token = String(req.header('token'));
  const { messageId } = req.body;
  res.json(messageUnPinV1(token, messageId));
});

// messageReactV1
app.post('/message/react/v1', (req, res) => {
  const token = String(req.header('token'));
  const { messageId, reactId } = req.body;
  res.json(messageReactV1(token, messageId, reactId));
});

// messageUnReactV1
app.post('/message/unreact/v1', (req, res) => {
  const token = String(req.header('token'));
  const { messageId, reactId } = req.body;
  res.json(messageUnReactV1(token, messageId, reactId));
});

// adminUserRemoveV1
app.delete('/admin/user/remove/v1', (req, res) => {
  const token = req.header('token');
  const uId = Number(req.query.uId);
  res.json(adminUserRemoveV1(uId, token));
});

// adminUserpermissionsChangeV1
app.post('/admin/userpermission/change/v1', (req, res) => {
  const token = req.header('token');
  const uId = req.body.uId;
  const permissionId = req.body.permissionId;
  res.json(adminUserpermissionChangeV1(uId, permissionId, token));
});

// standupStartV1
app.post('/standup/start/v1', (req, res) => {
  const { channelId, length } = req.body;
  const token = String(req.header('token'));
  res.json(standupStartV1(token, channelId, length));
});

// standupActiveV1
app.get('/standup/active/v1', (req, res) => {
  const channelId = Number(req.query.channelId);
  const token = String(req.header('token'));
  res.json(standupActiveV1(token, channelId));
});

// standupSendV1
app.post('/standup/send/v1', (req, res) => {
  const { channelId, message } = req.body;
  const token = String(req.header('token'));
  res.json(standupSendV1(token, channelId, message));
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
