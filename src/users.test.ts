import { getUID } from './channel.test';
import { getUId } from './other';
import { user } from './users';

import request from 'sync-request';
import config from './config.json';

const OK = 200;
const port = config.port;
const hosturl = config.url;
const url = hosturl + ':' + port;

/// /////////////////////////////////////////////
// Tests for userProfileV1()
/// /////////////////////////////////////////////

describe('Testing userProfileV1()', () => {
  test('Testing if error is returned if both token and uId do not exist', () => {
    requestClear();
    expect(requestUserProfileV2('invalid-token', -3)).toStrictEqual({ error: 'error' });
  });

  test('Testing if error is returned if token does not exist', () => {
    requestClear();
    const testUser1 = createUser('testemail@email.com', 'testPassword123', 'testFirstName', 'testLastName');
    const uId1 = Number(getUId(testUser1.authUserId));
    expect(requestUserProfileV2('invalid-token', uId1)).toStrictEqual({ error: 'error' });
  });

  test('Testing if error is returned if uId does not exist', () => {
    requestClear();
    const testUser1 = createUser('testemail@email.com', 'testPassword123', 'testFirstName', 'testLastName');
    const token1 = testUser1.token;
    expect(requestUserProfileV2(token1, -1)).toStrictEqual({ error: 'error' });
  });

  test('Testing correct output for when token and uId belong to same person', () => {
    requestClear();
    const testUser1 = createUser('testemail@email.com', 'testPassword123', 'testFirstName', 'testLastName');
    const uId1 = Number(getUId(testUser1.authUserId));
    const token1 = testUser1.token;
    const userProfile1 = requestUserProfileV2(token1, uId1);

    // testing that correct information is being returned of the user
    expect(userProfile1.user.uId).toStrictEqual(uId1);
    expect(userProfile1.user.email).toStrictEqual('testemail@email.com');
    expect(userProfile1.user.nameFirst).toStrictEqual('testFirstName');
    expect(userProfile1.user.nameLast).toStrictEqual('testLastName');
  });

  test('Testing correct output for when authUserId and uId belong to different people', () => {
    requestClear();
    const testUser1 = createUser('testemail@email.com', 'testPassword123', 'testFirstName', 'testLastName');
    const testUser2 = createUser('correct@email.com', 'testPassword123', 'correctFirstName', 'correctLastName');
    const uId2 = Number(getUId(testUser2.authUserId));
    const token1 = testUser1.token;
    const userProfile2 = requestUserProfileV2(token1, uId2);

    // testing that correct information is being returned of the user
    expect(userProfile2.user.uId).toStrictEqual(uId2);
    expect(userProfile2.user.email).toStrictEqual('correct@email.com');
    expect(userProfile2.user.nameFirst).toStrictEqual('correctFirstName');
    expect(userProfile2.user.nameLast).toStrictEqual('correctLastName');
  });
});

/// /////////////////////////////////////////////
/// /////////Tests for userSetnameV1()////////////
/// /////////////////////////////////////////////

test('Testing invalid token case.', () => {
  request('DELETE', url + '/clear/v1');

  const alice = createUser('alice@email.com', 'testPassword123', 'Alice', 'Smith');
  const aliceUid = Number(getUId(alice.authUserId));
  let aliceFirstName = requestUserProfileV2(alice.token, aliceUid).user.nameFirst;
  let aliceLastName = requestUserProfileV2(alice.token, aliceUid).user.nameLast;

  const res = request(
    'PUT',
    url + '/user/profile/setname/v1',
    {
      body: JSON.stringify({
        token: 'aWoogaWoogaWoo',
        nameFirst: aliceFirstName,
        nameLast: aliceLastName
      }),
      headers: {
        'Content-type': 'application/json',
      },
    }
  );
  const bodyObj = JSON.parse(res.getBody() as string);

  aliceFirstName = requestUserProfileV2(alice.token, aliceUid).user.nameFirst;
  aliceLastName = requestUserProfileV2(alice.token, aliceUid).user.nameLast;

  expect(res.statusCode).toBe(200);
  expect(bodyObj).toStrictEqual({ error: 'error' });
  expect(aliceFirstName).toEqual('Alice');
  expect(aliceLastName).toEqual('Smith');
});

