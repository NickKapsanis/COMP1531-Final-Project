import request from 'sync-request';
import config from './config.json';

const port = config.port;
const url = config.url;
const FORBID = 403;
const BAD_REQ = 400;

/// ///////////////////////////////////////////////////////////////////
/// /////////////////// Tests for messageReactV1 //////////////////////
/// ///////////////////////////////////////////////////////////////////

test('Testing invalid reactID', () => {
  requestClear();

  const jamesToken = requestAuthUserRegisterV3('james@gmail.com', 'testPassword123', 'James', 'Brown');
  const rufusToken = requestAuthUserRegisterV3('rufus@gmail.com', 'testPassword123', 'Rufus', 'Green');
  const testCreatedChannelID = requestChannelsCreateV2(jamesToken, 'testChannel1', true);
  requestchannelJoinV2(rufusToken, testCreatedChannelID);
  const jamesSentMessageID = requestMessageSendV1(jamesToken, testCreatedChannelID, 'I am james, please react rufus');

  // james and rufus are both in the channel at this point.
  // james has sent a message.

  const res = request(
    'POST',
    `${url}:${port}/message/react/v1`,
    {
      body: JSON.stringify({
        messageId: jamesSentMessageID,
        reactId: 6969,
      }),
      headers: {
        token: rufusToken,
        'Content-type': 'application/json',
      },
    }
  );
  // const bodyObj = JSON.parse(String(res.getBody()));

  expect(res.statusCode).toBe(BAD_REQ);
  // expect(bodyObj).toStrictEqual({"error":{"message":"Invalid reactId"}});

  // now we need to check the message has not been reacted to.
  // expect(data.channels[0].messages[0].reacts.isThisUserReacted).not.toEqual(true);
});

test('Testing invalid token', () => {
  requestClear();

  const jamesToken = requestAuthUserRegisterV3('james@gmail.com', 'testPassword123', 'James', 'Brown');
  const rufusToken = requestAuthUserRegisterV3('rufus@gmail.com', 'testPassword123', 'Rufus', 'Green');
  const testCreatedChannelID = requestChannelsCreateV2(jamesToken, 'testChannel1', true);
  requestchannelJoinV2(rufusToken, testCreatedChannelID);
  const jamesSentMessageID = requestMessageSendV1(jamesToken, testCreatedChannelID, 'I am james, please react rufus');

  // james and rufus are both in the channel at this point.
  // james has sent a message.

  const res = request(
    'POST',
    `${url}:${port}/message/react/v1`,
    {
      body: JSON.stringify({
        messageId: jamesSentMessageID,
        reactId: 1,
      }),
      headers: {
        token: '123456789',
        'Content-type': 'application/json',
      },
    }
  );
  // const bodyObj = JSON.parse(String(res.getBody()));

  expect(res.statusCode).toBe(FORBID);
  // expect(bodyObj).toStrictEqual({});

  // now we need to check the message has been reacted to.
  // .channels[0].messages[0].isThisMessageReacted).toEqual(true);
});

test('tests when user is not in the created channel.', () => {
  requestClear();

  const jamesToken = requestAuthUserRegisterV3('james@gmail.com', 'testPassword123', 'James', 'Brown');
  const rufusToken = requestAuthUserRegisterV3('rufus@gmail.com', 'testPassword123', 'Rufus', 'Green');
  const testCreatedChannelID = requestChannelsCreateV2(jamesToken, 'testChannel1', true);
  const jamesSentMessageID = requestMessageSendV1(jamesToken, testCreatedChannelID, 'I am james, please react rufus');

  // james and rufus are both in the channel at this point.
  // james has sent a message.

  const res = request(
    'POST',
    `${url}:${port}/message/react/v1`,
    {
      body: JSON.stringify({
        messageId: jamesSentMessageID,
        reactId: 1,
      }),
      headers: {
        token: rufusToken,
        'Content-type': 'application/json',
      },
    }
  );
  // const bodyObj = JSON.parse(String(res.getBody()));

  expect(res.statusCode).toBe(400);
  // expect(bodyObj).toStrictEqual({});

  // now we need to check the message has been reacted to.
  // .channels[0].messages[0].isThisMessageReacted).toEqual(true);
});

