import request from 'sync-request';
import { giveUid } from './dm';
import config from './config.json';
import { getUId } from './other';
import { dmList } from './dm';
import { messageSendDmV1 } from './message';

const port = config.port;
const hosturl = config.url;
const url = hosturl + ':' + port;

const FORBID = 403;
const BAD_REQ = 400;
const OKAY = 200;

describe('Testing dm/details/v2', () => {
  beforeEach(() => {
    request('DELETE', url + '/clear/v1');
  });
  // dmID is not valid
  test('dmId is not valid', () => {
    /// ////////////////////////////set up the datastore/////////////////////////////////////////
    const user1 = registerUser('testingUser1@gmail.com', '1234567', 'FirstName1', 'LastName1');
    const badDmId = -100; // will work regardless as dm has not been created
    /// /////////////////////////////////////////////////////////////////////////////////////////
    const res = request(
      'GET',
      url + '/dm/details/v2',
      {
        qs: {
          dmId: badDmId
        },
        headers: {
          token: user1.token,
        },
      }
    );
    expect(res.statusCode).toBe(BAD_REQ);
  });
  // dmID is valid but authUserId is not a member of the DM
  test('dmId is valid but authUserId is not a member', () => {
    /// ////////////////////////////set up the datastore/////////////////////////////////////////
    const user1 = registerUser('testingUser1@gmail.com', '1234567', 'FirstName1', 'LastName1');
    const user2 = registerUser('testingUser2@gmail.com', '1234567', 'FirstName2', 'LastName2');
    const user3 = registerUser('testingUser3@gmail.com', '1234567', 'FirstName3', 'LastName3');
    const dm12 = startDm(user1.token, [giveUid(user2.authUserId)]);
    /// /////////////////////////////////////////////////////////////////////////////////////////
    const res = request(
      'GET',
      url + '/dm/details/v2',
      {
        qs: {
          dmId: dm12.dmId,
        },
        headers: {
          token: user3.token,
        },
      }
    );
    expect(res.statusCode).toBe(FORBID);
  });
  // token is not valid
  test('token is not valid', () => {
    /// ////////////////////////////set up the datastore/////////////////////////////////////////
    const user1 = registerUser('testingUser1@gmail.com', '1234567', 'FirstName1', 'LastName1');
    const user2 = registerUser('testingUser2@gmail.com', '1234567', 'FirstName2', 'LastName2');
    const dm12 = startDm(user1.token, [giveUid(user2.authUserId)]);
    const badtoken = 'thisisalmostcertainlynotatoken';
    /// /////////////////////////////////////////////////////////////////////////////////////////
    const res = request(
      'GET',
      url + '/dm/details/v2',
      {
        qs: {
          dmId: dm12.dmId,
        },
        headers: {
          token: badtoken,
        },
      }
    );
    expect(res.statusCode).toBe(FORBID);
  });
  // all is correct
  test('testing sucessful call of non owner', () => {
    /// ////////////////////////////set up the datastore/////////////////////////////////////////
    const user1 = registerUser('testingUser1@gmail.com', '1234567', 'FirstName1', 'LastName1');
    const user2 = registerUser('testingUser2@gmail.com', '1234567', 'FirstName2', 'LastName2');
    const dm12 = startDm(user1.token, [giveUid(user2.authUserId)]);
    /// /////////////////////////////////////////////////////////////////////////////////////////
    const res = request(
      'GET',
      url + '/dm/details/v2',
      {
        qs: {
          dmId: dm12.dmId,
        },
        headers: {
          token: user2.token,
        },
      }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OKAY);
    expect(bodyObj).toEqual(
      expect.objectContaining({
        name: expect.any(String),
        members: expect.any(Array),
      })
    );
  });
  // all is correct
  test('testing sucessful call of owner', () => {
    /// ////////////////////////////set up the datastore/////////////////////////////////////////
    const user1 = registerUser('testingUser1@gmail.com', '1234567', 'FirstName1', 'LastName1');
    const user2 = registerUser('testingUser2@gmail.com', '1234567', 'FirstName2', 'LastName2');
    const dm12 = startDm(user1.token, [giveUid(user2.authUserId)]);
    /// /////////////////////////////////////////////////////////////////////////////////////////
    const res = request(
      'GET',
      url + '/dm/details/v2',
      {
        qs: {
          dmId: dm12.dmId,
        },
        headers: {
          token: user1.token,
        },
      }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OKAY);
    expect(bodyObj).toEqual(
      expect.objectContaining({
        name: expect.any(String),
        members: expect.any(Array),
      })
    );
  });
});
// ///////////////////////////////////////////////////////////////////////////////////////////
// ///////////////////////////////////////////////////////////////////////////////////////////
// ///////////////////////////////////////////////////////////////////////////////////////////
// ///////////////////////////////////////////////////////////////////////////////////////////
// ///////////////////////////////////////////////////////////////////////////////////////////
// ///////////////////////////////////////////////////////////////////////////////////////////
describe('Testing dm/leave/v2', () => {
  beforeEach(() => {
    request('DELETE', url + '/clear/v1');
  });
  // dmID is not valid
  test('dmId is not valid', () => {
    /// ////////////////////////////set up the datastore/////////////////////////////////////////
    const user1 = registerUser('testingUser1@gmail.com', '1234567', 'FirstName1', 'LastName1');
    const badDmId = -100; // will work regardless as dm has not been created
    /// /////////////////////////////////////////////////////////////////////////////////////////
    const res = request(
      'POST',
      url + '/dm/leave/v2',
      {
        body: JSON.stringify({
          dmId: badDmId,
        }),
        headers: {
          'Content-type': 'application/json',
          token: user1.token,
        },
      }
    );
    expect(res.statusCode).toStrictEqual(BAD_REQ);
  });
  // dmID is valid but authUserId is not a member of the DM
  test('dmId is valid but authUserId is not a member', () => {
    /// ////////////////////////////set up the datastore/////////////////////////////////////////
    const user1 = registerUser('testingUser1@gmail.com', '1234567', 'FirstName1', 'LastName1');
    const user2 = registerUser('testingUser2@gmail.com', '1234567', 'FirstName2', 'LastName2');
    const user3 = registerUser('testingUser3@gmail.com', '1234567', 'FirstName3', 'LastName3');
    const dm12 = startDm(user1.token, [giveUid(user2.authUserId)]);
    /// /////////////////////////////////////////////////////////////////////////////////////////
    const res = request(
      'POST',
      url + '/dm/leave/v2',
      {
        body: JSON.stringify({
          dmId: dm12.dmId,
        }),
        headers: {
          'Content-type': 'application/json',
          token: user3.token,
        },
      }
    );
    expect(res.statusCode).toStrictEqual(FORBID);
  });
  // token is not valid
  test('token is not valid', () => {
    /// ////////////////////////////set up the datastore/////////////////////////////////////////
    const user1 = registerUser('testingUser1@gmail.com', '1234567', 'FirstName1', 'LastName1');
    const user2 = registerUser('testingUser2@gmail.com', '1234567', 'FirstName2', 'LastName2');
    const dm12 = startDm(user1.token, [giveUid(user2.authUserId)]);
    const badtoken = 'thisisalmostcertainlynotatoken';
    /// /////////////////////////////////////////////////////////////////////////////////////////
    const res = request(
      'POST',
      url + '/dm/leave/v2',
      {
        body: JSON.stringify({
          dmId: dm12.dmId,
        }),
        headers: {
          'Content-type': 'application/json',
          token: badtoken,
        },
      }
    );
    expect(res.statusCode).toStrictEqual(FORBID);
  });
  // all is correct
  test('testing sucessful call of non owner', () => {
    /// ////////////////////////////set up the datastore/////////////////////////////////////////
    const user1 = registerUser('testingUser1@gmail.com', '1234567', 'FirstName1', 'LastName1');
    const user2 = registerUser('testingUser2@gmail.com', '1234567', 'FirstName2', 'LastName2');
    const dm12 = startDm(user1.token, [giveUid(user2.authUserId)]);
    /// /////////////////////////////////////////////////////////////////////////////////////////
    const res = request(
      'POST',
      url + '/dm/leave/v2',
      {
        body: JSON.stringify({
          dmId: dm12.dmId,
        }),
        headers: {
          'Content-type': 'application/json',
          token: user2.token,
        },
      }
    );
    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toStrictEqual(OKAY);
    expect(bodyObj).toEqual({});
  });
  // all is correct
  test('testing sucessful call of owner', () => {
    /// ////////////////////////////set up the datastore/////////////////////////////////////////
    const user1 = registerUser('testingUser1@gmail.com', '1234567', 'FirstName1', 'LastName1');
    const user2 = registerUser('testingUser2@gmail.com', '1234567', 'FirstName2', 'LastName2');
    const dm12 = startDm(user1.token, [giveUid(user2.authUserId)]);
    /// /////////////////////////////////////////////////////////////////////////////////////////
    const res = request(
      'POST',
      url + '/dm/leave/v2',
      {
        body: JSON.stringify({
          dmId: dm12.dmId,
        }),
        headers: {
          'Content-type': 'application/json',
          token: user1.token,
        },
      }
    );
    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toStrictEqual(OKAY);
    expect(bodyObj).toEqual({});
  });
});

