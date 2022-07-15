import { getUId } from './other';
import { userProfileV2 } from './users';
import request from 'sync-request';
import config from './config.json';

const port = config.port;
const hosturl = config.url;
const url = hosturl + ':' + port;

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

/*

////////////////////////////////////////////////
///////////Tests for userProfileV1()////////////
////////////////////////////////////////////////

describe('Testing userProfileV1()', () => {

  test('Testing if error is returned if both authUserId and uId do not exist', () => {

    clearV1();
    expect(userProfileV1(-1,-3)).toStrictEqual({ error : 'error' });

  });

  test('Testing if error is returned if authUserId does not exist', () => {

    clearV1();
    const testAuthId = authRegisterV1('testemail@email.com', 'testPassword123', 'testFirstName', 'testLastName').authUserId;
    const testUId = getUId(testAuthId);
    expect(userProfileV1(-1, testUId)).toStrictEqual({ error : 'error' });

  });

  test('Testing if error is returned if uId does not exist', () => {

    clearV1();
    const testAuthId = authRegisterV1('testemail@email.com', 'testPassword123', 'testFirstName', 'testLastName').authUserId;
    expect(userProfileV1(testAuthId, -1)).toStrictEqual({ error : 'error' });

  });

  test('Testing correct output for when authUserId and uId belong to same person', () => {

    clearV1();
    const testAuthId = authRegisterV1('testemail@email.com', 'testPassword123', 'testFirstName', 'testLastName').authUserId;
    const testUId = getUId(testAuthId);
    const output =  userProfileV1(testAuthId, testUId);
    expect(output.uId).toStrictEqual(testUId);
    expect(output.email).toStrictEqual('testemail@email.com');
    expect(output.nameFirst).toStrictEqual('testFirstName');
    expect(output.nameLast).toStrictEqual('testLastName');

  });

  test('Testing correct output for when authUserId and uId belong to different people', () => {

    clearV1();
    const testAuthId = authRegisterV1('testemail@email.com', 'testPassword123', 'testFirstName', 'testLastName').authUserId;
    const testAuthId2 = authRegisterV1('correct@email.com', 'correctPassword1', 'correctFirstName', 'correctLastName').authUserId;
    const testUId = getUId(testAuthId2);
    const output =  userProfileV1(testAuthId, testUId);
    expect(output.uId).toStrictEqual(testUId);
    expect(output.email).toStrictEqual('correct@email.com');
    expect(output.nameFirst).toStrictEqual('correctFirstName');
    expect(output.nameLast).toStrictEqual('correctLastName');

  });

});
*/

/// /////////////////////////////////////////////
/// /////////Tests for userSetnameV1()////////////
/// /////////////////////////////////////////////
test('Testing if changing nothing still returns same name.', () => {
  request('DELETE', url + '/clear/v1');

  const alice = createUser('alice@email.com', 'testPassword123', 'Alice', 'Smith');
  const aliceUid = Number(getUId(alice.authUserId));
  let aliceFirstName = userProfileV2(alice.token, aliceUid).user.nameFirst;
  let aliceLastName = userProfileV2(alice.token, aliceUid).user.nameLast;

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
  const bodyObj = JSON.parse(res.body as string);

  aliceFirstName = userProfileV2(alice.token, aliceUid).user.nameFirst;
  aliceLastName = userProfileV2(alice.token, aliceUid).user.nameLast;

  expect(res.statusCode).toBe(200);
  expect(bodyObj).toStrictEqual({});
  expect(aliceFirstName).toEqual('Alice');
  expect(aliceLastName).toEqual('Smith');
});

test('Testing changing only first name.', () => {
  request('DELETE', url + '/clear/v1');

  const alice = createUser('alice@email.com', 'testPassword123', 'Alice', 'Smith');
  const aliceUid = Number(getUId(alice.authUserId));
  let aliceFirstName = userProfileV2(alice.token, aliceUid).user.nameFirst;
  let aliceLastName = userProfileV2(alice.token, aliceUid).user.nameLast;

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

  aliceFirstName = userProfileV2(alice.token, aliceUid).user.nameFirst;
  aliceLastName = userProfileV2(alice.token, aliceUid).user.nameLast;

  expect(res.statusCode).toBe(200);
  expect(bodyObj).toStrictEqual({});
  expect(aliceFirstName).toEqual('Alison');
  expect(aliceLastName).toEqual('Smith');
});