test('Testing given channel, react to message successfully', () => {
  requestClear();

  const jamesToken = requestAuthUserRegisterV3('james@gmail.com', 'testPassword123', 'James', 'Brown');
  const rufusToken = requestAuthUserRegisterV3('rufus@gmail.com', 'testPassword123', 'Rufus', 'Green');
  const testCreatedChannelID = requestChannelsCreateV2(jamesToken, 'testChannel1', true);
  requestchannelJoinV2(rufusToken, testCreatedChannelID);
  const jamesSentMessageID = requestMessageSendV1(jamesToken, testCreatedChannelID, 'I am james, please react rufus');

  // james and rufus are both in the channel at this point.
  // james has sent a message.

  const res = request(
    'POST',
    `${url}:${port}/message/react/v1`,
    {
      body: JSON.stringify({
        messageId: jamesSentMessageID,
        reactId: 1,
      }),
      headers: {
        token: rufusToken,
        'Content-type': 'application/json',
      },
    }
  );
  // const bodyObj = JSON.parse(String(res.getBody()));

  expect(res.statusCode).toBe(200);
  // expect(bodyObj).toStrictEqual({});

  // now we need to check the message has been reacted to.
  // .channels[0].messages[0].isThisMessageReacted).toEqual(true);
});

test('Testing invalid channel/dm ID', () => {
  requestClear();

  const jamesToken = requestAuthUserRegisterV3('james@gmail.com', 'testPassword123', 'James', 'Brown');
  const rufusToken = requestAuthUserRegisterV3('rufus@gmail.com', 'testPassword123', 'Rufus', 'Green');
  const testCreatedChannelID = requestChannelsCreateV2(jamesToken, 'testChannel1', true);
  requestchannelJoinV2(rufusToken, testCreatedChannelID);
  const jamesSentMessageID = requestMessageSendV1(jamesToken, testCreatedChannelID, 'I am james, please react rufus');

  // james and rufus are both in the channel at this point.
  // james has sent a message.
  // we will give invalid channel ID.

  const res = request(
    'POST',
    `${url}:${port}/message/react/v1`,
    {
      body: JSON.stringify({
        messageId: 69420,
        reactId: 1,
      }),
      headers: {
        token: rufusToken,
        'Content-type': 'application/json',
      },
    }
  );
  // const bodyObj = JSON.parse(String(res.getBody()));

  expect(res.statusCode).toBe(BAD_REQ);
  expect(jamesSentMessageID).toBe(jamesSentMessageID);
  // expect(bodyObj).toStrictEqual({ error: 'error' });

  // now we need to check the message has not been reacted to.
  // expect(data.channels[0].messages[0].isThisMessageReacted).not.toEqual(true);
});

test('Testing reacting to message already been reacted to in channel', () => {
  requestClear();

  const jamesToken = requestAuthUserRegisterV3('james@gmail.com', 'testPassword123', 'James', 'Brown');
  const rufusToken = requestAuthUserRegisterV3('rufus@gmail.com', 'testPassword123', 'Rufus', 'Green');
  const testCreatedChannelID = requestChannelsCreateV2(jamesToken, 'testChannel1', true);
  requestchannelJoinV2(rufusToken, testCreatedChannelID);
  const jamesSentMessageID = requestMessageSendV1(jamesToken, testCreatedChannelID, 'I am james, please react rufus');

  // james and rufus are both in the channel at this point.
  // james has sent a message.

  const res1 = request(
    'POST',
    `${url}:${port}/message/react/v1`,
    {
      body: JSON.stringify({
        messageId: jamesSentMessageID,
        reactId: 1,
      }),
      headers: {
        token: rufusToken,
        'Content-type': 'application/json',
      },
    }
  );

  const res2 = request(
    'POST',
    `${url}:${port}/message/react/v1`,
    {
      body: JSON.stringify({
        messageId: jamesSentMessageID,
        reactId: 1,
      }),
      headers: {
        token: rufusToken,
        'Content-type': 'application/json',
      },
    }
  );
  // const bodyObj = JSON.parse(String(res2.getBody()));

  expect(res1.statusCode).toBe(200);
  expect(res2.statusCode).toBe(BAD_REQ);
  // expect(bodyObj).toStrictEqual({ error: 'error' });

  // just making sure message is still reacted to.
  // expect(data.channels[0].messages[0].isThisMessageReacted).toEqual(true);
});