// ///////////////////////////////////////////////////////////////////////////////////////////
// ///////////////////////////////////////////////////////////////////////////////////////////
// ///////////////////////////////////////////////////////////////////////////////////////////
// ///////////////////////////////////////////////////////////////////////////////////////////
// ///////////////////////////////////////////////////////////////////////////////////////////
// ///////////////////////////////////////////////////////////////////////////////////////////
// Tests for dmMessagesV1
describe('Testing dmMessagesV1', () => {
  beforeEach(() => {
    request('DELETE', url + '/clear/v1');
  });
  test('token is not valid', () => {
    /// ////////////////////////////set up the datastore/////////////////////////////////////////
    const user1 = registerUser('testingUser1@gmail.com', '1234567', 'FirstName1', 'LastName1');
    const user2 = registerUser('testingUser2@gmail.com', '1234567', 'FirstName2', 'LastName2');
    const dm12 = startDm(user1.token, [giveUid(user2.authUserId)]);
    /// /////////////////////////////////////////////////////////////////////////////////////////
    const res = request(
      'GET',
      url + '/dm/messages/v2',
      {
        qs: {
          dmId: dm12.dmId,
          start: 10,
        },
        headers: {
          token: 'thisisprobablynotatoken',
        },
      }
    );
    expect(res.statusCode).toBe(FORBID);
  });
  test('dmId is not valid', () => {
    /// ////////////////////////////set up the datastore/////////////////////////////////////////
    const user1 = registerUser('testingUser1@gmail.com', '1234567', 'FirstName1', 'LastName1');
    const badDmId = -100; // will work regardless as dm has not been created
    /// /////////////////////////////////////////////////////////////////////////////////////////
    const res = request(
      'GET',
      url + '/dm/messages/v2',
      {
        qs: {
          dmId: badDmId,
          start: 10,
        },
        headers: {
          token: user1.token,
        },
      }
    );
    expect(res.statusCode).toBe(BAD_REQ);
  });
  test('dmId is valid but authUserId is not a member', () => {
    /// ////////////////////////////set up the datastore/////////////////////////////////////////
    const user1 = registerUser('testingUser1@gmail.com', '1234567', 'FirstName1', 'LastName1');
    const user2 = registerUser('testingUser2@gmail.com', '1234567', 'FirstName2', 'LastName2');
    const user3 = registerUser('testingUser3@gmail.com', '1234567', 'FirstName3', 'LastName3');
    const dm12 = startDm(user1.token, [giveUid(user2.authUserId)]);
    /// /////////////////////////////////////////////////////////////////////////////////////////
    const res = request(
      'GET',
      url + '/dm/messages/v2',
      {
        qs: {
          dmId: dm12.dmId,
          start: 10,
        },
        headers: {
          token: user3.token,
        },
      }
    );
    expect(res.statusCode).toBe(FORBID);
  });

  test('start is greater than total messages in channel', () => {
    /// ////////////////////////////set up the datastore/////////////////////////////////////////
    const user1 = registerUser('testingUser1@gmail.com', '1234567', 'FirstName1', 'LastName1');
    const user2 = registerUser('testingUser2@gmail.com', '1234567', 'FirstName2', 'LastName2');
    const dm12 = startDm(user1.token, [giveUid(user2.authUserId)]);
    const start = 10; // there are no messages so any number > 0.
    /// /////////////////////////////////////////////////////////////////////////////////////////
    const res = request(
      'GET',
      url + '/dm/messages/v2',
      {
        qs: {
          dmId: dm12.dmId,
          start: start,
        },
        headers: {
          token: user1.token,
        },
      }
    );
    expect(res.statusCode).toBe(BAD_REQ);
  });

  test('test for sucsessfull input', () => {
    /// ////////////////////////////set up the datastore/////////////////////////////////////////
    const user1 = registerUser('testingUser1@gmail.com', '1234567', 'FirstName1', 'LastName1');
    const user2 = registerUser('testingUser2@gmail.com', '1234567', 'FirstName2', 'LastName2');
    const dm12 = startDm(user1.token, [giveUid(user2.authUserId)]);
    const start = 0; // there are no messages so 0 is the only usable size
    /// /////////////////////////////////////////////////////////////////////////////////////////
    const res = request(
      'GET',
      url + '/dm/messages/v2',
      {
        qs: {
          dmId: dm12.dmId,
          start: start,
        },
        headers: {
          token: user1.token,
        },
      }
    );
    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OKAY);
    expect(bodyObj).toStrictEqual({
      messages: [],
      start: 0,
      end: -1,
    });
  });
  test('test for greater than 50 messages', () => {
    /// ////////////////////////////set up the datastore/////////////////////////////////////////
    const user1 = registerUser('testingUser1@gmail.com', '1234567', 'FirstName1', 'LastName1');
    const user2 = registerUser('testingUser2@gmail.com', '1234567', 'FirstName2', 'LastName2');
    const dm12 = startDm(user1.token, [giveUid(user2.authUserId)]);
    const start = 0; // there are no messages so 0 is the only usable size
    for (let i = 0; i < 100; i++) { messageSendDmV1(user1.token, dm12.dmId, '$i'); }
    /// /////////////////////////////////////////////////////////////////////////////////////////
    const res = request(
      'GET',
      url + '/dm/messages/v2',
      {
        qs: {
          dmId: dm12.dmId,
          start: start,
        },
        headers: {
          token: user1.token,
        },
      }
    );
    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OKAY);
    expect(bodyObj.start).toBe(0);
    expect(bodyObj.end).toBe(50);
    expect(bodyObj.messages.length).toBe(50);
  });
  test('test for less than 50 messages', () => {
    /// ////////////////////////////set up the datastore/////////////////////////////////////////
    const user1 = registerUser('testingUser1@gmail.com', '1234567', 'FirstName1', 'LastName1');
    const user2 = registerUser('testingUser2@gmail.com', '1234567', 'FirstName2', 'LastName2');
    const dm12 = startDm(user1.token, [giveUid(user2.authUserId)]);
    const start = 0; // there are no messages so 0 is the only usable size
    for (let i = 0; i < 30; i++) { messageSendDmV1(user1.token, dm12.dmId, '$i'); }
    /// /////////////////////////////////////////////////////////////////////////////////////////
    const res = request(
      'GET',
      url + '/dm/messages/v2',
      {
        qs: {
          dmId: dm12.dmId,
          start: start,
        },
        headers: {
          token: user1.token,
        },
      }
    );
    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OKAY);
    expect(bodyObj.start).toBe(0);
    expect(bodyObj.end).toBe(-1);
    expect(bodyObj.messages.length).toBe(30);
  });
});

