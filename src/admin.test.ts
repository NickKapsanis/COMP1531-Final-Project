import request from 'sync-request';
import { channelJoin, createChannel, getUID, requestChannelMessagesV3 } from './channel.test';
// import { PORT, HOST } from './server';
import config from './config.json';
import { registerUser, requestDmCreate } from './dm.test';
import { requestMessageSendDmV1, requestMessageSendV1 } from './message.test';
import { usersAll } from './users.test';

const port = config.port;
const hosturl = config.url;
const url = hosturl + ':' + port;

const FORBID = 403;
const BAD_REQ = 400;
const OKAY = 200;

describe('testing admin/userpermission/change/v1', () => {
  request('DELETE', url + '/clear/v1');
  const globalOwner = registerUser('testingUser1@gmail.com', '1234567', 'GlobalOwner', 'LastName1');
  const user1 = registerUser('testingUser2@gmail.com', '1234567', 'FirstName2', 'LastName2');
  const globalOwnerUid = getUID(globalOwner.authUserId);
  const user1Uid = getUID(user1.authUserId);
  test.each([
    { uId: 9898, permissionId: 1, token: globalOwner.token, bad: 'uID not Valid' },
    { uId: user1Uid, permissionId: 5, token: globalOwner.token, bad: 'permission ID invalid' },
    { uId: user1Uid, permissionId: 2, token: globalOwner.token, bad: 'user already has permission level' },
    { uId: globalOwnerUid, permissionId: 2, token: globalOwner.token, bad: 'only 1 global owner, cannot demote' },
  ])('$bad', (
    { uId, permissionId, token }
  ) => {
    const res = changePermission(uId, permissionId, token);
    expect(res.statusCode).toBe(BAD_REQ);
  });
  test('authUser is not a global owner', () => {
    const res = changePermission(globalOwnerUid, 2, user1.token);
    expect(res.statusCode).toBe(FORBID);
  });
  test('invalid token', () => {
    const res = changePermission(globalOwnerUid, 2, 'notAToken');
    expect(res.statusCode).toBe(FORBID);
  });
  test('non global owner is promoted to global owner and hence demotes og globalowner', () => {
    const res1 = changePermission(user1Uid, 1, globalOwner.token);
    expect(res1.statusCode).toBe(OKAY);
    expect(JSON.parse(String(res1.getBody()))).toEqual({});
    const res2 = changePermission(globalOwnerUid, 2, user1.token);
    expect(res2.statusCode).toBe(OKAY);
    expect(JSON.parse(String(res1.getBody()))).toEqual({});
  });
});
/// //////////////////////////////////////////////////////////////////////
/// //////////////////////////////////////////////////////////////////////////
/// //////////////////////////////////////////////////////////////////////////
describe('testing /admin/user/remove/v1', () => {
  request('DELETE', url + '/clear/v1');
  const globalOwner = registerUser('testingUser1@gmail.com', '1234567', 'GlobalOwner', 'LastName1');
  const user1 = registerUser('testingUser2@gmail.com', '1234567', 'FirstName2', 'LastName2');
  const globalOwnerUid = getUID(globalOwner.authUserId);
  const user1Uid = getUID(user1.authUserId);
  const channelId = createChannel(globalOwner.token, 'Channel1', true).channelId;
  channelJoin(user1.token, channelId);
  requestMessageSendV1(user1.token, channelId, 'This is a test message, should be replaced');
  const dmId = JSON.parse(String(requestDmCreate(globalOwner.token, [user1Uid]).getBody()));
  requestMessageSendDmV1(user1.token, dmId, 'This is a test DM message, should be replaced');

  test.each([
    { uId: 9898, token: globalOwner.token, bad: 'uID not Valid' },
    { uId: globalOwnerUid, token: globalOwner.token, bad: 'only 1 global owner, cannot remove' },
  ])('$bad', (
    { uId, token }
  ) => {
    const res = userRemove(uId, token);
    expect(res.statusCode).toBe(BAD_REQ);
  });
  test('authUser is not a global owner', () => {
    const res = userRemove(globalOwnerUid, user1.token);
    expect(res.statusCode).toBe(FORBID);
  });
  test('bad token', () => {
    const res = userRemove(globalOwnerUid, 'notAToken');
    expect(res.statusCode).toBe(FORBID);
  });
  test('user is removed', () => {
    // this tests the removal process by server status code
    const res = userRemove(globalOwnerUid, 'notAToken');
    expect(res.statusCode).toBe(OKAY);
    expect(JSON.parse(String(res.getBody()))).toEqual({});

    // now need to check that user has been appropriatly removed
    expect(usersAll(globalOwner.token.users.length)).toBe(1);
    const userProfile = requestUserProfile(globalOwner.token, user1Uid);
    expect(userProfile.nameFirst).toBe('Removed');
    expect(userProfile.nameLast).toBe('user');
    expect(JSON.parse(String(requestChannelMessagesV3(globalOwner.token, channelId, 0).getBody())).messages[0].message).toBe('Removed user');
    expect(requestDmMessages(dmId, 0, globalOwner.token).messages[0].message).toBe('Removed user');
    registerUser('testingUser2@gmail.com', '1234567', 'FirstName2', 'LastName2');
  });
});
/// //////////////////////////////////////////////////////////////////////
/// //////////////////////////////////////////////////////////////////////
function userRemove(uId: number, token: string) {
  return request(
    'DELETE',
    url + 'admin/user/remove/v1',
    {
      qs: {
        uId: uId,
      },
      headers: {
        token: token,
      },
    }
  );
}
function changePermission(Uid: number, permissionId: number, token: string) {
  const res = request(
    'POST',
    url + '/admin/userpermission/change/v1',
    {
      body: JSON.stringify({
        uId: Uid,
        permissionId: permissionId,
      }),
      headers: {
        'Content-type': 'application/json',
        token: token,
      },
    }
  );
  return res;
}

function requestUserProfile(token: string, uId: number) {
  const res = request(
    'GET',
    url + '/user/profile/v2',
    {
      qs: {
        uId: uId,
        token: token,
      },
    // headers: {
    //   token: token,
    // },
    }

  );
  return JSON.parse(String(res.getBody()));
}

function requestDmMessages(dmId: number, start: number, token: string) {
  const res = request(
    'GET',
    url + '/dm/messages/v2',
    {
      qs: {
        dmId: dmId,
        start: start,
      },
      headers: {
        token: token,
      },
    }
  );
  return JSON.parse(String(res.getBody()));
}