test('Testing invalid name change case.', () => {
  request('DELETE', url + '/clear/v1');

  const alice = createUser('alice@email.com', 'testPassword123', 'Alice', 'Smith');
  const aliceUid = Number(getUId(alice.authUserId));
  let aliceFirstName = requestUserProfileV2(alice.token, aliceUid).user.nameFirst;
  let aliceLastName = requestUserProfileV2(alice.token, aliceUid).user.nameLast;

  const res = request(
    'PUT',
    url + '/user/profile/setname/v1',
    {
      body: JSON.stringify({
        token: alice.token,
        nameFirst: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        nameLast: aliceLastName
      }),
      headers: {
        'Content-type': 'application/json',
      },
    }
  );
  const bodyObj = JSON.parse(res.getBody() as string);

  aliceFirstName = requestUserProfileV2(alice.token, aliceUid).user.nameFirst;
  aliceLastName = requestUserProfileV2(alice.token, aliceUid).user.nameLast;

  expect(res.statusCode).toBe(200);
  expect(bodyObj).toStrictEqual({ error: 'error' });
  expect(aliceFirstName).toEqual('Alice');
  expect(aliceLastName).toEqual('Smith');
});

test('Testing if changing nothing still returns same name.', () => {
  request('DELETE', url + '/clear/v1');

  const alice = createUser('alice@email.com', 'testPassword123', 'Alice', 'Smith');
  const aliceUid = Number(getUId(alice.authUserId));
  let aliceFirstName = requestUserProfileV2(alice.token, aliceUid).user.nameFirst;
  let aliceLastName = requestUserProfileV2(alice.token, aliceUid).user.nameLast;

  const res = request(
    'PUT',
    url + '/user/profile/setname/v1',
    {
      body: JSON.stringify({
        token: alice.token,
        nameFirst: aliceFirstName,
        nameLast: aliceLastName
      }),
      headers: {
        'Content-type': 'application/json',
      },
    }
  );
  const bodyObj = JSON.parse(res.getBody() as string);

  aliceFirstName = requestUserProfileV2(alice.token, aliceUid).user.nameFirst;
  aliceLastName = requestUserProfileV2(alice.token, aliceUid).user.nameLast;

  expect(res.statusCode).toBe(200);
  expect(bodyObj).toStrictEqual({});
  expect(aliceFirstName).toEqual('Alice');
  expect(aliceLastName).toEqual('Smith');
});

test('Testing changing only first name.', () => {
  request('DELETE', url + '/clear/v1');

  const alice = createUser('alice@email.com', 'testPassword123', 'Alice', 'Smith');
  const aliceUid = Number(getUId(alice.authUserId));
  let aliceFirstName = requestUserProfileV2(alice.token, aliceUid).user.nameFirst;
  let aliceLastName = requestUserProfileV2(alice.token, aliceUid).user.nameLast;

  const res = request(
    'PUT',
    url + '/user/profile/setname/v1',
    {
      body: JSON.stringify({
        token: alice.token,
        nameFirst: 'Alison',
        nameLast: 'Smith'
      }),
      headers: {
        'Content-type': 'application/json',
      },
    }
  );

  const bodyObj = JSON.parse(String(res.getBody()));

  aliceFirstName = requestUserProfileV2(alice.token, aliceUid).user.nameFirst;
  aliceLastName = requestUserProfileV2(alice.token, aliceUid).user.nameLast;

  expect(res.statusCode).toBe(200);
  expect(bodyObj).toStrictEqual({});
  expect(aliceFirstName).toEqual('Alison');
  expect(aliceLastName).toEqual('Smith');
});

test('Testing changing only last name.', () => {
  request('DELETE', url + '/clear/v1');

  const alice = createUser('alice@email.com', 'testPassword123', 'Alice', 'Smith');
  const aliceUid = Number(getUId(alice.authUserId));
  let aliceFirstName = requestUserProfileV2(alice.token, aliceUid).user.nameFirst;
  let aliceLastName = requestUserProfileV2(alice.token, aliceUid).user.nameLast;

  const res = request(
    'PUT',
    url + '/user/profile/setname/v1',
    {
      body: JSON.stringify({
        token: alice.token,
        nameFirst: 'Alice',
        nameLast: 'Sithlord'
      }),
      headers: {
        'Content-type': 'application/json',
      },
    }
  );
  const bodyObj = JSON.parse(String(res.getBody()));

  aliceFirstName = requestUserProfileV2(alice.token, aliceUid).user.nameFirst;
  aliceLastName = requestUserProfileV2(alice.token, aliceUid).user.nameLast;

  expect(res.statusCode).toBe(200);
  expect(bodyObj).toStrictEqual({});
  expect(aliceFirstName).toEqual('Alice');
  expect(aliceLastName).toEqual('Sithlord');
});

