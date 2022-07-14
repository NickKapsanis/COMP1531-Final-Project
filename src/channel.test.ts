import request from 'sync-request';
import config from './config.json';

const OK = 200;
const port = config.port;
const url = config.url;

/*
// Testing for channelDetailsV1
describe('Testing channelDetailsV1', () => {
    let authUserId;
    let channelId;

    beforeEach(() => {
        authUserId = authRegisterV1('example123@email.com', 'password', 'John', 'Smith').authUserId;
        channelId = channelsCreateV1(authUserId, 'Channel 1', true).channelId;
    });

    afterEach(() => {
        clearV1();
    });

    test('Case 1: channelId does not refer to valid channel', () => {
        // Finding an invalid channelId to pass in
        const allChannels = channelsListallV1(authUserId).channels;
        let invalidId = 199;
        for (const i in allChannels) {
            if (invalidId === allChannels[i].channelId) {
                invalidId = invalidId + 100;
            }
        }

        const details = channelDetailsV1(authUserId, invalidId);
        expect(details).toStrictEqual({ error: 'error' });
    });

    test('Case 2: authorised user is not a member of channel', () => {
        const memberOf = channelsListV1(authUserId).channels;
        let notMemberId = 199;
        for (const i in memberOf) {
            if (notMemberId === memberOf[i].channelId) {
                notMemberId = notMemberId + 100;
            }
        }

        const details = channelDetailsV1(authUserId, notMemberId);
        expect(details).toStrictEqual({ error: 'error' });
    });

    test('Case 3: Deals with all valid arguments', () => {
        const details = channelDetailsV1(authUserId, channelId);
        expect(details).toStrictEqual({
            name: 'Channel 1',
            isPublic: true,
            ownerMembers: expect.any(Object),
            allMembers: expect.any(Object),
        })
    });

    test('Case 4: Deals with invalid/undefined inputs', () => {
        const details = channelDetailsV1('', '');
        expect(details).toStrictEqual({ error: 'error' });
    });
});
*/

