import request from 'sync-request';
import config from './config.json';

const OK = 200;
const port = config.port;
const url = config.url;

// Testing for channelDetailsV1
describe('Testing channelDetailsV1', () => {
  let token: string;
  let channelId: number;

  beforeEach(() => {
    token = requestAuthRegisterV2('example123@email.com', 'password', 'John', 'Smith').token;
    channelId = requestChannelsCreateV2(token, 'Channel 1', true).channelId;
  });

  afterEach(() => {
    requestClearV1();
  });

  test('Case 1: channelId does not refer to valid channel', () => {
    // Finding an invalid channelId to pass in
    const allChannels = requestChannelsListallV2(token).channels;
    let invalidId = 199;
    for (const i in allChannels) {
      if (invalidId === allChannels[i].channelId) {
        invalidId = invalidId + 100;
      }
    }

    const res = requestChannelDetailsV2(token, invalidId);
    const bodyObj = JSON.parse(String(res.getBody()));

    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({ error: 'error' });
  });

  test('Case 2: authorised user is not a member of channel', () => {
    const memberOf = requestChannelsListV2(token).channels;
    let notMemberId = 199;
    for (const i in memberOf) {
      if (notMemberId === memberOf[i].channelId) {
        notMemberId = notMemberId + 100;
      }
    }

    const res = requestChannelDetailsV2(token, notMemberId);
    const bodyObj = JSON.parse(String(res.getBody()));

    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({ error: 'error' });
  });

  test('Case 3: Deals with all valid arguments', () => {
    const res = requestChannelDetailsV2(token, channelId);
    const bodyObj = JSON.parse(String(res.getBody()));

    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({
      name: 'Channel 1',
      isPublic: true,
      ownerMembers: expect.any(Object),
      allMembers: expect.any(Object),
    });
  });

  // test('Case 4: Deals with invalid/undefined inputs', () => {
  //     const details = channelDetailsV1('', '');
  //     expect(details).toStrictEqual({ error: 'error' });
  // });
});

// Helper function for HTTP calls for channelDetailsV2
function requestChannelDetailsV2(token: string, channelId: number) {
  return request(
    'GET',
        `${url}:${port}/channel/details/v2`,
        {
          qs: {
            token: token,
            channelId: channelId,
          }
        }
  );
}

// Tests for channelMessagesV1
describe('Testing channelMessagesV1', () => {
  let token: string;
  let channelId: number;

  beforeEach(() => {
    token = requestAuthRegisterV2('example123@gmail.com', 'password', 'John', 'Smith').token;
    channelId = requestChannelsCreateV2(token, 'Channel 1', true).channelId;
  });

  afterEach(() => {
    requestClearV1();
  });

  test('Case 1: channelId does not refer to valid channel', () => {
    // Finding an invalid channelId to pass in
    const allChannels = requestChannelsListallV2(token).channels;
    let invalidId = 199;
    for (const i in allChannels) {
      if (invalidId === allChannels[i].channelId) {
        invalidId = invalidId + 100;
      }
    }

    const start = 0;
    const res = requestChannelMessagesV2(token, invalidId, start);
    const bodyObj = JSON.parse(String(res.getBody()));

    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({ error: 'error' });
  });

  test('Case 2: authorised user is not a member of channel', () => {
    const memberOf = requestChannelsListV2(token).channels;
    let notMemberId = 199;
    for (const i in memberOf) {
      if (notMemberId === memberOf[i].channelId) {
        notMemberId = notMemberId + 100;
      }
    }

    const start = 0;
    const res = requestChannelMessagesV2(token, notMemberId, start);
    const bodyObj = JSON.parse(String(res.getBody()));

    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({ error: 'error' });
  });

  test('Case 3: start is greater than total messages in channel', () => {
    const start = 1;
    const res = requestChannelMessagesV2(token, channelId, start);
    const bodyObj = JSON.parse(String(res.getBody()));

    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({ error: 'error' });
  });

  test('Case 4: All valid arguments', () => {
    const start = 0;
    const res = requestChannelMessagesV2(token, channelId, start);
    const bodyObj = JSON.parse(String(res.getBody()));

    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({
      messages: [],
      start: 0,
      end: -1,
    });
  });

  // test('Case 5: Deals with invalid/undefined inputs', () => {
  //     const messages = channelMessagesV1('', '', '');
  //     expect(messages).toStrictEqual({ error: 'error' });
  // });
});

// Helper function for HTTP calls for channelMessagesV2
function requestChannelMessagesV2(token: string, channelId: number, start: number) {
  return request(
    'GET',
          `${url}:${port}/channel/messages/v2`,
          {
            qs: {
              token: token,
              channelId: channelId,
              start: start,
            }
          }
  );
}

/// /////////////////////////////////////////////////////////////////////////////
/// /////////////////////////////////////////////////////////////////////////////
/// /////////////////////        Helper Functions       /////////////////////////
/// /////////////////////////////////////////////////////////////////////////////
/// /////////////////////////////////////////////////////////////////////////////

function requestAuthRegisterV2(email: string, password: string, nameFirst: string, nameLast: string) {
  const res = request(
    'POST',
        `${url}:${port}/auth/register/v2`,
        {
          json: {
            email: email,
            password: password,
            nameFirst: nameFirst,
            nameLast: nameLast
          }
        }
  );

  return JSON.parse(String(res.getBody()));
}

function requestChannelsCreateV2(token: string, name: string, isPublic: boolean) {
  const res = request(
    'POST',
        `${url}:${port}/channels/create/v2`,
        {
          json: {
            token: token,
            name: name,
            isPublic: isPublic,
          }
        }
  );

  return JSON.parse(String(res.getBody()));
}

function requestChannelsListV2(token: string) {
  const res = request(
    'GET',
        `${url}:${port}/channels/list/v2`,
        {
          qs: {
            token: token,
          }
        }
  );

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

  return JSON.parse(String(res.getBody()));
}

function requestClearV1() {
  const res = request(
    'DELETE',
        `${url}:${port}/clear/v1`
  );

  return JSON.parse(String(res.getBody()));
}
