/*
import { createChannel, createUser, channelJoin } from './channel.test';
import { userSethandlelV1 } from './users';
import { getUId } from './other';

import request from 'sync-request';
import { PORT, HOST } from './server';

const url = 'http://' + HOST + ':' + PORT;

/// /////////////////////////////////////////////
/// //      Tests for userProfileV1() 	     /////
/// /////////////////////////////////////////////

/*
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
/// //      Tests for usersAllV1() 	         /////
/// /////////////////////////////////////////////
/*
describe('Testing usersAllV1 - should all work if other functions work', () => {
  let james, rufus, alex, rufusChannel, alexUId, rufusUId, jamesUId;

  beforeEach(() => {
    request('DELETE', url + '/clear/v1');

    james = createUser('james@gmail.com', 'testPassword123', 'James', 'Brown');
    jamesUId = getUId(james.authUserId);
    userSethandlelV1(james.token, 'coolJames');

    rufus = createUser('rufus@gmail.com', 'testPassword123', 'Rufus', 'Hayes');
    rufusUId = getUId(rufus.authUserId);
    userSethandlelV1(rufus.token, 'epicRufus');

    alex = createUser('alex@gmail.com', 'testPassword123', 'Alex', 'King');
    alexUId = getUId(alex.authUserId);
    userSethandlelV1(alex.token, 'amazingAlex');

    rufusChannel = createChannel(rufus.authUserId, 'testChannel2', true);
    channelJoin(alex.token, rufusChannel);
  });

  test('test successful case', () => {
    expect(usersAll(james.token)).toEqual([
      { userId: jamesUId, email: 'james@gmail.com', nameFirst: 'James', nameLast: 'Brown', handleStr: 'coolJames' },
      { userId: rufusUId, email: 'rufus@gmail.com', nameFirst: 'Rufus', nameLast: 'Hayes', handleStr: 'epicRufus' },
      { userId: alexUId, email: 'alex@gmail.com', nameFirst: 'Alex', nameLast: 'King', handleStr: 'amazingAlex' },
    ]);
  });
});

const usersAll = (tokens: string) => {
  const res = request(
    'GET', url + '/users/all/v1',
    { qs: { token: tokens } }
  );
  return JSON.parse(String(res.getBody()));
};

*/