import { channelsListV2, channelsListallV2, channelsCreateV2 } from './channels';
import { authRegisterV1 } from './auth';
import { clearV1, getUId } from './other';
import express from 'express';
import request from 'sync-request';
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




/// /////////////////////////////////////////////
/// //      Tests for channelsListV2()      /////
/// /////////////////////////////////////////////

test('testing when authUserId doesn\'t exist', () => {
  clearV1();

  const james = createUser('james@email.com', 'testPassword123', 'James', 'James');
  const CreatedChannel = channelsCreateV2(james.authUserId, 'James C1', true).channelId;

  const res = request(
    'GET',
    `http://${HOST}:${PORT}/channels/list/v2`,
          {
            qs: {
              token: 'hello',
            }
          }
  );
  const bodyObj = JSON.parse(String(res.getBody()));

  expect(res.statusCode).toBe(200);
  expect(bodyObj).toEqual({ error: 'error' });
});
 



test('testing when user is not in any channel', () => {
  clearV1();
  const jamesAuthId = createUser('james@email.com', 'testPassword123', 'James', 'James').authUserId;

  const res = request(
    'GET',
    `http://${HOST}:${PORT}/channels/list/v2`,
          {
            qs: {
              token: jamesAuthId,
            }
          }
  );
  const bodyObj = JSON.parse(String(res.getBody));

  expect(res.statusCode).toBe(200);
  expect(bodyObj).toEqual([]);
});





test('tests if all correct channels are listed in channel list', () => {
  clearV1();

  const jamesAuthId = createUser('james@email.com', 'testPassword123', 'James', 'James').authUserId;
  const rufusAuthId = createUser('rufus@email.com', 'testPassword123', 'Rufus', 'Rufus').authUserId;

  const firstCreatedChannel = channelsCreateV2(jamesAuthId, 'James C1', true).channelId;
  const secondCreatedChannel = channelsCreateV2(jamesAuthId, 'James C2', false).channelId;
  const thirdCreatedChannel = channelsCreateV2(rufusAuthId, 'Rufus C1', true).channelId;
  const fourthCreatedChannel = channelsCreateV2(jamesAuthId, 'James C3', true).channelId;


    const res = request(
      'GET',
      `http://${HOST}:${PORT}/channels/list/v2`,
            {
              qs: {
                token: jamesAuthId,
              }
            }
    );
    const bodyObj = JSON.parse(String(res.getBody));


  //it used to be:       jamesChannelArray = channelsListV2(jamesAuthId).channels
  //it now is:            res = channelsListV2(jamesAuthId)

  //so replace:           jamesChannelArray = res.channels ???????? or is it something to do with bodyObj???????

  const findC1 = bodyObj.find(i => i.channelId === firstCreatedChannel);
  const findC2 = bodyObj.find(i => i.channelId === secondCreatedChannel);
  const findC3 = bodyObj.find(i => i.channelId === thirdCreatedChannel);
  const findC4 = bodyObj.find(i => i.channelId === fourthCreatedChannel);

  expect(res.statusCode).toBe(200);
  expect(findC1.name).toEqual('James C1');
  expect(findC2.name).toEqual('James C2');
  expect(findC4.name).toEqual('James C3');

  expect(findC1.channelId).toEqual(firstCreatedChannel);
  expect(findC2.channelId).toEqual(secondCreatedChannel);
  expect(findC4.channelId).toEqual(fourthCreatedChannel);
  expect(findC3).toEqual(undefined);
});




/// /////////////////////////////////////////////
/// //    Tests for channelsListAllV2()	   /////
/// /////////////////////////////////////////////

// similar to previous function test, but no matter if private or not.

test('tests when no channel exists', () => {
  clearV1();

  const jamesAuthId = createUser('james@email.com', 'testPassword123', 'James', 'James').authUserId;

  const res = request(
    'GET',
    `http://${HOST}:${PORT}/channels/listall/v2`,
          {
            qs: {
              channelsListallV2: jamesAuthId,
            }
          }
  );
  const bodyObj = JSON.parse(String(res.getBody));

  expect(res.statusCode).toBe(200);
  expect(bodyObj).toEqual([]);
});






test('tests when authUserId does\'nt exist', () => {
  clearV1();

  const jamesAuthId = createUser('james@email.com', 'testPassword123', 'James', 'James').authUserId;
  const CreatedChannel = channelsCreateV2(jamesAuthId, 'James C1', true).channelId;

  const res = request(
    'GET',
    `http://${HOST}:${PORT}/channels/listall/v2`,
          {
            qs: {
              channelsListallV2: 6969,
            }
          }
  );
  const bodyObj = JSON.parse(String(res.getBody));

  expect(res.statusCode).toBe(200);
  expect(bodyObj).toEqual({ error: 'error' });
});




