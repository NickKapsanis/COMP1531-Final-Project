import request from 'sync-request';
import { getUId } from './other';
import config from './config.json';
import { dmList } from './dm';

const port = config.port;
const url = config.url;
// note that response codes are tested in helper functions.
/*
////////////////////////////////////////////////
/////       Tests for dm/create/v1         /////
////////////////////////////////////////////////
*/

describe('Testing dm/create/v1', () => {
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
    expect(output).toStrictEqual({ error: 'error' });
  });

  test('Testing if error is returned when uIds are invalid', () => {
    const creator = requestAuthRegister('creator@email.com', 'CreatOr1', 'creator', 'ofdm');
    const output = requestDmCreate(creator.token, [-1, -2]);
    expect(output).toStrictEqual({ error: 'error' });
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
    expect(output).toStrictEqual({ error: 'error' });
  });

  test('Testing successful run', () => {
    const creator = requestAuthRegister('creator@email.com', 'CreatOr1', 'creator', 'ofdm');
    const member1 = requestAuthRegister('member1@email.com', 'meMber1', 'member', 'one');
    const member2 = requestAuthRegister('member2@email.com', 'MemBer2', 'member', 'two');
    const member3 = requestAuthRegister('member3@email.com', 'membEr3', 'member', 'three');

    const creatorUid = Number(getUId(creator.authUserId));
    const member1UId = Number(getUId(member1.authUserId));
    const member2UId = Number(getUId(member2.authUserId));
    const member3UId = Number(getUId(member3.authUserId));
    const uIds = [member1UId, member2UId, member3UId];

    const output = requestDmCreate(creator.token, uIds);
    expect(output.dmId).toStrictEqual(expect.any(Number));

    const dmDetails = requestDmDetails(creator.token, output.dmId);
    expect(dmDetails.name).toStrictEqual('creatoroftm, memberone, memberthree, membertwo');
    expect(new Set(dmDetails.members)).toStrictEqual(new Set([
      requestUserProfile(creator.token, creatorUid),
      requestUserProfile(member1.token, member1UId),
      requestUserProfile(member2.token, member2UId),
      requestUserProfile(member3.token, member3UId),
    ]));
  });
});

/*
////////////////////////////////////////////////
/////         Tests for dm/list/v1         /////
////////////////////////////////////////////////
*/
describe('Testing dm/list/v1', () => {
  beforeEach(() => {
    requestClear();
  });

  test('Testing if error is returned when token is invalid', () => {
    const output = requestDmList('invalid-token');
    expect(output).toStrictEqual({ error: 'error' });
  });

  test('Testing successful case - No Dms (i)', () => {
    const member3 = requestAuthRegister('member3@email.com', 'membEr3', 'member', 'three');
    const output = requestDmList(member3.token);
    expect(output.dms).toStrictEqual([]);
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

    const firstDm = requestDmCreate(creator.token, uIds);
    const secondDm = requestDmCreate(creator.token, uIds1);

    const output: dmList = requestDmList(member1.token);
    expect(output.dms.find(i => i.dmId === firstDm.dmId)).not.toStrictEqual(undefined);
    expect(output.dms.find(i => i.dmId === secondDm.dmId)).not.toStrictEqual(undefined);

    const output1: dmList = requestDmList(member2.token);
    expect(output1.dms.find(i => i.dmId === firstDm.dmId)).not.toStrictEqual(undefined);
    expect(output1.dms.find(i => i.dmId === secondDm.dmId)).toStrictEqual(undefined);

    const output2: dmList = requestDmList(creator.token);
    expect(output2.dms.find(i => i.dmId === firstDm.dmId)).not.toStrictEqual(undefined);
    expect(output2.dms.find(i => i.dmId === secondDm.dmId)).not.toStrictEqual(undefined);

    const output3: dmList = requestDmList(member3.token);
    expect(output3.dms.find(i => i.dmId === firstDm.dmId)).toStrictEqual(undefined);
    expect(output3.dms.find(i => i.dmId === secondDm.dmId)).toStrictEqual(undefined);
  });
});
/*
////////////////////////////////////////////////
/////       Tests for dm/remove/v1         /////
////////////////////////////////////////////////
*/

describe('Testing dm/remove/v1', () => {
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

    const dm = requestDmCreate(creator.token, uIds);

    const output = requestDmRemove('invalid-token', dm.dmId);
    expect(output).toStrictEqual({ error: 'error' });
  });

  test('Testing if error is returned when dmId is invalid', () => {
    const creator = requestAuthRegister('creator@email.com', 'CreatOr1', 'creator', 'ofdm');
    const output = requestDmRemove(creator.token, -1);
    expect(output).toStrictEqual({ error: 'error' });
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

    const dm = requestDmCreate(creator.token, uIds);

    const output = requestDmRemove(member1.token, dm.dmId);
    expect(output).toStrictEqual({ error: 'error' });
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

    const output = requestDmCreate(creator.token, uIds);
    requestDmRemove(creator.token, output.dmId);
    const output2 = requestDmList(member1.token);
    expect(output2.dms).toStrictEqual([]);
    const output3 = requestDmList(creator.token);
    expect(output3.dms).toStrictEqual([]);
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
      `${url}:${port}/clear/v1`
  );
}

function requestAuthRegister(email: string, password: string, nameFirst: string, nameLast: string) {
  const res = request(
    'POST',
      `${url}:${port}/auth/register/v2`,
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
  expect(res.statusCode).toStrictEqual(200);
  return JSON.parse(String(res.getBody()));
}

function requestDmCreate(token: string, uIds: Array<number>) {
  const res = request(
    'POST',
      `${url}:${port}/dm/create/v1`,
      {
        body: JSON.stringify({
          token: token,
          uIds: uIds,
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
  );
  expect(res.statusCode).toStrictEqual(200);
  return JSON.parse(String(res.getBody()));
}

function requestDmList(token: string) {
  const res = request(
    'GET',
      `${url}:${port}/dm/list/v1`,
      {
        qs: {
          token: token
        }
      }
  );
  expect(res.statusCode).toStrictEqual(200);
  return JSON.parse(String(res.getBody()));
}

function requestDmRemove(token: string, dmId: number) {
  const res = request(
    'DELETE',
        `${url}:${port}/dm/remove/v1`,
        {
          qs: {
            token: token,
            dmId: dmId
          }
        }
  );
  expect(res.statusCode).toStrictEqual(200);
  return JSON.parse(String(res.getBody()));
}

function requestDmDetails(token: string, dmId: number) {
  const res = request(
    'GET',
      `${url}:${port}/dm/details/v1`,
      {
        qs: {
          token: token,
          dmId: dmId,
        }
      }
  );
  expect(res.statusCode).toStrictEqual(200);
  return JSON.parse(String(res.getBody()));
}
function requestUserProfile(token: string, uId: number) {
  const res = request(
    'GET',
      `${url}:${port}/user/profile/v2`,
      {
        qs: {
          token: token,
          uID: uId,
        }
      }
  );
  expect(res.statusCode).toStrictEqual(200);
  return JSON.parse(String(res.getBody()));
}