// ///////////////////////////////////////////////////////////////////////////////////////////
// ///////////////////////////////////////////////////////////////////////////////////////////
// ///////////////////////////////////////////////////////////////////////////////////////////
// ///////////////////////////////////////////////////////////////////////////////////////////
// ///////////////////////////////////////////////////////////////////////////////////////////
// ///////////////////////////////////////////////////////////////////////////////////////////
// testing helper function, registers a user by making an http call. returns the body object of the response
export function registerUser(email: string, password: string, nameFirst: string, nameLast: string) {
  const res = request(
    'POST',
    url + '/auth/register/v3',
    {
      body: JSON.stringify({
        email: email,
        password: password,
        nameFirst: nameFirst,
        nameLast: nameLast,
      }),
      headers: {
        'Content-type': 'application/json',
      },
    }
  );
  return JSON.parse(String(res.getBody()));
}

// testing helper function, creates a dm  by making an http call. retunrs the body object of the response
function startDm(token: string, uIds: number[]) {
  const res = request(
    'POST',
    url + '/dm/create/v2',
    {
      body: JSON.stringify({
        uIds: uIds,
      }),
      headers: {
        'Content-type': 'application/json',
        token: token,
      },
    }
  );
  return JSON.parse(String(res.getBody()));
}
// note that response codes are tested in helper functions.
/*
////////////////////////////////////////////////
/////       Tests for dm/create/v2         /////
////////////////////////////////////////////////
*/

