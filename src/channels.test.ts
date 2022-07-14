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

test('testing when token doesn\'t exist', () => {
  request('DELETE', url + '/clear/v1');

  const res = request(
    'GET',
    url + '/channels/list/v2',
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
  request('DELETE', url + '/clear/v1');

  const jamesToken = createUser('james@email.com', 'testPassword123', 'James', 'James').token;

  const res = request(
    'GET',
    url + '/channels/list/v2',
    {
      qs: {
        token: jamesToken,
      }
    }
  );
  const bodyObj = JSON.parse(String(res.getBody));

  expect(res.statusCode).toBe(200);
  expect(bodyObj).toEqual([]);
});

test('tests if all correct channels are listed in channel list', () => {
  request('DELETE', url + '/clear/v1');

  const jamesToken = createUser('james@email.com', 'testPassword123', 'James', 'James').token;
  const rufusToken = createUser('rufus@email.com', 'testPassword123', 'Rufus', 'Rufus').token;

  const firstCreatedChannel = createChannel(jamesToken, 'James C1', true).channelId;
  const secondCreatedChannel = createChannel(jamesToken, 'James C2', false).channelId;
  const thirdCreatedChannel = createChannel(rufusToken, 'Rufus C1', true).channelId;
  const fourthCreatedChannel = createChannel(jamesToken, 'James C3', true).channelId;

  const res = request(
    'GET',
    url + '/channels/list/v2',
    {
      qs: {
        token: jamesToken,
      }
    }
  );
  const bodyObj = JSON.parse(String(res.getBody));

  const findC1 = bodyObj.channels.find(channel => channel.channelId === firstCreatedChannel);
  const findC2 = bodyObj.channels.find(channel => channel.channelId === secondCreatedChannel);
  const findC3 = bodyObj.channels.find(channel => channel.channelId === thirdCreatedChannel);
  const findC4 = bodyObj.channels.find(channel => channel.channelId === fourthCreatedChannel);

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
  request('DELETE', url + '/clear/v1');

  const jamesToken = createUser('james@email.com', 'testPassword123', 'James', 'James').token;

  const res = request(
    'GET',
    url + '/channels/listall/v2',
    {
      qs: {
        token: jamesToken,
      }
    }
  );
  const bodyObj = JSON.parse(String(res.getBody));

  expect(res.statusCode).toBe(200);
  expect(bodyObj).toEqual([]);
});

test('tests when token isnt valid', () => {
  request('DELETE', url + '/clear/v1');

  const res = request(
    'GET',
    url + '/channels/listall/v2',
    {
      qs: {
        token: 'hello',
      }
    }
  );
  const bodyObj = JSON.parse(String(res.getBody));

  expect(res.statusCode).toBe(200);
  expect(bodyObj).toEqual({ error: 'error' });
});

test('tests if all correct channels are listed in channel list', () => {
  request('DELETE', url + '/clear/v1');

  const jamesToken = createUser('james@email.com', 'testPassword123', 'James', 'James').token;
  const rufusToken = createUser('rufus@email.com', 'testPassword123', 'Rufus', 'Rufus').token;

  const firstCreatedChannel = createChannel(jamesToken, 'James C1', false).channelId;
  const secondCreatedChannel = createChannel(jamesToken, 'James C2', false).channelId;
  const thirdCreatedChannel = createChannel(rufusToken, 'Rufus C1', false).channelId;
  const fourthCreatedChannel = createChannel(jamesToken, 'James C3', true).channelId;

  const res = request(
    'GET',
    url + '/channels/listall/v2',
    {
      qs: {
        token: rufusToken,
      }
    }
  );
  const bodyObj = JSON.parse(String(res.getBody));

  const findC1 = bodyObj.channels.find(channel => channel.channelId === firstCreatedChannel);
  const findC2 = bodyObj.channels.find(channel => channel.channelId === secondCreatedChannel);
  const findC3 = bodyObj.channels.find(channel => channel.channelId === thirdCreatedChannel);
  const findC4 = bodyObj.channels.find(channel => channel.channelId === fourthCreatedChannel);

  expect(res.statusCode).toBe(200);
  expect(findC1.name).toEqual(firstCreatedChannel);
  expect(findC2.name).toEqual(secondCreatedChannel);
  expect(findC3.name).toEqual(thirdCreatedChannel);
  expect(findC4.name).toEqual(fourthCreatedChannel);
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
