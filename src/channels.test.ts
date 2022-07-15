import request from 'sync-request';
import config from './config.json';
import { getUId } from './other';
import { channelsListType } from './channels';
// import { channelDetailsOutput, userOutput } from './channel'

const OK = 200;
const port = config.port;
const url = config.url;

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
    const user = requestAuthRegister();
    const token = user.token;
    const output = requestChannelsCreate(token, '', true);
    expect(output).toStrictEqual({ error: 'error' });
  });

  test('Testing if error is returned when name length > 20', () => {
    const user = requestAuthRegister();
    const token = user.token;
    const output = requestChannelsCreate(token, 'thisIsAVeryLongChannelNameWhichIsInvalid', true);
    expect(output).toStrictEqual({ error: 'error' });
  });

  test('Testing if error is returned when token is invalid', () => {
    const output = requestChannelsCreate('invalid-token', 'testChannelName', true);
    expect(output).toStrictEqual({ error: 'error' });
  });

  test('Testing correct input - Checking if channel is created', () => {
    const user = requestAuthRegister();
    const token = user.token;
    const testChannelId = requestChannelsCreate(token, 'testChannelName', false).channelId;
    const uId = Number(getUId(user.authUserId));

    // Checking if channel id is created
    expect(testChannelId).toStrictEqual(expect.any(Number));

    // Iterating through channels list of the creator to see if channel exists
    const channelsList : channelsListType = requestChannelsListallV2(token);
    const channelIsFound = channelsList.channels.find(i => i.channelId === testChannelId);
    expect(channelIsFound).not.toStrictEqual(undefined);

    // Checking if channel is created through channelDetails function
    const channelDetails : channelDetailsOutput = requestChannelDetailsV2(token, testChannelId);
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

function requestClear() {
  request(
    'DELETE',
    `${url}:${port}/clear/v1`
  );
}

function requestAuthRegister() {
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

  expect(res.statusCode).toBe(OK);
  return JSON.parse(String(res.getBody()));
}

function requestChannelsCreate(token: string, name: string, isPublic: boolean) {
  const res = request(
    'POST',
    `${url}:${port}/channels/create/v2`,
    {
      body: JSON.stringify({
        token: token,
        name: name,
        isPublic: isPublic,
      }),
      headers: {
        'Content-type': 'application/json',
      },
    }
  );
  expect(res.statusCode).toBe(OK);
  return JSON.parse(String(res.getBody()));
}

function requestChannelsListallV2(token: string) {
  const res = request(
    'GET',
        `${url}:${port}/channels/listall/v2`,
        {
          qs: {
            token: token,
          }
        }
  );

  expect(res.statusCode).toBe(OK);
  return JSON.parse(String(res.getBody()));
}

function requestChannelDetailsV2(token: string, channelId: number) {
  const res = request(
    'GET',
    `${url}:${port}/channel/details/v2`,
    {
      qs: {
        token: token,
        channelId: channelId,
      }
    }
  );

  expect(res.statusCode).toBe(OK);
  return JSON.parse(String(res.getBody()));
}