test('Testing changing only last name.', () => {
  request('DELETE', url + '/clear/v1');

  const alice = createUser('alice@email.com', 'testPassword123', 'Alice', 'Smith');
  const aliceUid = Number(getUId(alice.authUserId));
  let aliceFirstName = userProfileV2(alice.token, aliceUid).user.nameFirst;
  let aliceLastName = userProfileV2(alice.token, aliceUid).user.nameLast;

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

  aliceFirstName = userProfileV2(alice.token, aliceUid).user.nameFirst;
  aliceLastName = userProfileV2(alice.token, aliceUid).user.nameLast;

  expect(res.statusCode).toBe(200);
  expect(bodyObj).toStrictEqual({});
  expect(aliceFirstName).toEqual('Alice');
  expect(aliceLastName).toEqual('Sithlord');
});

test('Testing changing both names.', () => {
  request('DELETE', url + '/clear/v1');

  const alice = createUser('alice@email.com', 'testPassword123', 'Alice', 'Smith');
  const aliceUid = Number(getUId(alice.authUserId));
  let aliceFirstName = userProfileV2(alice.token, aliceUid).user.nameFirst;
  let aliceLastName = userProfileV2(alice.token, aliceUid).user.nameLast;

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

  aliceFirstName = userProfileV2(alice.token, aliceUid).user.nameFirst;
  aliceLastName = userProfileV2(alice.token, aliceUid).user.nameLast;

  expect(res.statusCode).toBe(200);
  expect(bodyObj).toStrictEqual({});
  expect(aliceFirstName).toEqual('Alison');
  expect(aliceLastName).toEqual('Sithlord');
});

/// /////////////////////////////////////////////
/// /////////Tests for userSetemailV1()////////////
/// /////////////////////////////////////////////
test('Testing if changing nothing still returns same email.', () => {
  request('DELETE', url + '/clear/v1');

  const alice = createUser('alice@email.com', 'testPassword123', 'Alice', 'Smith');
  const aliceUid = Number(getUId(alice.authUserId));
  let aliceEmail = userProfileV2(alice.token, aliceUid).user.email;

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

  aliceEmail = userProfileV2(alice.token, aliceUid).user.email;

  expect(res.statusCode).toBe(200);
  expect(bodyObj).toStrictEqual({});
  expect(aliceEmail).toEqual('alice@email.com');
});

test('Testing changing email.', () => {
  request('DELETE', url + '/clear/v1');

  const alice = createUser('alice@email.com', 'testPassword123', 'Alice', 'Smith');
  const aliceUid = Number(getUId(alice.authUserId));
  let aliceEmail = userProfileV2(alice.token, aliceUid).user.email;

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

  aliceEmail = userProfileV2(alice.token, aliceUid).user.email;

  expect(res.statusCode).toBe(200);
  expect(bodyObj).toStrictEqual({});
  expect(aliceEmail).toEqual('supercoolnew@email.com');
});

/// /////////////////////////////////////////////
/// /////////Tests for userSethandleV1()//////////
/// /////////////////////////////////////////////
test('Testing if changing nothing still returns same handle.', () => {
  request('DELETE', url + '/clear/v1');

  const alice = createUser('alice@email.com', 'testPassword123', 'Alice', 'Smith');
  const aliceUid = Number(getUId(alice.authUserId));
  let aliceHandle = userProfileV2(alice.token, aliceUid).user.handleStr;

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

  aliceHandle = userProfileV2(alice.token, aliceUid).user.handleStr;

  expect(res.statusCode).toBe(200);
  expect(aliceHandle).toEqual('alicesmith');
  expect(bodyObj).toStrictEqual( {} );
});

test('Testing changing handle.', () => {
  request('DELETE', url + '/clear/v1');

  const alice = createUser('alice@email.com', 'testPassword123', 'Alice', 'Smith');
  const aliceUid = Number(getUId(alice.authUserId));
  let aliceHandle = userProfileV2(alice.token, aliceUid).user.handleStr;

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

  aliceHandle = userProfileV2(alice.token, aliceUid).user.handleStr;

  expect(res.statusCode).toBe(200);
  expect(bodyObj).toStrictEqual({});
  expect(aliceHandle).toEqual('AwesomeNewHandle');
});