test('Testing when user is not in given dm', () => {
  requestClear();

  const jamesToken = requestAuthUserRegisterV3('james@gmail.com', 'testPassword123', 'James', 'Brown');
  const rufusToken = requestAuthUserRegisterV3('rufus@gmail.com', 'testPassword123', 'Rufus', 'Green');
  const dmId1 = requestDmCreateV2(jamesToken, [1]);
  const jamesSentMessageID = requestMessageSendDmV1(jamesToken, dmId1, 'I am james, please react rufus');

  // james and rufus are both in the channel at this point.
  // james has sent a message.

  const res = request(
    'POST',
    `${url}:${port}/message/react/v1`,
    {
      body: JSON.stringify({
        messageId: jamesSentMessageID,
        reactId: 1,
      }),
      headers: {
        token: rufusToken,
        'Content-type': 'application/json',
      },
    }
  );
  // const bodyObj = JSON.parse(String(res.getBody()));

  expect(res.statusCode).toBe(400);
  // expect(bodyObj).toStrictEqual({});

  // now we need to check the message has been reacted to.
  // expect(data.channels[0].messages[0].isThisMessageReacted).toEqual(true);
});

test('Testing given dm, react to message successfully', () => {
  requestClear();

  const jamesToken = requestAuthUserRegisterV3('james@gmail.com', 'testPassword123', 'James', 'Brown');
  const rufusToken = requestAuthUserRegisterV3('rufus@gmail.com', 'testPassword123', 'Rufus', 'Green');
  const dmId1 = requestDmCreateV2(jamesToken, [1, 2]);
  const jamesSentMessageID = requestMessageSendDmV1(jamesToken, dmId1, 'I am james, please react rufus');

  // james and rufus are both in the channel at this point.
  // james has sent a message.

  const res = request(
    'POST',
    `${url}:${port}/message/react/v1`,
    {
      body: JSON.stringify({
        messageId: jamesSentMessageID,
        reactId: 1,
      }),
      headers: {
        token: rufusToken,
        'Content-type': 'application/json',
      },
    }
  );
  // const bodyObj = JSON.parse(String(res.getBody()));

  expect(res.statusCode).toBe(200);
  // expect(bodyObj).toStrictEqual({});

  // now we need to check the message has been reacted to.
  // expect(data.channels[0].messages[0].isThisMessageReacted).toEqual(true);
});

test('Testing reacting to message already been reacted to in dm', () => {
  requestClear();

  const jamesToken = requestAuthUserRegisterV3('james@gmail.com', 'testPassword123', 'James', 'Brown');
  const rufusToken = requestAuthUserRegisterV3('rufus@gmail.com', 'testPassword123', 'Rufus', 'Green');
  const dmId1 = requestDmCreateV2(jamesToken, [1, 2]);
  const jamesSentMessageID = requestMessageSendDmV1(jamesToken, dmId1, 'I am james, please react rufus');

  // james and rufus are both in the channel at this point.
  // james has sent a message.

  const res1 = request(
    'POST',
    `${url}:${port}/message/react/v1`,
    {
      body: JSON.stringify({
        messageId: jamesSentMessageID,
        reactId: 1,
      }),
      headers: {
        token: rufusToken,
        'Content-type': 'application/json',
      },
    }
  );

  const res2 = request(
    'POST',
    `${url}:${port}/message/react/v1`,
    {
      body: JSON.stringify({
        messageId: jamesSentMessageID,
        reactId: 1,
      }),
      headers: {
        token: rufusToken,
        'Content-type': 'application/json',
      },
    }
  );
  // const bodyObj = JSON.parse(String(res2.getBody()));

  expect(res1.statusCode).toBe(200);
  expect(res2.statusCode).toBe(BAD_REQ);
  // expect(bodyObj).toStrictEqual({ error: 'error' });

  // just making sure message is still reacted to.
  // expect(data.channels[0].messages[0].isThisMessageReacted).toEqual(true);
});

/// /////////////////////////////////////////////////////////////////////
/// /////////////////// Tests for messageUnreactV1 //////////////////////
/// /////////////////////////////////////////////////////////////////////