test('Testing changing both names.', () => {
  request('DELETE', url + '/clear/v1');

  const alice = createUser('alice@email.com', 'testPassword123', 'Alice', 'Smith');
  const aliceUid = Number(getUId(alice.authUserId));
  let aliceFirstName = requestUserProfileV2(alice.token, aliceUid).user.nameFirst;
  let aliceLastName = requestUserProfileV2(alice.token, aliceUid).user.nameLast;

  const res = request(
    'PUT',
    url + '/user/profile/setname/v1',
    {
      body: JSON.stringify({
        token: alice.token,
        nameFirst: 'Alison',
        nameLast: 'Sithlord'
      }),
      headers: {
        'Content-type': 'application/json',
      },
    }
  );

  const bodyObj = JSON.parse(String(res.getBody()));

  aliceFirstName = requestUserProfileV2(alice.token, aliceUid).user.nameFirst;
  aliceLastName = requestUserProfileV2(alice.token, aliceUid).user.nameLast;

  expect(res.statusCode).toBe(200);
  expect(bodyObj).toStrictEqual({});
  expect(aliceFirstName).toEqual('Alison');
  expect(aliceLastName).toEqual('Sithlord');
});

/// /////////////////////////////////////////////
/// /////////Tests for userSetemailV1()////////////
/// /////////////////////////////////////////////

test('Testing invalid token.', () => {
  request('DELETE', url + '/clear/v1');

  const alice = createUser('alice@email.com', 'testPassword123', 'Alice', 'Smith');
  const aliceUid = Number(getUId(alice.authUserId));
  let aliceEmail = requestUserProfileV2(alice.token, aliceUid).user.email;

  const res = request(
    'PUT',
    url + '/user/profile/setemail/v1',
    {
      body: JSON.stringify({
        token: 'someInvalidToken',
        email: aliceEmail,
      }),
      headers: {
        'Content-type': 'application/json',
      },
    }
  );
  const bodyObj = JSON.parse(String(res.getBody()));

  aliceEmail = requestUserProfileV2(alice.token, aliceUid).user.email;

  expect(res.statusCode).toBe(200);
  expect(bodyObj).toStrictEqual({ error: 'error' });
  expect(aliceEmail).toEqual('alice@email.com');
});

test('Testing invalid email.', () => {
  request('DELETE', url + '/clear/v1');

  const alice = createUser('alice@email.com', 'testPassword123', 'Alice', 'Smith');
  const aliceUid = Number(getUId(alice.authUserId));
  let aliceEmail = requestUserProfileV2(alice.token, aliceUid).user.email;

  const res = request(
    'PUT',
    url + '/user/profile/setemail/v1',
    {
      body: JSON.stringify({
        token: alice.token,
        email: 'thisIsNotAnEmail',
      }),
      headers: {
        'Content-type': 'application/json',
      },
    }
  );
  const bodyObj = JSON.parse(String(res.getBody()));

  aliceEmail = requestUserProfileV2(alice.token, aliceUid).user.email;

  expect(res.statusCode).toBe(200);
  expect(bodyObj).toStrictEqual({ error: 'error' });
  expect(aliceEmail).toEqual('alice@email.com');
});

test('Testing if changing nothing still returns same email.', () => {
  request('DELETE', url + '/clear/v1');

  const alice = createUser('alice@email.com', 'testPassword123', 'Alice', 'Smith');
  const aliceUid = Number(getUId(alice.authUserId));
  let aliceEmail = requestUserProfileV2(alice.token, aliceUid).user.email;

  const res = request(
    'PUT',
    url + '/user/profile/setemail/v1',
    {
      body: JSON.stringify({
        token: alice.token,
        email: aliceEmail,
      }),
      headers: {
        'Content-type': 'application/json',
      },
    }
  );
  const bodyObj = JSON.parse(String(res.getBody()));

  aliceEmail = requestUserProfileV2(alice.token, aliceUid).user.email;

  expect(res.statusCode).toBe(200);
  expect(bodyObj).toStrictEqual({});
  expect(aliceEmail).toEqual('alice@email.com');
});

test('Testing changing email.', () => {
  request('DELETE', url + '/clear/v1');

  const alice = createUser('alice@email.com', 'testPassword123', 'Alice', 'Smith');
  const aliceUid = Number(getUId(alice.authUserId));
  let aliceEmail = requestUserProfileV2(alice.token, aliceUid).user.email;

  const res = request(
    'PUT',
    url + '/user/profile/setemail/v1',
    {
      body: JSON.stringify({
        token: alice.token,
        email: 'supercoolnew@email.com',
      }),
      headers: {
        'Content-type': 'application/json',
      },
    }
  );
  const bodyObj = JSON.parse(String(res.getBody()));

  aliceEmail = requestUserProfileV2(alice.token, aliceUid).user.email;

  expect(res.statusCode).toBe(200);
  expect(bodyObj).toStrictEqual({});
  expect(aliceEmail).toEqual('supercoolnew@email.com');
});