describe('Testing dm/create/v2', () => {
  beforeEach(() => {
    requestClear();
  });

  test('Testing if error is returned when token is invalid', () => {
    const member1 = requestAuthRegister('member1@email.com', 'meMber1', 'member', 'one');
    const member2 = requestAuthRegister('member2@email.com', 'MemBer2', 'member', 'two');
    const member3 = requestAuthRegister('member3@email.com', 'membEr3', 'member', 'three');

    const member1UId = Number(getUId(member1.authUserId));
    const member2UId = Number(getUId(member2.authUserId));
    const member3UId = Number(getUId(member3.authUserId));

    const uIds = [member1UId, member2UId, member3UId];

    const output = requestDmCreate('invalid-token', uIds);
    expect(output.statusCode).toBe(FORBID);
  });

  test('Testing if error is returned when uIds are invalid', () => {
    const creator = requestAuthRegister('creator@email.com', 'CreatOr1', 'creator', 'ofdm');
    const output = requestDmCreate(creator.token, [-1, -2]);
    expect(output.statusCode).toBe(BAD_REQ);
  });

  test('Testing if error is returned when uIds are not unique', () => {
    const creator = requestAuthRegister('creator@email.com', 'CreatOr1', 'creator', 'ofdm');
    const member1 = requestAuthRegister('member1@email.com', 'meMber1', 'member', 'one');
    const member2 = requestAuthRegister('member2@email.com', 'MemBer2', 'member', 'two');
    const member3 = requestAuthRegister('member3@email.com', 'membEr3', 'member', 'three');

    const member1UId = Number(getUId(member1.authUserId));
    const member2UId = Number(getUId(member2.authUserId));
    const member3UId = Number(getUId(member3.authUserId));
    const uIds = [member1UId, member2UId, member3UId, member2UId];

    const output = requestDmCreate(creator.token, uIds);
    expect(output.statusCode).toBe(BAD_REQ);
  });

  test('Testing successful run', () => {
    const creator = requestAuthRegister('creator@email.com', 'CreatOr1', 'creator', 'ofdm');
    const member1 = requestAuthRegister('member1@email.com', 'meMber1', 'member', 'one');
    const member2 = requestAuthRegister('member2@email.com', 'MemBer2', 'member', 'two');
    const member3 = requestAuthRegister('member3@email.com', 'membEr3', 'member', 'three');

    // const creatorUid = Number(getUId(creator.authUserId));
    const member1UId = Number(getUId(member1.authUserId));
    const member2UId = Number(getUId(member2.authUserId));
    const member3UId = Number(getUId(member3.authUserId));
    const uIds = [member1UId, member2UId, member3UId];

    const output = requestDmCreate(creator.token, uIds);
    expect(output.statusCode).toBe(OKAY);

    // const dmDetails = requestDmDetails(member1.token, output.dmId);
    // expect(dmDetails.name).toStrictEqual('creatorofdm, memberone, memberthree, membertwo');
    // expect(new Set(dmDetails.members)).toStrictEqual(new Set([
    //   requestUserProfile(creator.token, creatorUid),
    //   requestUserProfile(member1.token, member1UId),
    //   requestUserProfile(member2.token, member2UId),
    //   requestUserProfile(member3.token, member3UId),
    // ]));
  });
});