test('Testing invalid reactID unreact', () => {
  requestClear();

  const jamesToken = requestAuthUserRegisterV3('james@gmail.com', 'testPassword123', 'James', 'Brown');
  const rufusToken = requestAuthUserRegisterV3('rufus@gmail.com', 'testPassword123', 'Rufus', 'Green');
  const testCreatedChannelID = requestChannelsCreateV2(jamesToken, 'testChannel1', true);
  requestchannelJoinV2(rufusToken, testCreatedChannelID);
  const jamesSentMessageID = requestMessageSendV1(jamesToken, testCreatedChannelID, 'I am james, please react rufus');

  // james and rufus are both in the channel at this point.
  // james has sent a message.

  const res = request(
    'POST',
    `${url}:${port}/message/unreact/v1`,
    {
      body: JSON.stringify({
        messageId: jamesSentMessageID,
        reactId: 6969,
      }),
      headers: {
        token: rufusToken,
        'Content-type': 'application/json',
      },
    }
  );
  // const bodyObj = JSON.parse(String(res.getBody()));

  expect(res.statusCode).toBe(BAD_REQ);
  // expect(bodyObj).toStrictEqual({ error: 'error' });

  // now we need to check the message has not been reacted to.
  // expect(data.channels[0].messages[0].isThisMessageReacted).not.toEqual(true);
});

test('Testing invalid channel/dm ID unreact', () => {
  requestClear();

  const jamesToken = requestAuthUserRegisterV3('james@gmail.com', 'testPassword123', 'James', 'Brown');
  const rufusToken = requestAuthUserRegisterV3('rufus@gmail.com', 'testPassword123', 'Rufus', 'Green');
  const testCreatedChannelID = requestChannelsCreateV2(jamesToken, 'testChannel1', true);
  requestchannelJoinV2(rufusToken, testCreatedChannelID);
  const jamesSentMessageID = requestMessageSendV1(jamesToken, testCreatedChannelID, 'I am james, please react rufus');

  // james and rufus are both in the channel at this point.
  // james has sent a message.
  // we will give invalid channel ID.

  const res = request(
    'POST',
    `${url}:${port}/message/unreact/v1`,
    {
      body: JSON.stringify({
        messageId: 69420,
        reactId: 1,
      }),
      headers: {
        token: rufusToken,
        'Content-type': 'application/json',
      },
    }
  );
  // const bodyObj = JSON.parse(String(res.getBody()));

  expect(res.statusCode).toBe(BAD_REQ);
  expect(jamesSentMessageID).toBe(jamesSentMessageID);
  // expect(bodyObj).toStrictEqual({ error: 'error' });

  // now we need to check the message has not been reacted to.
  // expect(data.channels[0].messages[0].isThisMessageReacted).not.toEqual(true);
});

test('Testing invalid token ID', () => {
  requestClear();

  const jamesToken = requestAuthUserRegisterV3('james@gmail.com', 'testPassword123', 'James', 'Brown');
  const rufusToken = requestAuthUserRegisterV3('rufus@gmail.com', 'testPassword123', 'Rufus', 'Green');
  const testCreatedChannelID = requestChannelsCreateV2(jamesToken, 'testChannel1', true);
  requestchannelJoinV2(rufusToken, testCreatedChannelID);
  const jamesSentMessageID = requestMessageSendV1(jamesToken, testCreatedChannelID, 'I am james, please react rufus');

  // james and rufus are both in the channel at this point.
  // james has sent a message.
  // we will give invalid channel ID.

  const res = request(
    'POST',
    `${url}:${port}/message/unreact/v1`,
    {
      body: JSON.stringify({
        messageId: jamesSentMessageID,
        reactId: 1,
      }),
      headers: {
        token: '123456789',
        'Content-type': 'application/json',
      },
    }
  );
  // const bodyObj = JSON.parse(String(res.getBody()));

  expect(res.statusCode).toBe(FORBID);
  // expect(bodyObj).toStrictEqual({ error: 'error' });

  // now we need to check the message has not been reacted to.
  // expect(data.channels[0].messages[0].isThisMessageReacted).not.toEqual(true);
});

