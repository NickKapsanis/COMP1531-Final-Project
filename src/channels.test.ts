import { channelsListV1, channelsListallV1, channelsCreateV1 } from './channels.js';
import { authRegisterV1 } from './auth.js'
import { clearV1, getUId } from './other.js'
import { channelDetailsV1 } from './channel.js'

import request from 'sync-request';
import { PORT, HOST } from './server';

const OK = 200;
const port = PORT;
const url = HOST;

////////////////////////////////////////////////
/////      Tests for channelsListV1() 	   /////
////////////////////////////////////////////////

/*
test('testing when authUserId doesn\'t exist', () => {

  clearV1();
  let somebodyChannelArray = channelsListV1(9690);
  expect(somebodyChannelArray).toEqual({error : 'error'});
  
});

test('testing when user is not in any channel', () => {

  clearV1();
  const jamesAuthId = authRegisterV1('james@email.com', 'testPassword123', 'James', 'James').authUserId;
  let JamesChannelArray = channelsListV1(jamesAuthId).channels;
  expect(JamesChannelArray).toEqual([]);
  
});

test('tests if all correct channels are listed in channel list', () => {

  clearV1();

  const jamesAuthId = authRegisterV1('james@email.com', 'testPassword123', 'James', 'James').authUserId;
  const rufusAuthId = authRegisterV1('rufus@email.com', 'testPassword123', 'Rufus', 'Rufus').authUserId;

  let firstCreatedChannel = channelsCreateV1(jamesAuthId, 'James C1', true).channelId;
  let secondCreatedChannel = channelsCreateV1(jamesAuthId, 'James C2', false).channelId;
  let thirdCreatedChannel = channelsCreateV1(rufusAuthId, 'Rufus C1', true).channelId;
  let fourthCreatedChannel = channelsCreateV1(jamesAuthId, 'James C3', true).channelId;
 
  let jamesChannelArray = channelsListV1(jamesAuthId).channels;
 
  let findC1 = jamesChannelArray.find(i => i.channelId === firstCreatedChannel);
  let findC2 = jamesChannelArray.find(i => i.channelId === secondCreatedChannel);
  let findC3 = jamesChannelArray.find(i => i.channelId === thirdCreatedChannel);
  let findC4 = jamesChannelArray.find(i => i.channelId === fourthCreatedChannel);

  expect(findC1.name).toEqual('James C1');
  expect(findC2.name).toEqual('James C2');
  expect(findC4.name).toEqual('James C3');
 
  expect(findC1.channelId).toEqual(firstCreatedChannel);
  expect(findC2.channelId).toEqual(secondCreatedChannel);
  expect(findC4.channelId).toEqual(fourthCreatedChannel);
  expect(findC3).toEqual(undefined);

});
  
 
test('tests if correct channel properties are listed in channel list', () => {

  clearV1();

  const aliceAuthId = authRegisterV1('Alice@email.com', 'testPassword123', 'Alice', 'Alice').authUserId;
  const damianAuthId = authRegisterV1('Damian@email.com', 'testPassword123', 'Damian', 'Damian').authUserId;

  let firstCreatedChannel = channelsCreateV1(aliceAuthId, 'Alice C1', true).channelId;
  let secondCreatedChannel = channelsCreateV1(aliceAuthId, 'Alice C2', true).channelId;
  let thirdCreatedChannel = channelsCreateV1(damianAuthId, 'Damian C1', false).channelId;
  let fourthCreatedChannel = channelsCreateV1(aliceAuthId, 'Alice C3', true).channelId;
  let fifthCreatedChannel = channelsCreateV1(damianAuthId, 'Damian C2', true).channelId;
 
  let aliceChannelArray = channelsListV1(aliceAuthId).channels;

  let findC1 = aliceChannelArray.find(i => i.channelId === firstCreatedChannel);
  let findC2 = aliceChannelArray.find(i => i.channelId === secondCreatedChannel);
  let findC3 = aliceChannelArray.find(i => i.channelId === thirdCreatedChannel);
  let findC4 = aliceChannelArray.find(i => i.channelId === fourthCreatedChannel);
  let findC5 = aliceChannelArray.find(i => i.channelId === fifthCreatedChannel);
 
  expect(findC1.name).toEqual('Alice C1');
  expect(findC2.name).toEqual('Alice C2');
  expect(findC4.name).toEqual('Alice C3');
 
  expect(findC1.channelId).toEqual(firstCreatedChannel);
  expect(findC2.channelId).toEqual(secondCreatedChannel);
  expect(findC3).toEqual(undefined);
  expect(findC4.channelId).toEqual(fourthCreatedChannel);
  expect(findC5).toEqual(undefined);

  expect(aliceChannelArray.length).toEqual(3);
 
});

////////////////////////////////////////////////
/////    Tests for channelsListAllV1()	   /////
////////////////////////////////////////////////

//similar to previous function test, but no matter if private or not.

test('tests when no channel exists', () => {

  clearV1();
  const jamesAuthId = authRegisterV1('james@email.com', 'testPassword123', 'James', 'James').authUserId;
  let everyChannelArray = channelsListallV1(jamesAuthId).channels;
  expect(everyChannelArray).toEqual([]);

});

test('tests when authUserId does\'nt exist', () => {

  clearV1();
  let everyChannelArray = channelsListallV1(11);
  expect(everyChannelArray).toEqual({error : 'error'});

});

test('tests if all correct channels are listed in channel list', () => {

  clearV1();

  const jamesAuthId = authRegisterV1('james@email.com', 'testPassword123', 'James', 'James').authUserId;
  const rufusAuthId = authRegisterV1('rufus@email.com', 'testPassword123', 'Rufus', 'Rufus').authUserId;

  let firstCreatedChannel = channelsCreateV1(jamesAuthId, 'James C1', false).channelId;
  let secondCreatedChannel = channelsCreateV1(jamesAuthId, 'James C2', false).channelId;
  let thirdCreatedChannel = channelsCreateV1(rufusAuthId, 'Rufus C1', false).channelId;
  let fourthCreatedChannel = channelsCreateV1(jamesAuthId, 'James C3', true).channelId;

  let everyChannelArray = channelsListallV1(rufusAuthId).channels;

  let findC1 = everyChannelArray.find(i => i.channelId === firstCreatedChannel);
  let findC2 = everyChannelArray.find(i => i.channelId === secondCreatedChannel);
  let findC3 = everyChannelArray.find(i => i.channelId === thirdCreatedChannel);
  let findC4 = everyChannelArray.find(i => i.channelId === fourthCreatedChannel);

  expect(findC1.name).toEqual('James C1');
  expect(findC2.name).toEqual('James C2');
  expect(findC3.name).toEqual('Rufus C1');
  expect(findC4.name).toEqual('James C3');

  expect(findC1.channelId).toEqual(firstCreatedChannel);
  expect(findC2.channelId).toEqual(secondCreatedChannel);
  expect(findC3.channelId).toEqual(thirdCreatedChannel);
  expect(findC4.channelId).toEqual(fourthCreatedChannel);

});
 

test('tests if correct channel properties are listed in channel list', () => {

  clearV1();

  const aliceAuthId = authRegisterV1('alice@email.com', 'testPassword123', 'Alice', 'Alice').authUserId;
  const rufusAuthId = authRegisterV1('rufus@email.com', 'testPassword123', 'Rufus', 'Rufus').authUserId;

  let firstCreatedChannel = channelsCreateV1(aliceAuthId, 'Alice C1', false).channelId;
  let secondCreatedChannel = channelsCreateV1(aliceAuthId, 'Alice C2', false).channelId;
  let thirdCreatedChannel = channelsCreateV1(rufusAuthId, 'Rufus C1', false).channelId;
  let fourthCreatedChannel = channelsCreateV1(aliceAuthId, 'Alice C3', true).channelId;

  let everyChannelArray = channelsListallV1(aliceAuthId).channels;

  let findC1 = everyChannelArray.find(i => i.channelId === firstCreatedChannel);
  let findC2 = everyChannelArray.find(i => i.channelId === secondCreatedChannel);
  let findC3 = everyChannelArray.find(i => i.channelId === thirdCreatedChannel);
  let findC4 = everyChannelArray.find(i => i.channelId === fourthCreatedChannel);

  expect(findC1.name).toEqual('Alice C1');
  expect(findC2.name).toEqual('Alice C2');
  expect(findC3.name).toEqual('Rufus C1');
  expect(findC4.name).toEqual('Alice C3');

  expect(findC1.channelId).toEqual(firstCreatedChannel);
  expect(findC2.channelId).toEqual(secondCreatedChannel);
  expect(findC3.channelId).toEqual(thirdCreatedChannel);
  expect(findC4.channelId).toEqual(fourthCreatedChannel);

  expect(everyChannelArray.length).toEqual(4);

});
*/