/*
////////////////////////////////////////////////
/////         Tests for dm/list/v2         /////
////////////////////////////////////////////////
*/
describe('Testing dm/list/v2', () => {
  beforeEach(() => {
    requestClear();
  });

  test('Testing if error is returned when token is invalid', () => {
    const output = requestDmList('invalid-token');
    expect(output.statusCode).toBe(FORBID);
  });

  test('Testing successful case - No Dms (i)', () => {
    const member3 = requestAuthRegister('member3@email.com', 'membEr3', 'member', 'three');
    const output = requestDmList(member3.token);
    expect(JSON.parse(String(output.getBody())).dms).toStrictEqual([]);
    expect(output.statusCode).toBe(OKAY);
  });

  test('Testing successful case (ii)', () => {
    const creator = requestAuthRegister('creator@email.com', 'CreatOr1', 'creator', 'ofdm');
    const member1 = requestAuthRegister('member1@email.com', 'meMber1', 'member', 'one');
    const member2 = requestAuthRegister('member2@email.com', 'MemBer2', 'member', 'two');
    const member3 = requestAuthRegister('member3@email.com', 'membEr3', 'member', 'three');

    const member1UId = Number(getUId(member1.authUserId));
    const member2UId = Number(getUId(member2.authUserId));
    const uIds = [member1UId, member2UId];
    const uIds1 = [member1UId];

    const firstRes = requestDmCreate(creator.token, uIds);
    const secondRes = requestDmCreate(creator.token, uIds1);
    const firstDm = JSON.parse(String(firstRes.getBody()));
    const secondDm = JSON.parse(String(secondRes.getBody()));

    const res0 = requestDmList(member1.token);
    const output: dmList = JSON.parse(String(res0.getBody()));
    expect(output.dms.find(i => i.dmId === firstDm.dmId)).not.toStrictEqual(undefined);
    expect(output.dms.find(i => i.dmId === secondDm.dmId)).not.toStrictEqual(undefined);

    const res1 = requestDmList(member2.token);
    const output1: dmList = JSON.parse(String(res1.getBody()));
    expect(output1.dms.find(i => i.dmId === firstDm.dmId)).not.toStrictEqual(undefined);
    expect(output1.dms.find(i => i.dmId === secondDm.dmId)).toStrictEqual(undefined);

    const res2 = requestDmList(creator.token);
    const output2: dmList = JSON.parse(String(res2.getBody()));
    expect(output2.dms.find(i => i.dmId === firstDm.dmId)).not.toStrictEqual(undefined);
    expect(output2.dms.find(i => i.dmId === secondDm.dmId)).not.toStrictEqual(undefined);

    const res3 = requestDmList(member3.token);
    const output3: dmList = JSON.parse(String(res3.getBody()));
    expect(output3.dms.find(i => i.dmId === firstDm.dmId)).toStrictEqual(undefined);
    expect(output3.dms.find(i => i.dmId === secondDm.dmId)).toStrictEqual(undefined);

    expect(res0.statusCode).toBe(OKAY);
    expect(res1.statusCode).toBe(OKAY);
    expect(res2.statusCode).toBe(OKAY);
    expect(res3.statusCode).toBe(OKAY);
  });
});
/*
////////////////////////////////////////////////
/////       Tests for dm/remove/v2         /////
////////////////////////////////////////////////
*/