test('Testing given channel, and reacted message, unreact to message successfully', () => {
  requestClear();

  const jamesToken = requestAuthUserRegisterV3('james@gmail.com', 'testPassword123', 'James', 'Brown');
  const rufusToken = requestAuthUserRegisterV3('rufus@gmail.com', 'testPassword123', 'Rufus', 'Green');
  const testCreatedChannelID = requestChannelsCreateV2(jamesToken, 'testChannel1', true);
  requestchannelJoinV2(rufusToken, testCreatedChannelID);
  const jamesSentMessageID = requestMessageSendV1(jamesToken, testCreatedChannelID, 'I am james, please react rufus');

  // james and rufus are both in the channel at this point.
  // james has sent a message.

  const res1 = request(
    'POST',
    `${url}:${port}/message/react/v1`,
    {
      body: JSON.stringify({
        messageId: jamesSentMessageID,
        reactId: 1,
      }),
      headers: {
        token: rufusToken,
        'Content-type': 'application/json',
      },
    }
  );

  const res2 = request(
    'POST',
    `${url}:${port}/message/unreact/v1`,
    {
      body: JSON.stringify({
        messageId: jamesSentMessageID,
        reactId: 1,
      }),
      headers: {
        token: rufusToken,
        'Content-type': 'application/json',
      },
    }
  );
  // const bodyObj = JSON.parse(String(res2.getBody()));

  expect(res1.statusCode).toBe(200);
  expect(res2.statusCode).toBe(200);
  // expect(bodyObj).toStrictEqual({});

  // now we need to check the message has been reacted to.
  // expect(data.channels[0].messages[0].isThisMessageReacted).not.toEqual(true);
});

test('Testing given channel, and reacted message, trying to unreact twice.', () => {
  requestClear();

  const jamesToken = requestAuthUserRegisterV3('james@gmail.com', 'testPassword123', 'James', 'Brown');
  const rufusToken = requestAuthUserRegisterV3('rufus@gmail.com', 'testPassword123', 'Rufus', 'Green');
  const testCreatedChannelID = requestChannelsCreateV2(jamesToken, 'testChannel1', true);
  requestchannelJoinV2(rufusToken, testCreatedChannelID);
  const jamesSentMessageID = requestMessageSendV1(jamesToken, testCreatedChannelID, 'I am james, please react rufus');

  // james and rufus are both in the channel at this point.
  // james has sent a message.

  const res1 = request(
    'POST',
    `${url}:${port}/message/react/v1`,
    {
      body: JSON.stringify({
        messageId: jamesSentMessageID,
        reactId: 1,
      }),
      headers: {
        token: rufusToken,
        'Content-type': 'application/json',
      },
    }
  );

  const res2 = request(
    'POST',
    `${url}:${port}/message/unreact/v1`,
    {
      body: JSON.stringify({
        messageId: jamesSentMessageID,
        reactId: 1,
      }),
      headers: {
        token: rufusToken,
        'Content-type': 'application/json',
      },
    }
  );

  const res3 = request(
    'POST',
    `${url}:${port}/message/unreact/v1`,
    {
      body: JSON.stringify({
        messageId: jamesSentMessageID,
        reactId: 1,
      }),
      headers: {
        token: rufusToken,
        'Content-type': 'application/json',
      },
    }
  );
  // const bodyObj = JSON.parse(String(res2.getBody()));

  expect(res1.statusCode).toBe(200);
  expect(res2.statusCode).toBe(200);
  expect(res3.statusCode).toBe(200);
  // expect(bodyObj).toStrictEqual({});

  // now we need to check the message has been reacted to.
  // expect(data.channels[0].messages[0].isThisMessageReacted).not.toEqual(true);
});

test('Testing given dm, and reacted message, unreact to message successfully', () => {
  requestClear();

  const jamesToken = requestAuthUserRegisterV3('james@gmail.com', 'testPassword123', 'James', 'Brown');
  const rufusToken = requestAuthUserRegisterV3('rufus@gmail.com', 'testPassword123', 'Rufus', 'Green');
  const dmId1 = requestDmCreateV2(jamesToken, [1, 2]);
  const jamesSentMessageID = requestMessageSendDmV1(jamesToken, dmId1, 'I am james, please react rufus');

  // james and rufus are both in the channel at this point.
  // james has sent a message.

  const res1 = request(
    'POST',
    `${url}:${port}/message/react/v1`,
    {
      body: JSON.stringify({
        messageId: jamesSentMessageID,
        reactId: 1,
      }),
      headers: {
        token: rufusToken,
        'Content-type': 'application/json',
      },
    }
  );

  const res2 = request(
    'POST',
    `${url}:${port}/message/unreact/v1`,
    {
      body: JSON.stringify({
        messageId: jamesSentMessageID,
        reactId: 1,
      }),
      headers: {
        token: rufusToken,
        'Content-type': 'application/json',
      },
    }
  );
  // const bodyObj = JSON.parse(String(res2.getBody()));

  expect(res1.statusCode).toBe(200);
  expect(res2.statusCode).toBe(200);
  // expect(bodyObj).toStrictEqual({});

  // now we need to check the message has been reacted to.
  // expect(data.channels[0].messages[0].isThisMessageReacted).not.toEqual(true);
});

