import request from 'sync-request';
import { PORT, HOST } from './server';
import { giveUid } from './dm';

const url = 'http://' + HOST + ':' + PORT;

describe('Testing dm/details/v1', () => {
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
      url + '/dm/details/v1',
      {
        qs: {
          token: user1.token,
          dmId: badDmId
        }
      }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(200);
    expect(bodyObj).toEqual({ error: 'error' });
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
      url + '/dm/details/v1',
      {
        qs: {
          token: user3.token,
          dmId: dm12.dmId,
        }
      }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(200);
    expect(bodyObj).toEqual({ error: 'error' });
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
      url + '/dm/details/v1',
      {
        qs: {
          token: badtoken,
          dmId: dm12.dmId,
        }
      }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(200);
    expect(bodyObj).toEqual({ error: 'error' });
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
      url + '/dm/details/v1',
      {
        qs: {
          token: user2.token,
          dmId: dm12.dmId,
        }
      }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(200);
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
      url + '/dm/details/v1',
      {
        qs: {
          token: user1.token,
          dmId: dm12.dmId,
        }
      }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(200);
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
describe('Testing dm/leave/v1', () => {
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
      url + '/dm/leave/v1',
      {
        body: JSON.stringify({
          token: user1.token,
          dmId: badDmId,
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );
    const bodyObj = JSON.parse(String(res.getBody()));
    expect(bodyObj).toStrictEqual({ error: 'error' });
    expect(res.statusCode).toStrictEqual(200);
  });
  // dmID is valid but authUserId is not a member of the DM
  test('dmId is valid but authUserId is not a member', () => {
    test('dmId is not valid', () => {
      /// ////////////////////////////set up the datastore/////////////////////////////////////////
      const user1 = registerUser('testingUser1@gmail.com', '1234567', 'FirstName1', 'LastName1');
      const user2 = registerUser('testingUser2@gmail.com', '1234567', 'FirstName2', 'LastName2');
      const user3 = registerUser('testingUser3@gmail.com', '1234567', 'FirstName3', 'LastName3');
      const dm12 = startDm(user1.token, [giveUid(user2.authUserId)]);
      /// /////////////////////////////////////////////////////////////////////////////////////////
      const res = request(
        'POST',
        url + '/dm/leave/v1',
        {
          body: JSON.stringify({
            token: user3.token,
            dmId: dm12.dmId,
          }),
          headers: {
            'Content-type': 'application/json',
          },
        }
      );
      const bodyObj = JSON.parse(String(res.getBody()));
      expect(bodyObj).toStrictEqual({ error: 'error' });
      expect(res.statusCode).toStrictEqual(200);
    });
  });
  // token is not valid
  test('token is not valid', () => {
    test('dmId is not valid', () => {
      /// ////////////////////////////set up the datastore/////////////////////////////////////////
      const user1 = registerUser('testingUser1@gmail.com', '1234567', 'FirstName1', 'LastName1');
      const user2 = registerUser('testingUser2@gmail.com', '1234567', 'FirstName2', 'LastName2');
      const dm12 = startDm(user1.token, [giveUid(user2.authUserId)]);
      const badtoken = 'thisisalmostcertainlynotatoken';
      /// /////////////////////////////////////////////////////////////////////////////////////////
      const res = request(
        'POST',
        url + '/dm/leave/v1',
        {
          body: JSON.stringify({
            token: badtoken,
            dmId: dm12.dmId,
          }),
          headers: {
            'Content-type': 'application/json',
          },
        }
      );
      const bodyObj = JSON.parse(String(res.getBody()));
      expect(bodyObj).toStrictEqual({ error: 'error' });
      expect(res.statusCode).toStrictEqual(200);
    });
  });
  // all is correct
  test('testing sucessful call of non owner', () => {
    test('dmId is not valid', () => {
      /// ////////////////////////////set up the datastore/////////////////////////////////////////
      const user1 = registerUser('testingUser1@gmail.com', '1234567', 'FirstName1', 'LastName1');
      const user2 = registerUser('testingUser2@gmail.com', '1234567', 'FirstName2', 'LastName2');
      const dm12 = startDm(user1.token, [giveUid(user2.authUserId)]);
      /// /////////////////////////////////////////////////////////////////////////////////////////
      const res = request(
        'POST',
        url + '/dm/leave/v1',
        {
          body: JSON.stringify({
            token: user2.token,
            dmId: dm12.dmId,
          }),
          headers: {
            'Content-type': 'application/json',
          },
        }
      );
      const bodyObj = JSON.parse(String(res.getBody()));
      expect(res.statusCode).toStrictEqual(200);
      expect(bodyObj).toEqual({});
    });
  });
  // all is correct
  test('testing sucessful call of owner', () => {
    test('dmId is not valid', () => {
      /// ////////////////////////////set up the datastore/////////////////////////////////////////
      const user1 = registerUser('testingUser1@gmail.com', '1234567', 'FirstName1', 'LastName1');
      const user2 = registerUser('testingUser2@gmail.com', '1234567', 'FirstName2', 'LastName2');
      const dm12 = startDm(user1.token, [giveUid(user2.authUserId)]);
      /// /////////////////////////////////////////////////////////////////////////////////////////
      const res = request(
        'POST',
        url + '/dm/leave/v1',
        {
          body: JSON.stringify({
            token: user1.token,
            dmId: dm12.dmId,
          }),
          headers: {
            'Content-type': 'application/json',
          },
        }
      );
      const bodyObj = JSON.parse(String(res.getBody()));
      expect(res.statusCode).toStrictEqual(200);
      expect(bodyObj).toEqual({});
    });
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
    });
  
    afterEach(() => {
    });
  
    
    test('dmId is not valid', () => {
        /// ////////////////////////////set up the datastore/////////////////////////////////////////
        const user1 = registerUser('testingUser1@gmail.com', '1234567', 'FirstName1', 'LastName1');
        const badDmId = -100; // will work regardless as dm has not been created
        /// /////////////////////////////////////////////////////////////////////////////////////////
        const res = request(
        'GET',
        url + '/dm/messages/v1',
        {
            qs: {
            token: user1.token,
            dmId: badDmId,
            start: 10,
            }
        }
        );
        const bodyObj = JSON.parse(res.body as string);
        expect(res.statusCode).toBe(200);
        expect(bodyObj).toEqual({ error: 'error' });
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
          url + '/dm/messages/v1',
          {
            qs: {
              token: user3.token,
              dmId: dm12.dmId,
              start: 10,
            }
          }
        );
        const bodyObj = JSON.parse(res.body as string);
        expect(res.statusCode).toBe(200);
        expect(bodyObj).toEqual({ error: 'error' });
      });
  
    test('start is greater than total messages in channel', () => {
    /// ////////////////////////////set up the datastore/////////////////////////////////////////
    const user1 = registerUser('testingUser1@gmail.com', '1234567', 'FirstName1', 'LastName1');
    const user2 = registerUser('testingUser2@gmail.com', '1234567', 'FirstName2', 'LastName2');
    const dm12 = startDm(user1.token, [giveUid(user2.authUserId)]);
    const start = 10 //there are no messages so any number > 0.
    /// /////////////////////////////////////////////////////////////////////////////////////////
    const res = request(
        'GET',
        url + '/dm/messages/v1',
        {
          qs: {
            token: user1.token,
            dmId: dm12.dmId,
            start: start,
          }
        }
      );
      const bodyObj = JSON.parse(res.body as string);
      expect(res.statusCode).toBe(200);
      expect(bodyObj).toEqual({ error: 'error' });
    });
  
    test('test for sucsessfull input', () => {
    /// ////////////////////////////set up the datastore/////////////////////////////////////////
    const user1 = registerUser('testingUser1@gmail.com', '1234567', 'FirstName1', 'LastName1');
    const user2 = registerUser('testingUser2@gmail.com', '1234567', 'FirstName2', 'LastName2');
    const dm12 = startDm(user1.token, [giveUid(user2.authUserId)]);
    const start = 0 //there are no messages so 0 is the only usable size
    /// /////////////////////////////////////////////////////////////////////////////////////////
    const res = request(
        'GET',
        url + '/dm/messages/v1',
        {
          qs: {
            token: user1.token,
            dmId: dm12.dmId,
            start: start,
          }
        }
      );
    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(200);
    expect(bodyObj).toStrictEqual({
        messages: [],
        start: 0,
        end: -1,
        });
    });
  
  });
  
// ///////////////////////////////////////////////////////////////////////////////////////////
// ///////////////////////////////////////////////////////////////////////////////////////////
// ///////////////////////////////////////////////////////////////////////////////////////////
// ///////////////////////////////////////////////////////////////////////////////////////////
// ///////////////////////////////////////////////////////////////////////////////////////////
// ///////////////////////////////////////////////////////////////////////////////////////////
// testing helper function, registers a user by making an http call. returns the body object of the response
function registerUser(email: string, password: string, nameFirst: string, nameLast: string) {
  const res = request(
    'POST',
    url + '/auth/register/v2',
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
    url + '/dm/create/v1',
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
  return JSON.parse(String(res.getBody()));
}
