import { getUId } from './other.js'

import request from 'sync-request';
import config from './config.json';

const OK = 200;
const port = config.port;
const url = config.url;


////////////////////////////////////////////////
/////      Tests for userProfileV1() 	     /////
////////////////////////////////////////////////

describe('Testing userProfileV1()', () => {

  test('Testing if error is returned if both token and uId do not exist', () => {

    requestClear();
    expect(requestUserProfileV2('invalid-token',-3)).toStrictEqual({ error : 'error' });
  
  });

  test('Testing if error is returned if token does not exist', () => {

    requestClear();
    const testUser1 = requestAuthRegister('testemail@email.com', 'testPassword123', 'testFirstName', 'testLastName');
    const uId1 = getUId(testUser1.authUserId);
    expect(requestUserProfileV2(-1, testUId)).toStrictEqual({ error : 'error' });
  
  });

  test('Testing if error is returned if uId does not exist', () => {

    requestClear();
    const testUser1 = requestAuthRegister('testemail@email.com', 'testPassword123', 'testFirstName', 'testLastName');
    const token1 = testUser1.token;
    expect(requestUserProfileV2(token1, -1)).toStrictEqual({ error : 'error' });
  
  });

  test('Testing correct output for when token and uId belong to same person', () => {

    requestClear();
    const testUser1 = requestAuthRegister('testemail@email.com', 'testPassword123', 'testFirstName', 'testLastName');
    const uId1 = getUId(testUser1.authUserId);
    const token1 =  testUser1.token;
    const userProfile1 = requestUserProfileV2(token1, uId1);
    expect(userProfile1.uId).toStrictEqual(uId1);
    expect(userProfile1.email).toStrictEqual('testemail@email.com');
    expect(userProfile1.nameFirst).toStrictEqual('testFirstName');
    expect(userProfile1.nameLast).toStrictEqual('testLastName');

  });

  test('Testing correct output for when authUserId and uId belong to different people', () => {

    requestClear();
    const testUser1 = requestAuthRegister('testemail@email.com', 'testPassword123', 'testFirstName', 'testLastName');
    const testUser2 = requestAuthRegister('correct@email.com', 'testPassword123', 'correctFirstName', 'correctLastName');
    const uId2 = getUId(testUser2.authUserId);
    const token1 =  testUser1.token;
    const userProfile2 = requestUserProfileV2(token1, uId2);

    expect(userProfile2.uId).toStrictEqual(uId2);
    expect(userProfile2.email).toStrictEqual('correct@email.com');
    expect(userProfile2.nameFirst).toStrictEqual('correctFirstName');
    expect(userProfile2.nameLast).toStrictEqual('correctLastName');

  });

});


/*
////////////////////////////////////////////////
/////           Helper Functions      	   /////
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

  return JSON.parse(String(res.getBody()));
}

function requestUserProfileV2(token: string, uId: number) {
  const res = request(
    'GET',
    `${url}:${port}/auth/register/v2`,
    {
      qs: {
        token: token,
        uId: uId
      },
    }
  );

  return JSON.parse(String(res.getBody()));
}