/*
////////////////////////////////////////////////
/////    Tests for channelsCreateV1() 	   /////
////////////////////////////////////////////////
*/

describe('Testing channelsCreateV1()', () => {
  
  beforeEach(() => {

    requestClear();
    const token = requestAuthRegister();

  });

  test('Testing if error is returned when name length < 1', () => {

    const output = requestChannelsCreate(testAuthId, "", true);
    expect(output).toStrictEqual({ error : 'error' });
  
  });

  test('Testing if error is returned when name length > 20', () => {

    const output = requestChannelsCreate(testAuthId, "thisIsAVeryLongChannelNameWhichIsInvalid", true);
    expect(output).toStrictEqual({ error : 'error' });
  
  });

  test('Testing if error is returned when token is invalid', () => {

    const output = requestChannelsCreate('invalid-token', "testChannelName", true);
    expect(output).toStrictEqual({ error : 'error' });
  
  });

  test('Testing correct input - Checking if channel is created (i)', () => {
    
    const testChannelId = requestChannelsCreate(testAuthId, "testChannelName", false).channelId; 

    // Checking if channel id is created
    expect(testChannelId).toStrictEqual(expect.any(Number));

    // Checking if channel is created and pushed in the datastore
    // const allChannels = channelsListallV1(testAuthId).channels;
    // const check = allChannels.find(i => i.channelId === testChannelId);
    // expect(check['name']).toStrictEqual('testChannelName');

  });

  test('Testing correct input - Checking if user is in created channel (ii)', () => {
    
    const testChannelId = requestChannelsCreate(testAuthId, "testChannelName", true).channelId; 

    // // Checking if channel is reflected in user's channels
    // const testUserChannels = channelsListV1(testAuthId).channels;
    // const testChannel1 = testUserChannels.find(i => i.channelId === testChannelId);
    // expect(testChannel1['name']).toStrictEqual('testChannelName');

    // // Checking if user is reflected in channel's all members and user array
    // const testUId = getUId(testAuthId);
    // const testChannel2 = channelDetailsV1(testAuthId, testChannelId);
    // const testAllMembers = testChannel2.allMembers.find(i => i.uId === testUId);
    // const testOwnerMembers = testChannel2.ownerMembers.find(i => i.uId === testUId);
    // expect(testAllMembers.uId).toStrictEqual(testUId);
    // expect(testOwnerMembers.uId).toStrictEqual(testUId);
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

function requestAuthRegister() : string {
  const res = request(
    'POST',
    `${url}:${port}/auth/register/v2`,
    {
      body: JSON.stringify({
        email: 'testemail@email.com',
        password: 'testPassword123',
        nameFirst: 'testFirstName',
        nameLast: 'testLastName'
      }),
      headers: {
        'Content-type': 'application/json',
      },
    }
  );

  return JSON.parse(String(res.getBody())).token;

}

function requestChannelsCreate(token: string, name: string, isPublic: boolean) : string {
  const res = request(
    'GET',
    `${url}:${port}/channels/create/v2`, 
    {
      qs : {
        token: token,
        name: name,
        isPublic: isPublic,
      },
    }
  );

  return JSON.parse(String(res.getBody()));
}