describe('Testing dm/remove/v2', () => {
  beforeEach(() => {
    requestClear();
  });

  test('Testing if error is returned when token is invalid', () => {
    const creator = requestAuthRegister('creator@email.com', 'CreatOr1', 'creator', 'ofdm');
    const member1 = requestAuthRegister('member1@email.com', 'meMber1', 'member', 'one');
    const member2 = requestAuthRegister('member2@email.com', 'MemBer2', 'member', 'two');
    const member3 = requestAuthRegister('member3@email.com', 'membEr3', 'member', 'three');

    const member1UId = Number(getUId(member1.authUserId));
    const member2UId = Number(getUId(member2.authUserId));
    const member3UId = Number(getUId(member3.authUserId));
    const uIds = [member1UId, member2UId, member3UId];

    const dm = JSON.parse(String(requestDmCreate(creator.token, uIds).getBody()));

    const output = requestDmRemove('invalid-token', dm.dmId);
    expect(output.statusCode).toStrictEqual(FORBID);
  });

  test('Testing if error is returned when dmId is invalid', () => {
    const creator = requestAuthRegister('creator@email.com', 'CreatOr1', 'creator', 'ofdm');
    const output = requestDmRemove(creator.token, -1);
    expect(output.statusCode).toStrictEqual(BAD_REQ);
  });

  test('Testing if error if token belongs to non-owner', () => {
    const creator = requestAuthRegister('creator@email.com', 'CreatOr1', 'creator', 'ofdm');
    const member1 = requestAuthRegister('member1@email.com', 'meMber1', 'member', 'one');
    const member2 = requestAuthRegister('member2@email.com', 'MemBer2', 'member', 'two');
    const member3 = requestAuthRegister('member3@email.com', 'membEr3', 'member', 'three');

    const member1UId = Number(getUId(member1.authUserId));
    const member2UId = Number(getUId(member2.authUserId));
    const member3UId = Number(getUId(member3.authUserId));
    const uIds = [member1UId, member2UId, member3UId];

    const dm = JSON.parse(String(requestDmCreate(creator.token, uIds).getBody()));

    const output = requestDmRemove(member1.token, dm.dmId);
    expect(output.statusCode).toStrictEqual(FORBID);
  });

  test('Testing successful run', () => {
    const creator = requestAuthRegister('creator@email.com', 'CreatOr1', 'creator', 'ofdm');
    const member1 = requestAuthRegister('member1@email.com', 'meMber1', 'member', 'one');
    const member2 = requestAuthRegister('member2@email.com', 'MemBer2', 'member', 'two');
    const member3 = requestAuthRegister('member3@email.com', 'membEr3', 'member', 'three');

    const member1UId = Number(getUId(member1.authUserId));
    const member2UId = Number(getUId(member2.authUserId));
    const member3UId = Number(getUId(member3.authUserId));
    const uIds = [member1UId, member2UId, member3UId];

    const output = JSON.parse(String(requestDmCreate(creator.token, uIds).getBody()));
    const response = requestDmRemove(creator.token, output.dmId);
    const output2 = JSON.parse(String(requestDmList(member1.token).getBody()));
    expect(output2.dms).toStrictEqual([]);
    const output3 = JSON.parse(String(requestDmList(creator.token).getBody()));
    expect(output3.dms).toStrictEqual([]);
    expect(response.statusCode).toBe(OKAY);
  });
});
/*
////////////////////////////////////////////////
/////            Helper functions          /////
////////////////////////////////////////////////
*/

