import { authRegisterV1 } from './auth.js'
import { clearV1, getUId } from './other.js'
import { userProfileV1, userSetnameV1, userSetemailV1, userSethandlelV1 } from './users.js'
import request from 'sync-request';
import config from './config.json';



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


////////////////////////////////////////////////
/////      Tests for userSetnameV1() 	     /////
////////////////////////////////////////////////
test('Testing if changing nothing still returns same name.', () => {
  clearV1();

  
  const aliceAuthId = authRegisterV1('alice@email.com', 'testPassword123', 'Alice', 'Smith').authUserId;
  const rufusAuthId = authRegisterV1('rufus@email.com', 'testPassword123', 'Rufus', 'James').authUserId;

  const res = request(
    'PUT',
    url + '/user/profile/setname/v1',
    {
      body: JSON.stringify({
        token: aliceAuthId,
        nameFirst: Alice,
        nameLast: Smith
      }),
      headers: {
        'Content-type': 'application/json',
      },
    }
  );
  const bodyObj = JSON.parse(String(res.getBody()));
  

  expect(res.statusCode).toBe(200);
  expect(bodyObj).toStrictEqual({});
  expect(userProfileV1(aliceAuthId.nameFirst)).toEqual( 'Alice' );
  expect(userProfileV1(aliceAuthId.lastFirst)).toEqual( 'Smith' );


});

test('Testing changing only first name.', () => {

  clearV1();

  const aliceAuthId = authRegisterV1('alice@email.com', 'testPassword123', 'Alice', 'Smith').authUserId;
  const rufusAuthId = authRegisterV1('rufus@email.com', 'testPassword123', 'Rufus', 'James').authUserId;


  const res = request(
    'PUT',
    url + '/user/profile/setname/v1',
    {
      body: JSON.stringify({
        token: aliceAuthId,
        nameFirst: Alison,
        nameLast: Smith
      }),
      headers: {
        'Content-type': 'application/json',
      },
    }
  );
  const bodyObj = JSON.parse(String(res.getBody()));


  expect(res.statusCode).toBe(200);
  expect(bodyObj).toStrictEqual({});
  expect(userProfileV1(aliceAuthId.nameFirst)).toEqual( 'Alison' );
  expect(userProfileV1(aliceAuthId.lastFirst)).toEqual( 'Smith' );


});

test('Testing changing only last name.', () => {

  clearV1();

  const aliceAuthId = authRegisterV1('alice@email.com', 'testPassword123', 'Alice', 'Smith').authUserId;
  const rufusAuthId = authRegisterV1('rufus@email.com', 'testPassword123', 'Rufus', 'James').authUserId;

  
  const res = request(
    'PUT',
    url + '/user/profile/setname/v1',
    {
      body: JSON.stringify({
        token: aliceAuthId,
        nameFirst: Alice,
        nameLast: Sithlord
      }),
      headers: {
        'Content-type': 'application/json',
      },
    }
  );
  const bodyObj = JSON.parse(String(res.getBody()));
  

  expect(res.statusCode).toBe(200);
  expect(bodyObj).toStrictEqual({});
  expect(userProfileV1(aliceAuthId.nameFirst)).toEqual( 'Alice' );
  expect(userProfileV1(aliceAuthId.lastFirst)).toEqual( 'Sithlord' );

});

test('Testing changing both names.', () => {

  clearV1();

  const aliceAuthId = authRegisterV1('alice@email.com', 'testPassword123', 'Alice', 'Smith').authUserId;
  const rufusAuthId = authRegisterV1('rufus@email.com', 'testPassword123', 'Rufus', 'James').authUserId;

  const res = userSetnameV1(aliceAuthId, Alison, Sithlord);


  const res = request(
    'PUT',
    url + '/user/profile/setname/v1',
    {
      body: JSON.stringify({
        token: aliceAuthId,
        nameFirst: Alison,
        nameLast: Sithlord
      }),
      headers: {
        'Content-type': 'application/json',
      },
    }
  );

  const bodyObj = JSON.parse(String(res.getBody()));


  expect(res.statusCode).toBe(200);
  expect(bodyObj).toStrictEqual({});
  expect(userProfileV1(aliceAuthId.nameFirst)).toEqual( 'Alison' );
  expect(userProfileV1(aliceAuthId.lastFirst)).toEqual( 'Sithlord' );

});



////////////////////////////////////////////////
/////      Tests for userSetemailV1() 	   /////
////////////////////////////////////////////////
test('Testing if changing nothing still returns same email.', () => {

  clearV1();

  const aliceAuthId = authRegisterV1('alice@email.com', 'testPassword123', 'Alice', 'Smith').authUserId;


  const res = request(
    'PUT',
    url + '/user/profile/setemail/v1',
    {
      body: JSON.stringify({
        token: aliceAuthId,
        email: 'alice@email.com',
      }),
      headers: {
        'Content-type': 'application/json',
      },
    }
  );
  const bodyObj = JSON.parse(String(res.getBody()));

  expect(userProfileV1(aliceAuthId.email)).toEqual( 'alice@email.com' );


});

test('Testing changing email.', () => {

  clearV1();

  const aliceAuthId = authRegisterV1('alice@email.com', 'testPassword123', 'Alice', 'Smith').authUserId;


  const res = request(
    'PUT',
    url + '/user/profile/setemail/v1',
    {
      body: JSON.stringify({
        token: aliceAuthId,
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
  expect(userProfileV1(aliceAuthId.email)).toEqual( 'supercoolnew@email.com' );

});

////////////////////////////////////////////////
/////      Tests for userSethandleV1() 	   /////
////////////////////////////////////////////////
test('Testing if changing nothing still returns same handle.', () => {

  clearV1();

  const aliceAuthId = authRegisterV1('alice@email.com', 'testPassword123', 'Alice', 'Smith').authUserId;


  const res = request(
    'PUT',
    url + '/user/profile/sethandle/v1',
    {
      body: JSON.stringify({
        token: aliceAuthId,
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
  expect(userProfileV1(aliceAuthId.handleStr)).toEqual( 'alice@AliceSmith' );


});

test('Testing changing handle.', () => {

  clearV1();

  const aliceAuthId = authRegisterV1('alice@email.com', 'testPassword123', 'Alice', 'Smith').authUserId;

  const res = request(
    'PUT',
    url + '/user/profile/sethandle/v1',
    {
      body: JSON.stringify({
        token: aliceAuthId,
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
  expect(userProfileV1(aliceAuthId.handleStr)).toEqual( 'AwesomeNewHandle' );

});