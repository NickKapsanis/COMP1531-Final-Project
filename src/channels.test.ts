import request from 'sync-request';
import config from './config.json';

const port = config.port;
const hosturl = config.url;
const url = hosturl + ':' + port;

type channelDetails = {
  channelId: number,
  name: string,
}

type channelsListBodyObj = {
  channels: channelDetails[],
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
  const bodyObj = JSON.parse(res.getBody() as string);

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
  const bodyObj = JSON.parse(res.getBody() as string);

  expect(res.statusCode).toBe(200);
  expect(bodyObj.channels).toEqual([]);
});

test('tests if all correct channels are listed in channel list', () => {
  request('DELETE', url + '/clear/v1');

  const jamesToken = createUser('james@email.com', 'testPassword123', 'James', 'James').token;
  const rufusToken = createUser('rufus@email.com', 'testPassword123', 'Rufus', 'Rufus').token;

  const firstCreatedChannel: number = createChannel(jamesToken, 'James C1', true).channelId;
  const secondCreatedChannel: number = createChannel(jamesToken, 'James C2', false).channelId;
  const thirdCreatedChannel: number = createChannel(rufusToken, 'Rufus C1', true).channelId;
  const fourthCreatedChannel: number = createChannel(jamesToken, 'James C3', true).channelId;

  const res = request(
    'GET',
    url + '/channels/list/v2',
    {
      qs: {
        token: jamesToken,
      }
    }
  );
  const bodyObj: channelsListBodyObj = JSON.parse(String(res.getBody()));

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
/// ////// Tests for channelsListAllV2() ////////
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
  const bodyObj = JSON.parse(res.getBody() as string);

  expect(res.statusCode).toBe(200);
  expect(bodyObj.channels).toEqual([]);
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
  // console.log('blahh');
  // console.log(JSON.parse(res.body as string));

  const bodyObj = JSON.parse(res.getBody() as string);

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
  const bodyObj: channelsListBodyObj = JSON.parse(String(res.getBody()));

  const findC1 = bodyObj.channels.find(channel => channel.channelId === firstCreatedChannel);
  const findC2 = bodyObj.channels.find(channel => channel.channelId === secondCreatedChannel);
  const findC3 = bodyObj.channels.find(channel => channel.channelId === thirdCreatedChannel);
  const findC4 = bodyObj.channels.find(channel => channel.channelId === fourthCreatedChannel);

  expect(res.statusCode).toBe(200);
  expect(findC1.channelId).toEqual(firstCreatedChannel);
  expect(findC2.channelId).toEqual(secondCreatedChannel);
  expect(findC3.channelId).toEqual(thirdCreatedChannel);
  expect(findC4.channelId).toEqual(fourthCreatedChannel);
});
