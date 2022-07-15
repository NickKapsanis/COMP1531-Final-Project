import request from 'sync-request';
// import { PORT, HOST } from './server';
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

// goes through server to call channelJoinV2
const channelJoin = (tokens: string, channelIds: number) => {
  const res = request(
    'POST', url + '/channel/join/v2',
    {
      body: JSON.stringify({ token: tokens, channelId: channelIds }),
      headers: {
        'Content-type': 'application/json',
      },
    }
  );
  return JSON.parse(String(res.getBody()));
};

// lists channels
const channelsListV2 = (tokens: string) => {
  const res = request(
    'GET', url + '/channels/list/v2',
    {
      qs: { token: tokens },
    }
  );
  return JSON.parse(String(res.getBody()));
};

/// /////////////////////////////////////////////
/// /////////Tests for channelLeaveV1()//////////
/// /////////////////////////////////////////////

test('tests the case that user isnt in the given channel', () => {
  request('DELETE', url + '/clear/v1');

  const james = createUser('james@gmail.com', 'testPassword123', 'James', 'Brown');
  const rufus = createUser('rufus@gmail.com', 'testPassword123', 'Rufus', 'Green');

  const testCreatedChannel = createChannel(james.token, 'testChannel1', true);

  const res = request(
    'POST',
    url + '/channel/leave/v1',
    {
      body: JSON.stringify({
        token: rufus.token,
        channelId: testCreatedChannel,
      }),
      headers: {
        'Content-type': 'application/json',
      },
    }
  );

  const bodyObj = JSON.parse(res.body as string);
  const JamesChannels = channelsListV2(james.token).channels;
  //console.log(JamesChannels);

  expect(JamesChannels[0].channelId).toEqual(testCreatedChannel.channelId);
  expect(res.statusCode).toBe(200);
  expect(bodyObj).toEqual({ error: 'error' });
});

test('tests the case with only given user in channel', () => {
  request('DELETE', url + '/clear/v1');

  const james = createUser('james@gmail.com', 'testPassword123', 'James', 'Brown');
  const testCreatedChannel = createChannel(james.token, 'testChannel1', true).channelId;

  const res = request(
    'POST',
    url + '/channel/leave/v1',
    {
      body: JSON.stringify({
        token: james.token,
        channelId: testCreatedChannel,
      }),
      headers: {
        'Content-type': 'application/json',
      },
    }
  );

  const bodyObj = JSON.parse(res.body as string);
  const JamesChannels = channelsListV2(james.token).channels;

  expect(JamesChannels).toEqual([]);
  expect(res.statusCode).toBe(200);
  expect(bodyObj).toEqual({});
});

test('tests the general case, channel with multiple people.', () => {
  request('DELETE', url + '/clear/v1');

  const james = createUser('james@gmail.com', 'testPassword123', 'James', 'Brown');
  const rufus = createUser('rufus@gmail.com', 'testPassword123', 'Rufus', 'Green');
  const testCreatedChannel = createChannel(james.token, 'testChannel1', true).channelId;
  channelJoin(rufus.token, testCreatedChannel);

  // james and rufus are both in the channel at this point.

  const res = request(
    'POST',
    url + '/channel/leave/v1',
    {
      body: JSON.stringify({
        token: rufus.token,
        channelId: testCreatedChannel,
      }),
      headers: {
        'Content-type': 'application/json',
      },
    }
  );

  const bodyObj = JSON.parse(res.body as string);
  const rufusChannels = channelsListV2(rufus.token).channels;

  expect(rufusChannels).toEqual([]);
  expect(res.statusCode).toBe(200);
  expect(bodyObj).toEqual( {} );
});

test('tests the multiple channels and multiple people.', () => {
  request('DELETE', url + '/clear/v1');

  const james = createUser('james@gmail.com', 'testPassword123', 'James', 'Brown');
  const rufus = createUser('rufus@gmail.com', 'testPassword123', 'Rufus', 'Green');
  const alex = createUser('alex@gmail.com', 'testPassword123', 'Alex', 'John');
  const testCreatedChannel = createChannel(james.token, 'testChannel1', true).channelId;
  const secondTestCreatedChannel = createChannel(james.token, 'testChannel1', true).channelId;
  channelJoin(rufus.token, testCreatedChannel);
  channelJoin(alex.token, secondTestCreatedChannel);

  // james, rufus in testCreatedChannel
  // james, alex in secondTestCreatedChannel

  const res = request(
    'POST',
    url + '/channel/leave/v1',
    {
      body: JSON.stringify({
        token: james.token,
        channelId: testCreatedChannel,
      }),
      headers: {
        'Content-type': 'application/json',
      },
    }
  );

  const bodyObj = JSON.parse(res.body as string);
  const jamesChannels = channelsListV2(james.token).channels;

  expect(jamesChannels[0].channelId).toEqual(secondTestCreatedChannel);
  expect(res.statusCode).toBe(200);
  expect(bodyObj).toEqual({});
});
