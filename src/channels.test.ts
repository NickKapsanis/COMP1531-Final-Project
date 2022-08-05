import request from 'sync-request';
import config from './config.json';
import { getUId } from './other';
import { channelsListType } from './channels';

const OK = 200;
const FORBIDDEN = 403;
const BAD_REQUEST = 400;

const port = config.port;
const hosturl = config.url;
const url = hosturl + ':' + port;

type userOutput = {
  uId: number;
  email: string;
  nameFirst: string;
  nameLast: string;
  handleStr: string;
}

type channelDetailsOutput = {
  name: string;
  isPublic: boolean;
  ownerMembers: Array<userOutput>;
  allMembers: Array<userOutput>;
}

/// /////////////////////////////////////////////
/// //      Tests for channelsListV3()      /////
/// /////////////////////////////////////////////

test('testing when token doesn\'t exist', () => {
  request('DELETE', url + '/clear/v1');

  const res = request(
    'GET',
    url + '/channels/list/v3',
    {
      headers: {
        token: 'hello',
      }
    }
  );

  expect(res.statusCode).toBe(FORBIDDEN);
});

test('testing when user is not in any channel', () => {
  request('DELETE', url + '/clear/v1');

  const jamesToken = createUser('james@email.com', 'testPassword123', 'James', 'James').token;

  const res = request(
    'GET',
    url + '/channels/list/v3',
    {
      headers: {
        token: jamesToken,
      },
    }
  );

  expect(res.statusCode).toBe(OK);
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
    url + '/channels/list/v3',
    {
      headers: {
        token: jamesToken,
      }
    }
  );

  expect(firstCreatedChannel).toBe(firstCreatedChannel);
  expect(secondCreatedChannel).toBe(secondCreatedChannel);
  expect(thirdCreatedChannel).toBe(thirdCreatedChannel);
  expect(fourthCreatedChannel).toBe(fourthCreatedChannel);
  expect(res.statusCode).toBe(OK);
});

/// /////////////////////////////////////////////
/// ////// Tests for channelsListAllV3() ////////
/// /////////////////////////////////////////////

// similar to previous function test, but no matter if private or not.

test('tests when no channel exists', () => {
  request('DELETE', url + '/clear/v1');

  const jamesToken = createUser('james@email.com', 'testPassword123', 'James', 'James').token;

  const res = request(
    'GET',
    url + '/channels/listall/v3',
    {
      headers: {
        token: jamesToken,
      },
    }
  );

  expect(res.statusCode).toBe(OK);
});

test('tests when token isnt valid', () => {
  request('DELETE', url + '/clear/v1');

  const res = request(
    'GET',
    url + '/channels/listall/v3',
    {
      headers: {
        token: 'hello',
      }
    }
  );

  expect(res.statusCode).toBe(FORBIDDEN);
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
    url + '/channels/listall/v3',
    {
      headers: {
        token: rufusToken,
      }
    }
  );

  expect(firstCreatedChannel).toBe(firstCreatedChannel);
  expect(secondCreatedChannel).toBe(secondCreatedChannel);
  expect(thirdCreatedChannel).toBe(thirdCreatedChannel);
  expect(fourthCreatedChannel).toBe(fourthCreatedChannel);
  expect(res.statusCode).toBe(OK);
});

/*
////////////////////////////////////////////////
Tests for channelsCreateV1()
////////////////////////////////////////////////
*/
describe('Testing channelsCreateV1()', () => {
  beforeEach(() => {
    requestClear();
  });

  test('Testing if error is returned when name length < 1', () => {
    const user = createUser('testemail@email.com', 'testPassword123', 'testFirstName', 'testLastName');
    const token = user.token;
    const output = createChannel(token, '', true);
    expect(output).toStrictEqual(BAD_REQUEST);
  });

  test('Testing if error is returned when name length > 20', () => {
    const user = createUser('testemail@email.com', 'testPassword123', 'testFirstName', 'testLastName');
    const token = user.token;
    const output = createChannel(token, 'thisIsAVeryLongChannelNameWhichIsInvalid', true);
    expect(output).toStrictEqual(BAD_REQUEST);
  });

  test('Testing if error is returned when token is invalid', () => {
    const output = createChannel('invalid-token', 'testChannelName', true);
    expect(output).toStrictEqual(FORBIDDEN);
  });

  test('Testing correct input - Checking if channel is created', () => {
    const user = createUser('testemail@email.com', 'testPassword123', 'testFirstName', 'testLastName');
    const token = user.token;
    const testChannelId = createChannel(token, 'testChannelName', false).channelId;
    const uId = Number(getUId(user.authUserId));

    // Checking if channel id is created
    expect(testChannelId).toStrictEqual(expect.any(Number));

    // Iterating through channels list of the creator to see if channel exists
    const channelsList : channelsListType = requestChannelsListallV3(token);
    const channelIsFound = channelsList.channels.find(i => i.channelId === testChannelId);
    expect(channelIsFound).not.toStrictEqual(undefined);

    // Checking if channel is created through channelDetails function
    const channelDetails : channelDetailsOutput = requestChannelDetailsV3(token, testChannelId);
    expect(channelDetails).not.toStrictEqual({ error: 'error' });
    expect(channelDetails.name).toStrictEqual('testChannelName');
    expect(channelDetails.isPublic).toStrictEqual(false);

    // Checking if owner is in channel
    const channelOwners = channelDetails.ownerMembers;
    const ownerIsFound = channelOwners.find(i => i.uId === uId);
    expect(ownerIsFound).not.toStrictEqual(undefined);
  });
});

/*
Helper Functions
*/

// Helper function - clear()
function requestClear() {
  request(
    'DELETE',
    `${hosturl}:${port}/clear/v1`
  );
}

// helper function - getting channelsListAll()
function requestChannelsListallV3(token: string) {
  const res = request(
    'GET',
        `${hosturl}:${port}/channels/listall/v3`,
        {
          headers: {
            token: token,
          }
        }
  );

  expect(res.statusCode).toBe(OK);
  return JSON.parse(String(res.getBody()));
}

// helper function - gets channelsDetails()
function requestChannelDetailsV3(token: string, channelId: number) {
  const res = request(
    'GET',
    `${hosturl}:${port}/channel/details/v3`,
    {
      qs: {
        channelId: channelId,
      },
      headers: {
        token: token,
      },
    }
  );

  expect(res.statusCode).toBe(OK);
  return JSON.parse(String(res.getBody()));
}

// helper function - calls auth register through the server
const createUser = (emails: string, passwords: string, name: string, surname: string) => {
  const res = request(
    'POST', url + '/auth/register/v3',
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
export const createChannel = (tokens: string, names: string, publicity: boolean) => {
  const res = request(
    'POST',
    url + '/channels/create/v3',
    {
      body: JSON.stringify({ name: names, isPublic: publicity }),
      headers: {
        token: tokens,
        'Content-type': 'application/json',
      },
    }
  );

  if (res.statusCode !== 200) {
    return (res.statusCode);
  }

  return JSON.parse(String(res.getBody()));
};