// Tests for channelMessagesV1
describe('Testing channelMessagesV1', () => {
  let token: string;
  let channelId: number;

  beforeEach(() => {
    token = requestAuthRegisterV2('example123@gmail.com', 'password', 'John', 'Smith');
    channelId = requestChannelsCreateV2(token, 'Channel 1', true);
  });

  afterEach(() => {
    requestClearV1();
  });

  test('Case 1: channelId does not refer to valid channel', () => {
    // Finding an invalid channelId to pass in
    const allChannels = requestChannelsListallV2(token);
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
    const memberOf = requestChannelsListV2(token);
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

/*
////////////////////////////////////////////////
/////       Tests for channelJoinV1()      /////
////////////////////////////////////////////////

test('tests the case that authUserId is invalid', () => {
    clearV1();
    const jamesAuthId = authRegisterV1('james@gmail.com', 'testPassword123', 'James', 'Brown').authUserId;
    const rufusAuthId = authRegisterV1('rufus@gmail.com', 'testPassword123', 'Rufus', 'Greem').authUserId;
    let testCreatedChannel = channelsCreateV1(jamesAuthId, 'testChannel1', true).channelId;
    let output = channelJoinV1('wrongUId', testCreatedChannel);
    expect(output).toStrictEqual({ error : 'error' });
});

test('tests the case that channelId is invalid', () => {
    clearV1();
    const jamesAuthId = authRegisterV1('james@gmail.com', 'testPassword123', 'James', 'Brown').authUserId;
    const rufusAuthId = authRegisterV1('rufus@gmail.com', 'testPassword123', 'Rufus', 'Green').authUserId;
    let testCreatedChannel = channelsCreateV1(jamesAuthId, 'testChannel1', true).channelId;
    let output = channelJoinV1(rufusAuthId, 'wrongChannel');
    expect(output).toStrictEqual({ error : 'error' });
});

test('tests the case that the user is already a member of the channel', () => {
    clearV1();
    const jamesAuthId = authRegisterV1('james@gmail.com', 'testPassword123', 'James', 'Brown').authUserId;
    let testCreatedChannel = channelsCreateV1(jamesAuthId, 'testChannel1', true).channelId;
    let output = channelJoinV1(jamesAuthId, testCreatedChannel);
    expect(output).toStrictEqual({ error : 'error' });
});

test('tests the case that the channel is private and the user is not a global owner', () => {
    clearV1();
    const jamesAuthId = authRegisterV1('james@gmail.com', 'testPassword123', 'James', 'Brown').authUserId;
    const rufusAuthId = authRegisterV1('rufus@gmail.com', 'testPassword123', 'Rufus', 'Green').authUserId;
    let testCreatedChannel = channelsCreateV1(jamesAuthId, 'testChannel1', false).channelId;
    let output = channelJoinV1(rufusAuthId, testCreatedChannel);
    expect(output).toStrictEqual({ error : 'error' });
});

test('tests the case that the channel is private and the user is a global owner', () => {
    clearV1();
    const jamesAuthId = authRegisterV1('james@gmail.com', 'testPassword123', 'James', 'Brown').authUserId;
    const rufusAuthId = authRegisterV1('rufus@gmail.com', 'testPassword123', 'Rufus', 'Green').authUserId;
    let testCreatedChannel = channelsCreateV1(rufusAuthId, 'testChannel1', false).channelId;
    let output = channelJoinV1(jamesAuthId, testCreatedChannel);
    expect(output).toStrictEqual({});
});

test('tests the case of a success', () => {
    clearV1();
    const jamesAuthId = authRegisterV1('james@gmail.com', 'testPassword123', 'James', 'Brown').authUserId;
    const rufusAuthId = authRegisterV1('rufus@gmail.com', 'testPassword123', 'Rufus', 'Green').authUserId;
    const alexAuthId = authRegisterV1('alex@gmail.com', 'bigBrainPassword', 'Alex', 'John').authUserId;
    let testCreatedChannel = channelsCreateV1(jamesAuthId, 'testChannel1', true).channelId;
    let output1 = channelJoinV1(rufusAuthId, testCreatedChannel);
    let output2 = channelJoinV1(alexAuthId, testCreatedChannel);
    expect(output1).toStrictEqual({});
    expect(output2).toStrictEqual({});
});

////////////////////////////////////////////////
/////     Tests for channelInviteV1()      /////
////////////////////////////////////////////////

test('tests the case that user inviting does not exist', () => {
    clearV1();
    const jamesAuthId = authRegisterV1('james@gmail.com', 'testPassword123', 'James', 'Brown').authUserId;
    const rufusAuthId = authRegisterV1('rufus@gmail.com', 'testPassword123', 'Rufus', 'Green').authUserId;
    let testCreatedChannel = channelsCreateV1(jamesAuthId, 'testChannel1', true).channelId;
    let output = channelInviteV1('fakeUser', testCreatedChannel, getUId(rufusAuthId));
    expect(output).toStrictEqual({ error : 'error' });
});

test('tests the case user joining does not exist', () => {
    clearV1();
    const jamesAuthId = authRegisterV1('james@gmail.com', 'testPassword123', 'James', 'Brown').authUserId;
    const rufusAuthId = authRegisterV1('rufus@gmail.com', 'testPassword123', 'Rufus', 'Green').authUserId;
    let testCreatedChannel = channelsCreateV1(jamesAuthId, 'testChannel1', true).channelId;
    let output = channelInviteV1(jamesAuthId, testCreatedChannel, 'fakeUId');
    expect(output).toStrictEqual({ error : 'error' });
});

test('tests the case channel does not exist', () => {
    clearV1();
    const jamesAuthId = authRegisterV1('james@gmail.com', 'testPassword123', 'James', 'Brown').authUserId;
    const rufusAuthId = authRegisterV1('rufus@gmail.com', 'testPassword123', 'Rufus', 'Green').authUserId;
    let testCreatedChannel = channelsCreateV1(jamesAuthId, 'testChannel1', true).channelId;
    let output = channelInviteV1(jamesAuthId, 'fakeChannel', getUId(rufusAuthId));
    expect(output).toStrictEqual({ error : 'error' });
});

test('tests the case channel uId refers to an existing channel member', () => {
    clearV1();
    const jamesAuthId = authRegisterV1('james@gmail.com', 'testPassword123', 'James', 'Brown').authUserId;
    const rufusAuthId = authRegisterV1('rufus@gmail.com', 'testPassword123', 'Rufus', 'Green').authUserId;
    const alexAuthId = authRegisterV1('alex@gmail.com', 'bigBrainPassword', 'Alex', 'John').authUserId;
    let testCreatedChannel = channelsCreateV1(jamesAuthId, 'testChannel1', true).channelId;
    let joinAlex = channelJoinV1(alexAuthId, testCreatedChannel);
    let output = channelInviteV1(jamesAuthId, testCreatedChannel, getUId(alexAuthId));
    expect(output).toStrictEqual({ error : 'error' });
});

test('tests the case that the user inviting is not a member of the channel', () => {
    clearV1();
    const jamesAuthId = authRegisterV1('james@gmail.com', 'testPassword123', 'James', 'Brown').authUserId;
    const rufusAuthId = authRegisterV1('rufus@gmail.com', 'testPassword123', 'Rufus', 'Green').authUserId;
    const alexAuthId = authRegisterV1('alex@gmail.com', 'bigBrainPassword', 'Alex', 'Alex').authUserId;
    let testCreatedChannel = channelsCreateV1(jamesAuthId, 'testChannel1', true).channelId;
    let output = channelInviteV1(alexAuthId, testCreatedChannel, getUId(rufusAuthId));
    expect(output).toStrictEqual({ error : 'error' });
});

test('tests the case that the user invites themself', () => {
    clearV1();
    const jamesAuthId = authRegisterV1('james@gmail.com', 'testPassword123', 'James', 'Brown').authUserId;
    const rufusAuthId = authRegisterV1('rufus@gmail.com', 'testPassword123', 'Rufus', 'Green').authUserId;
    let testCreatedChannel = channelsCreateV1(jamesAuthId, 'testChannel1', true).channelId;
    let output = channelInviteV1(rufusAuthId, testCreatedChannel, getUId(rufusAuthId));
    expect(output).toStrictEqual({ error : 'error' });
});

test('tests the successful case', () => {
    clearV1();
    const jamesAuthId = authRegisterV1('james@gmail.com', 'testPassword123', 'James', 'Brown').authUserId;
    const rufusAuthId = authRegisterV1('rufus@gmail.com', 'testPassword123', 'Rufus', 'Green').authUserId;
    let testCreatedChannel = channelsCreateV1(jamesAuthId, 'testChannel1', true).channelId;
    let output = channelInviteV1(jamesAuthId, testCreatedChannel, getUId(rufusAuthId));
    expect(output).toStrictEqual({});
});

*/

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

  return JSON.parse(String(res.getBody())).token;
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

  return JSON.parse(String(res.getBody())).channelId;
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

  return JSON.parse(String(res.getBody())).channels;
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

  return JSON.parse(String(res.getBody())).channels;
}

function requestClearV1() {
  const res = request(
    'DELETE',
          `${url}:${port}/clear/v1`
  );

  return JSON.parse(String(res.getBody()));
}