function requestClear() {
  request(
    'DELETE',
    url + '/clear/v1'
  );
}

function requestAuthRegister(email: string, password: string, nameFirst: string, nameLast: string) {
  const res = request(
    'POST',
    url + '/auth/register/v3',
    {
      body: JSON.stringify({
        email: email,
        password: password,
        nameFirst: nameFirst,
        nameLast: nameLast
      }),
      headers: {
        'Content-type': 'application/json',
      },
    }
  );
  expect(res.statusCode).toStrictEqual(OKAY);
  return JSON.parse(String(res.getBody()));
}

export function requestDmCreate(token: string, uIds: Array<number>) {
  const res = request(
    'POST',
    url + '/dm/create/v2',
    {
      body: JSON.stringify({
        uIds: uIds,
      }),
      headers: {
        'Content-type': 'application/json',
        token: token,
      },
    }
  );
  return res;
}

function requestDmList(token: string) {
  const res = request(
    'GET',
    url + '/dm/list/v2',
    {
      headers: {
        token: token,
      },
    }
  );
  // return JSON.parse(String(res.getBody()));
  return res;
}

function requestDmRemove(token: string, dmId: number) {
  const res = request(
    'DELETE',
    url + '/dm/remove/v2',
    {
      qs: {
        dmId: dmId
      },
      headers: {
        token: token,
      },
    }
  );
  // return JSON.parse(String(res.getBody()));
  return res;
}

// function requestDmDetails(token: string, dmId: number) {
//   const res = request(
//     'GET',
//     url + '/dm/details/v2',
//     {
//       qs: {
//         dmId: dmId,
//       },
//                headers: {
//        token: token,
//      },
//     }
//   );
//   expect(res.statusCode).toStrictEqual(OKAY);
//   return JSON.parse(String(res.getBody()));
// }
// function requestUserProfile(token: string, uId: number) {
//   const res = request(
//     'GET',
//     url + '/user/profile/v2',
//     {
//       qs: {
//         uID: uId,
//       },
// headers: {
//   token: token,
// },
//     }
//   );
//   expect(res.statusCode).toStrictEqual(OKAY);
//   return JSON.parse(String(res.getBody()));
// }