test('tests if all correct channels are listed in channel list', () => {
  clearV1();
    
    const jamesAuthId = createUser('james@email.com', 'testPassword123', 'James', 'James').authUserId;
    const rufusAuthId = createUser('rufus@email.com', 'testPassword123', 'Rufus', 'Rufus').authUserId;

    const firstCreatedChannel = channelsCreateV2(jamesAuthId, 'James C1', false).channelId;
    const secondCreatedChannel = channelsCreateV2(jamesAuthId, 'James C2', false).channelId;
    const thirdCreatedChannel = channelsCreateV2(rufusAuthId, 'Rufus C1', false).channelId;
    const fourthCreatedChannel = channelsCreateV2(jamesAuthId, 'James C3', true).channelId;

    const res = request(
      'GET',
      `http://${HOST}:${PORT}/channels/list/v2`,
            {
              qs: {
                token: rufusAuthId,
              }
            }
    );
    const bodyObj = JSON.parse(String(res.getBody));


  const findC1 = bodyObj.find(i => i.channelId === firstCreatedChannel);
  const findC2 = bodyObj.find(i => i.channelId === secondCreatedChannel);
  const findC3 = bodyObj.find(i => i.channelId === thirdCreatedChannel);
  const findC4 = bodyObj.find(i => i.channelId === fourthCreatedChannel);

  expect(res.statusCode).toBe(200);
  expect(findC1.name).toEqual('James C1');
  expect(findC2.name).toEqual('James C2');
  expect(findC3.name).toEqual('Rufus C1');
  expect(findC4.name).toEqual('James C3');

  expect(findC1.channelId).toEqual(firstCreatedChannel);
  expect(findC2.channelId).toEqual(secondCreatedChannel);
  expect(findC3.channelId).toEqual(thirdCreatedChannel);
  expect(findC4.channelId).toEqual(fourthCreatedChannel);
});






/*



/// /////////////////////////////////////////////
/// //    Tests for channelsCreateV2() 	   /////
/// /////////////////////////////////////////////

describe('Testing channelsCreateV2()', () => {
  test('Testing if error is returned when name length < 1', () => {
    clearV1();
    const testAuthId = authRegisterV1('testemail@email.com', 'testPassword123', 'testFirstName', 'testLastName').authUserId;
    const output = channelsCreateV2(testAuthId, '', true);
    expect(output).toStrictEqual({ error: 'error' });
  });

  test('Testing if error is returned when name length > 20', () => {
    clearV1();
    const testAuthId = authRegisterV1('testemail@email.com', 'testPassword123', 'testFirstName', 'testLastName').authUserId;
    const output = channelsCreateV2(testAuthId, 'thisIsAVeryLongChannelNameWhichIsInvalid', true);
    expect(output).toStrictEqual({ error: 'error' });
  });

  test('Testing if error is returned when authUserId does not exist', () => {
    clearV1();
    const testAuthId = -111;
    const output = channelsCreateV2(testAuthId, 'testChannelName', true);
    expect(output).toStrictEqual({ error: 'error' });
  });

  test('Testing correct input - Checking if channel is created (i)', () => {
    clearV1();
    const testAuthId = authRegisterV1('testemail@email.com', 'testPassword123', 'testFirstName', 'testLastName').authUserId;
    const testChannelId = channelsCreateV2(testAuthId, 'testChannelName', false).channelId;

    // Checking if channel id is created
    expect(testChannelId).toStrictEqual(expect.any(Number));

    // Checking if channel is created and pushed in the datastore
    const allChannels = channelsListallV2(testAuthId).channels;
    const check = allChannels.find(i => i.channelId === testChannelId);
    expect(check.name).toStrictEqual('testChannelName');
  });

  test('Testing correct input - Checking if user is in created channel (ii)', () => {
    clearV1();
    const testAuthId = authRegisterV1('testemail@email.com', 'testPassword123', 'testFirstName', 'testLastName').authUserId;
    const testChannelId = channelsCreateV2(testAuthId, 'testChannelName', true).channelId;

    // Checking if channel is reflected in user's channels
    const testUserChannels = channelsListV2(testAuthId).channels;
    const testChannel1 = testUserChannels.find(i => i.channelId === testChannelId);
    expect(testChannel1.name).toStrictEqual('testChannelName');

    // Checking if user is reflected in channel's all members and user array
    const testUId = getUId(testAuthId);
    const testChannel2 = channelDetailsV1(testAuthId, testChannelId);
    const testAllMembers = testChannel2.allMembers.find(i => i.uId === testUId);
    const testOwnerMembers = testChannel2.ownerMembers.find(i => i.uId === testUId);
    expect(testAllMembers.uId).toStrictEqual(testUId);
    expect(testOwnerMembers.uId).toStrictEqual(testUId);
  });
});

*/