test('Testing changing email to somebody elses email', () => {
  request('DELETE', url + '/clear/v1');

  const alice = createUser('alice@email.com', 'testPassword123', 'Alice', 'Smith');
  const bob = createUser('bob@email.com', 'testPassword123', 'Bob', 'James');
  const aliceUid = Number(getUId(alice.authUserId));
  const bobUid = Number(getUId(bob.authUserId));
  let aliceEmail = requestUserProfileV2(alice.token, aliceUid).user.email;
  let bobEmail = requestUserProfileV2(bob.token, bobUid).user.email;

  const res = request(
    'PUT',
    url + '/user/profile/setemail/v1',
    {
      body: JSON.stringify({
        token: alice.token,
        email: 'bob@email.com',
      }),
      headers: {
        'Content-type': 'application/json',
      },
    }
  );
  const bodyObj = JSON.parse(String(res.getBody()));

  aliceEmail = requestUserProfileV2(alice.token, aliceUid).user.email;
  bobEmail = requestUserProfileV2(bob.token, bobUid).user.email;

  expect(res.statusCode).toBe(200);
  expect(bodyObj).toStrictEqual({ error: 'error' });
  expect(aliceEmail).toEqual('alice@email.com');
  expect(bobEmail).toEqual('bob@email.com');
});

/// /////////////////////////////////////////////
/// /////////Tests for userSethandleV1()//////////
/// /////////////////////////////////////////////

test('Testing invalid token.', () => {
  request('DELETE', url + '/clear/v1');

  const alice = createUser('alice@email.com', 'testPassword123', 'Alice', 'Smith');
  const aliceUid = Number(getUId(alice.authUserId));
  let aliceHandle = requestUserProfileV2(alice.token, aliceUid).user.handleStr;

  const res = request(
    'PUT',
    url + '/user/profile/sethandle/v1',
    {
      body: JSON.stringify({
        token: 'thisIsNotAValidToken',
        handleStr: aliceHandle,
      }),
      headers: {
        'Content-type': 'application/json',
      },
    }
  );
  const bodyObj = JSON.parse(String(res.getBody()));

  aliceHandle = requestUserProfileV2(alice.token, aliceUid).user.handleStr;

  expect(res.statusCode).toBe(200);
  expect(aliceHandle).toEqual('alicesmith');
  expect(bodyObj).toStrictEqual({ error: 'error' });
});

test('Testing if changing nothing still returns same handle.', () => {
  request('DELETE', url + '/clear/v1');

  const alice = createUser('alice@email.com', 'testPassword123', 'Alice', 'Smith');
  const aliceUid = Number(getUId(alice.authUserId));
  let aliceHandle = requestUserProfileV2(alice.token, aliceUid).user.handleStr;

  const res = request(
    'PUT',
    url + '/user/profile/sethandle/v1',
    {
      body: JSON.stringify({
        token: alice.token,
        handleStr: aliceHandle,
      }),
      headers: {
        'Content-type': 'application/json',
      },
    }
  );
  const bodyObj = JSON.parse(String(res.getBody()));

  aliceHandle = requestUserProfileV2(alice.token, aliceUid).user.handleStr;

  expect(res.statusCode).toBe(200);
  expect(aliceHandle).toEqual('alicesmith');
  expect(bodyObj).toStrictEqual({});
});

test('Testing changing handle.', () => {
  request('DELETE', url + '/clear/v1');

  const alice = createUser('alice@email.com', 'testPassword123', 'Alice', 'Smith');
  const aliceUid = Number(getUId(alice.authUserId));
  let aliceHandle = requestUserProfileV2(alice.token, aliceUid).user.handleStr;

  const res = request(
    'PUT',
    url + '/user/profile/sethandle/v1',
    {
      body: JSON.stringify({
        token: alice.token,
        handleStr: 'AwesomeNewHandle',
      }),
      headers: {
        'Content-type': 'application/json',
      },
    }
  );
  const bodyObj = JSON.parse(String(res.getBody()));

  aliceHandle = requestUserProfileV2(alice.token, aliceUid).user.handleStr;

  expect(res.statusCode).toBe(200);
  expect(bodyObj).toStrictEqual({});
  expect(aliceHandle).toEqual('AwesomeNewHandle');
});