test('Testing given dm, and reacted message, trying to unreact twice.', () => {
  requestClear();

  const jamesToken = requestAuthUserRegisterV3('james@gmail.com', 'testPassword123', 'James', 'Brown');
  const rufusToken = requestAuthUserRegisterV3('rufus@gmail.com', 'testPassword123', 'Rufus', 'Green');
  const dmId1 = requestDmCreateV2(jamesToken, [1, 2]);
  const jamesSentMessageID = requestMessageSendDmV1(jamesToken, dmId1, 'I am james, please react rufus');

  // james and rufus are both in the channel at this point.
  // james has sent a message.

  const res1 = request(
    'POST',
    `${url}:${port}/message/react/v1`,
    {
      body: JSON.stringify({
        messageId: jamesSentMessageID,
        reactId: 1,
      }),
      headers: {
        token: rufusToken,
        'Content-type': 'application/json',
      },
    }
  );

  const res2 = request(
    'POST',
    `${url}:${port}/message/unreact/v1`,
    {
      body: JSON.stringify({
        messageId: jamesSentMessageID,
        reactId: 1,
      }),
      headers: {
        token: rufusToken,
        'Content-type': 'application/json',
      },
    }
  );
  const res3 = request(
    'POST',
    `${url}:${port}/message/unreact/v1`,
    {
      body: JSON.stringify({
        messageId: jamesSentMessageID,
        reactId: 1,
      }),
      headers: {
        token: rufusToken,
        'Content-type': 'application/json',
      },
    }
  );
  // const bodyObj = JSON.parse(String(res2.getBody()));

  expect(res1.statusCode).toBe(200);
  expect(res2.statusCode).toBe(200);
  expect(res3.statusCode).toBe(200);
  // expect(bodyObj).toStrictEqual({});

  // now we need to check the message has been reacted to.
  // expect(data.channels[0].messages[0].isThisMessageReacted).not.toEqual(true);
});

/// /////////////////////////////////////////////////////////////////////////////
/// /////////////////////////////////////////////////////////////////////////////
/// /////////////////////        Helper Functions       /////////////////////////
/// /////////////////////////////////////////////////////////////////////////////
/// /////////////////////////////////////////////////////////////////////////////
function requestAuthUserRegisterV3(email: string, password: string, nameFirst: string, nameLast: string) {
  const res = request(
    'POST',
    `${url}:${port}/auth/register/v3`,
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

function requestchannelJoinV2(tokens: string, channelIds: number) {
  const res = request(
    'POST', `${url}:${port}/channel/join/v2`,
    {
      body: JSON.stringify({ token: tokens, channelId: channelIds }),
      headers: {
        'Content-type': 'application/json',
      },
    }
  );
  return JSON.parse(String(res.getBody()));
}

function requestMessageSendV1(token: string, channelId: number, message: string) {
  const res = request(
    'POST',
    `${url}:${port}/message/send/v1`,
    {
      json: {
        token: token,
        channelId: channelId,
        message: message,
      }
    }
  );

  return JSON.parse(String(res.getBody())).messageId;
}

function requestDmCreateV2(token: string, uIds: Array<number>) {
  const res = request(
    'POST',
      `${url}:${port}/dm/create/v2`,
      {
        json: {
          uIds: uIds,
        },
        headers: {
          token: token,
        },
      }
  );

  return JSON.parse(String(res.getBody())).dmId;
}

function requestMessageSendDmV1(token: string, dmId: number, message: string) {
  const res = request(
    'POST',
        `${url}:${port}/message/senddm/v1`,
        {
          json: {
            token: token,
            dmId: dmId,
            message: message,
          },
        }
  );

  return JSON.parse(String(res.getBody())).messageId;
}

function requestClear() {
  const res = request(
    'DELETE',
    `${url}:${port}/clear/v1`
  );

  return JSON.parse(String(res.getBody()));
}
