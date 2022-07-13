import { authRegisterV1 } from './auth'
import { clearV1, getUId } from './other'
import { userProfileV1, userSetnameV1, userSetemailV1, userSethandlelV1 } from './users'
import request from 'sync-request';
import config from './config.json';
import { PORT, HOST} from './server';


// helper function - calls auth register through the server

const url = 'http://' + HOST + ':' + PORT;

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

// helper function - calls channelsCreate through the server
const createChannel = (tokens: string, names: string, publicity: boolean) => {
  const res = request(
    'POST', 
    url + '/channels/create/v2',
    {
      body: JSON.stringify({ token: tokens, name: names, isPublic: publicity }),
      headers: {
        'Content-type': 'application/json',
      },
    }
  );
  return JSON.parse(String(res.getBody()));
};


/*

////////////////////////////////////////////////
/////      Tests for userProfileV1() 	     /////
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

////////////////////////////////////////////////
/////      Tests for userSetnameV1() 	     /////
////////////////////////////////////////////////
test('Testing if changing nothing still returns same name.', () => {
  clearV1();
  
  const alice = createUser('alice@email.com', 'testPassword123', 'Alice', 'Smith');
  const rufus = createUser('rufus@email.com', 'testPassword123', 'Rufus', 'James');

  const res = request(
    'PUT',
    `http://${HOST}:${PORT}/user/profile/setname/v1`,
    {
      body: JSON.stringify({
        token: alice.authUserId,
        nameFirst: 'Alice',
        nameLast: 'Smith'
      }),
      headers: {
        'Content-type': 'application/json',
      },
    }
  );
  const bodyObj = JSON.parse(String(res.getBody()));
  

  expect(res.statusCode).toBe(200);
  expect(bodyObj).toStrictEqual({});
  expect(bodyObj.nameFirst).toEqual( 'Alice' );
  expect(bodyObj.nameLast).toEqual( 'Smith' );

});

test('Testing changing only first name.', () => {

  clearV1();

  const alice = createUser('alice@email.com', 'testPassword123', 'Alice', 'Smith');

  const res = request(
    'PUT',
    `http://${HOST}:${PORT}/user/profile/setname/v1`,
    {
      body: JSON.stringify({
        token: alice.authUserId,
        nameFirst: 'Alison',
        nameLast: 'Smith'
      }),
      headers: {
        'Content-type': 'application/json',
      },
    }
  );
  const bodyObj = JSON.parse(String(res.getBody()));


  expect(res.statusCode).toBe(200);
  expect(bodyObj).toStrictEqual({});
  expect(bodyObj.nameFirst).toEqual( 'Alison' );
  expect(bodyObj.nameLast).toEqual( 'Smith' );

});

test('Testing changing only last name.', () => {

  clearV1();

  const alice = createUser('alice@email.com', 'testPassword123', 'Alice', 'Smith');
  const rufus = createUser('rufus@email.com', 'testPassword123', 'Rufus', 'James');

  
  const res = request(
    'PUT',
    `http://${HOST}:${PORT}/user/profile/setname/v1`,
    {
      body: JSON.stringify({
        token: alice.authUserId,
        nameFirst: 'Alice',
        nameLast: 'Sithlord'
      }),
      headers: {
        'Content-type': 'application/json',
      },
    }
  );
  const bodyObj = JSON.parse(String(res.getBody()));
  

  expect(res.statusCode).toBe(200);
  expect(bodyObj).toStrictEqual({});
  expect(bodyObj.nameFirst).toEqual( 'Alice' );
  expect(bodyObj.lastFirst).toEqual( 'Sithlord' );

});

test('Testing changing both names.', () => {

  clearV1();

  const alice = createUser('alice@email.com', 'testPassword123', 'Alice', 'Smith');
  const rufus = createUser('rufus@email.com', 'testPassword123', 'Rufus', 'James');

  const res = request(
    'PUT',
    `http://${HOST}:${PORT}/user/profile/setname/v1`,
    {
      body: JSON.stringify({
        token: alice.authUserId,
        nameFirst: 'Alison',
        nameLast: 'Sithlord'
      }),
      headers: {
        'Content-type': 'application/json',
      },
    }
  );

  const bodyObj = JSON.parse(String(res.getBody()));

  expect(res.statusCode).toBe(200);
  expect(bodyObj).toStrictEqual({});
  expect(bodyObj.nameFirst).toEqual( 'Alison' );
  expect(bodyObj.lastFirst).toEqual( 'Sithlord' );

});



////////////////////////////////////////////////
/////      Tests for userSetemailV1() 	   /////
////////////////////////////////////////////////
test('Testing if changing nothing still returns same email.', () => {

  clearV1();

  const alice = createUser('alice@email.com', 'testPassword123', 'Alice', 'Smith');


  const res = request(
    'PUT',
    `http://${HOST}:${PORT}/user/profile/setemail/v1`,
    {
      body: JSON.stringify({
        token: alice.authUserId,
        email: 'alice@email.com',
      }),
      headers: {
        'Content-type': 'application/json',
      },
    }
  );
  const bodyObj = JSON.parse(String(res.getBody()));

  expect(bodyObj.email).toEqual( 'alice@email.com' );

});

test('Testing changing email.', () => {

  clearV1();

  const alice = createUser('alice@email.com', 'testPassword123', 'Alice', 'Smith');


  const res = request(
    'PUT',
    `http://${HOST}:${PORT}/user/profile/setemail/v1`,
    {
      body: JSON.stringify({
        token: alice.authUserId,
        email: 'supercoolnew@email.com',
      }),
      headers: {
        'Content-type': 'application/json',
      },
    }
  );
  const bodyObj = JSON.parse(String(res.getBody()));


  expect(res.statusCode).toBe(200);
  expect(bodyObj).toStrictEqual({});
  expect(bodyObj.email).toEqual( 'supercoolnew@email.com' );
});

////////////////////////////////////////////////
/////      Tests for userSethandleV1() 	   /////
////////////////////////////////////////////////
test('Testing if changing nothing still returns same handle.', () => {

  clearV1();

  const alice = createUser('alice@email.com', 'testPassword123', 'Alice', 'Smith');


  const res = request(
    'PUT',
    `http://${HOST}:${PORT}/user/profile/sethandle/v1`,
    {
      body: JSON.stringify({
        token: alice.authUserId,
        handleStr: 'AliceSmith',
      }),
      headers: {
        'Content-type': 'application/json',
      },
    }
  );
  const bodyObj = JSON.parse(String(res.getBody()));


  expect(res.statusCode).toBe(200);
  expect(bodyObj).toStrictEqual({});
  expect(bodyObj.handleStr).toEqual( 'alice@AliceSmith' );


});

test('Testing changing handle.', () => {

  clearV1();

  const alice = createUser('alice@email.com', 'testPassword123', 'Alice', 'Smith');

  const res = request(
    'PUT',
    `http://${HOST}:${PORT}/user/profile/sethandle/v1`,
    {
      body: JSON.stringify({
        token: alice.authUserId,
        handleStr: 'AwesomeNewHandle',
      }),
      headers: {
        'Content-type': 'application/json',
      },
    }
  );
  const bodyObj = JSON.parse(String(res.getBody()));


  expect(res.statusCode).toBe(200);
  expect(bodyObj).toStrictEqual({});
  expect(bodyObj.handleStr).toEqual( 'AwesomeNewHandle' );

});