test('Testing invalid new handle name', () => {
  request('DELETE', url + '/clear/v1');

  const alice = createUser('alice@email.com', 'testPassword123', 'Alice', 'Smith');
  const aliceUid = Number(getUId(alice.authUserId));
  let aliceHandle = requestUserProfileV2(alice.token, aliceUid).user.handleStr;

  const res = request(
    'PUT',
    url + '/user/profile/sethandle/v1',
    {
      body: JSON.stringify({
        token: alice.token,
        handleStr: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      }),
      headers: {
        'Content-type': 'application/json',
      },
    }
  );
  const bodyObj = JSON.parse(String(res.getBody()));

  aliceHandle = requestUserProfileV2(alice.token, aliceUid).user.handleStr;

  expect(res.statusCode).toBe(200);
  expect(bodyObj).toStrictEqual({ error: 'error' });
  expect(aliceHandle).toEqual('alicesmith');
});

test('Testing if handle already being used by another user', () => {
  request('DELETE', url + '/clear/v1');

  const alice = createUser('alice@email.com', 'testPassword123', 'Alice', 'Smith');
  const bob = createUser('bob@email.com', 'testPassword123', 'Bob', 'James');
  const aliceUid = Number(getUId(alice.authUserId));
  const bobUid = Number(getUId(bob.authUserId));
  let aliceHandle = requestUserProfileV2(alice.token, aliceUid).user.handleStr;
  const bobHandle = requestUserProfileV2(bob.token, bobUid).user.handleStr;

  const res = request(
    'PUT',
    url + '/user/profile/sethandle/v1',
    {
      body: JSON.stringify({
        token: alice.token,
        handleStr: 'bobjames',
      }),
      headers: {
        'Content-type': 'application/json',
      },
    }
  );
  const bodyObj = JSON.parse(String(res.getBody()));

  aliceHandle = requestUserProfileV2(alice.token, aliceUid).user.handleStr;

  expect(res.statusCode).toBe(200);
  expect(bodyObj).toStrictEqual({ error: 'error' });
  expect(aliceHandle).toEqual('alicesmith');
  expect(bobHandle).toEqual('bobjames');
});

/*
////////////////////////////////////////////////
Helper Functions
////////////////////////////////////////////////
*/

function requestClear() {
  request(
    'DELETE',
    `${hosturl}:${port}/clear/v1`
  );
}

// helper function - calls auth register through the server

const createUser = (emails: string, passwords: string, name: string, surname: string) => {
  const res = request(
    'POST', url + '/auth/register/v2',
    {
      body: JSON.stringify({ email: emails, password: passwords, nameFirst: name, nameLast: surname }),
      headers: {
        'Content-type': 'application/json',
      },
    }
  );
  return JSON.parse(String(res.getBody()));
};

// helper function - calls requestUserProfileV2()
function requestUserProfileV2(token: string, uId: number) {
  const res = request(
    'GET',
    `${hosturl}:${port}/user/profile/v2`,
    {
      qs: {
        token: token,
        uId: uId
      },
    }
  );
  expect(res.statusCode).toBe(OK);
  return JSON.parse(String(res.getBody()));
}

/// /////////////////////////////////////////////
/// ///        Tests for usersAllV1()         ///
/// /////////////////////////////////////////////

type userType = {
  token? : string;
  authUserId? : number;
}

describe('Testing usersAllV1 - should all work if other functions work', () => {
  let james: userType, rufus: userType, alex: userType;
  let alexUId: number, rufusUId: number, jamesUId: number;

  beforeEach(() => {
    request('DELETE', url + '/clear/v1');

    james = createUser('james@gmail.com', 'testPassword123', 'James', 'Brown');
    jamesUId = getUID(james.authUserId);

    rufus = createUser('rufus@gmail.com', 'testPassword123', 'Rufus', 'Hayes');
    rufusUId = getUID(rufus.authUserId);

    alex = createUser('alex@gmail.com', 'testPassword123', 'Alex', 'King');
    alexUId = getUID(alex.authUserId);
  });

  test('test successful case', () => {
    const userArray: user[] = usersAll(james.token);
    expect(userArray.find(i => i.uId === jamesUId)).not.toStrictEqual(undefined);
    expect(userArray.find(i => i.uId === rufusUId)).not.toStrictEqual(undefined);
    expect(userArray.find(i => i.uId === alexUId)).not.toStrictEqual(undefined);
  });
});

const usersAll = (tokens: string) => {
  const res = request(
    'GET', url + '/users/all/v1',
    { qs: { token: tokens } }
  );
  return JSON.parse(String(res.getBody()));
};
