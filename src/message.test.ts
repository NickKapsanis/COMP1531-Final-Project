import request from 'sync-request';
import config from './config.json';


const OK = 200;
const port = config.port;
const url = config.url;

type message = {
  messageId : number;
  uId : number;
  timeSent : number;
  message : string;
  reacts: [];
}

const FORBID = 403;
const BAD_REQ = 400;


// Helper function for message/send/v1 HTTP calls
function testRequestMessageSendV1(token: string, channelId: number, message: string) {
  return request(
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
}

// Helper function for message/senddm/v1 HTTP calls
function testRequestMessageSendDmV1(token: string, dmId: number, message: string) {
  return request(
    'POST',
        `${url}:${port}/message/senddm/v1`,
        {
          json: {
            token: token,
            dmId: dmId,
            message: message,
          }
        }
  );
}

// Helper function for message/edit/v1 HTTP calls
function requestMessageEditV1(token: string, messageId: number, message: string) {
  return request(
    'PUT',
    `${url}:${port}/message/edit/v1`,
    {
      json: {
        token: token,
        messageId: messageId,
        message: message,
      }
    }
  );
}

// Helper function for message/remove/v1 HTTP calls
function requestMessageRemoveV1(token: string, messageId: number) {
  return request(
    'DELETE',
    `${url}:${port}/message/remove/v1`,
    {
      qs: {
        token: token,
        messageId: messageId,
      }
    }
  );
}

//////////////////////////////////////////////////////////////////////
////////////////////// Tests for messageReactV1 //////////////////////
//////////////////////////////////////////////////////////////////////

test('Testing invalid reactID', () => {
  requestClear();

  const jamesToken = requestAuthUserRegisterV3('james@gmail.com', 'testPassword123', 'James', 'Brown');
  const rufusToken = requestAuthUserRegisterV3('rufus@gmail.com', 'testPassword123', 'Rufus', 'Green');
  const testCreatedChannelID = requestChannelsCreateV2(jamesToken, 'testChannel1', true);
  requestchannelJoinV2(rufusToken, testCreatedChannelID);
  const jamesSentMessageID = testRequestMessageSendV1(jamesToken, testCreatedChannelID, 'I am james, please react rufus');

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
  //const bodyObj = JSON.parse(String(res.getBody()));

  expect(res.statusCode).toBe(BAD_REQ);
  //expect(bodyObj).toStrictEqual({"error":{"message":"Invalid reactId"}});

  //now we need to check the message has not been reacted to.
  //expect(data.channels[0].messages[0].reacts.isThisUserReacted).not.toEqual(true);
});

test('Testing invalid token', () => {
  requestClear();

  const jamesToken = requestAuthUserRegisterV3('james@gmail.com', 'testPassword123', 'James', 'Brown');
  const rufusToken = requestAuthUserRegisterV3('rufus@gmail.com', 'testPassword123', 'Rufus', 'Green');
  const testCreatedChannelID = requestChannelsCreateV2(jamesToken, 'testChannel1', true);
  requestchannelJoinV2(rufusToken, testCreatedChannelID);
  const jamesSentMessageID = testRequestMessageSendV1(jamesToken, testCreatedChannelID, 'I am james, please react rufus');

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
  //const bodyObj = JSON.parse(String(res.getBody()));

  expect(res.statusCode).toBe(FORBID);
  //expect(bodyObj).toStrictEqual({});

  //now we need to check the message has been reacted to.
  //.channels[0].messages[0].isThisMessageReacted).toEqual(true);
});




test('Testing given channel, react to message successfully', () => {
  requestClear();

  const jamesToken = requestAuthUserRegisterV3('james@gmail.com', 'testPassword123', 'James', 'Brown');
  const rufusToken = requestAuthUserRegisterV3('rufus@gmail.com', 'testPassword123', 'Rufus', 'Green');
  const testCreatedChannelID = requestChannelsCreateV2(jamesToken, 'testChannel1', true);
  requestchannelJoinV2(rufusToken, testCreatedChannelID);
  const jamesSentMessageID = testRequestMessageSendV1(jamesToken, testCreatedChannelID, 'I am james, please react rufus');

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
  //const bodyObj = JSON.parse(String(res.getBody()));

  expect(res.statusCode).toBe(200);
  //expect(bodyObj).toStrictEqual({});

  //now we need to check the message has been reacted to.
  //.channels[0].messages[0].isThisMessageReacted).toEqual(true);
});




test('Testing invalid channel/dm ID', () => {
  requestClear();

  const jamesToken = requestAuthUserRegisterV3('james@gmail.com', 'testPassword123', 'James', 'Brown');
  const rufusToken = requestAuthUserRegisterV3('rufus@gmail.com', 'testPassword123', 'Rufus', 'Green');
  const testCreatedChannelID = requestChannelsCreateV2(jamesToken, 'testChannel1', true);
  requestchannelJoinV2(rufusToken, testCreatedChannelID);
  const jamesSentMessageID = testRequestMessageSendV1(jamesToken, testCreatedChannelID, 'I am james, please react rufus');

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
  //const bodyObj = JSON.parse(String(res.getBody()));

  expect(res.statusCode).toBe(BAD_REQ);
  //expect(bodyObj).toStrictEqual({ error: 'error' });

  //now we need to check the message has not been reacted to.
  //expect(data.channels[0].messages[0].isThisMessageReacted).not.toEqual(true);
});


test('Testing reacting to message already been reacted to in channel', () => {
  requestClear();

  const jamesToken = requestAuthUserRegisterV3('james@gmail.com', 'testPassword123', 'James', 'Brown');
  const rufusToken = requestAuthUserRegisterV3('rufus@gmail.com', 'testPassword123', 'Rufus', 'Green');
  const testCreatedChannelID = requestChannelsCreateV2(jamesToken, 'testChannel1', true);
  requestchannelJoinV2(rufusToken, testCreatedChannelID);
  const jamesSentMessageID = testRequestMessageSendV1(jamesToken, testCreatedChannelID, 'I am james, please react rufus');

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
  //const bodyObj = JSON.parse(String(res2.getBody()));

  expect(res2.statusCode).toBe(BAD_REQ);
  //expect(bodyObj).toStrictEqual({ error: 'error' });

  //just making sure message is still reacted to.
  //expect(data.channels[0].messages[0].isThisMessageReacted).toEqual(true);
});




test('Testing given dm, react to message successfully', () => {
  requestClear();

  const jamesToken = requestAuthUserRegisterV3('james@gmail.com', 'testPassword123', 'James', 'Brown');
  const rufusToken = requestAuthUserRegisterV3('rufus@gmail.com', 'testPassword123', 'Rufus', 'Green');
  let dmId1 = requestDmCreateV2(jamesToken, [1, 2]);
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
  //const bodyObj = JSON.parse(String(res.getBody()));

  expect(res.statusCode).toBe(200);
  //expect(bodyObj).toStrictEqual({});

  //now we need to check the message has been reacted to.
  //expect(data.channels[0].messages[0].isThisMessageReacted).toEqual(true);
});




test('Testing reacting to message already been reacted to in dm', () => {
  requestClear();

  const jamesToken = requestAuthUserRegisterV3('james@gmail.com', 'testPassword123', 'James', 'Brown');
  const rufusToken = requestAuthUserRegisterV3('rufus@gmail.com', 'testPassword123', 'Rufus', 'Green');
  let dmId1 = requestDmCreateV2(jamesToken, [1, 2]);
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
  //const bodyObj = JSON.parse(String(res2.getBody()));

  expect(res2.statusCode).toBe(BAD_REQ);
  //expect(bodyObj).toStrictEqual({ error: 'error' });

  //just making sure message is still reacted to.
  //expect(data.channels[0].messages[0].isThisMessageReacted).toEqual(true);
});







////////////////////////////////////////////////////////////////////////
////////////////////// Tests for messageUnreactV1 //////////////////////
////////////////////////////////////////////////////////////////////////

test('Testing invalid reactID unreact', () => {
  requestClear();

  const jamesToken = requestAuthUserRegisterV3('james@gmail.com', 'testPassword123', 'James', 'Brown');
  const rufusToken = requestAuthUserRegisterV3('rufus@gmail.com', 'testPassword123', 'Rufus', 'Green');
  const testCreatedChannelID = requestChannelsCreateV2(jamesToken, 'testChannel1', true);
  requestchannelJoinV2(rufusToken, testCreatedChannelID);
  const jamesSentMessageID = testRequestMessageSendV1(jamesToken, testCreatedChannelID, 'I am james, please react rufus');

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
  //const bodyObj = JSON.parse(String(res.getBody()));

  expect(res.statusCode).toBe(BAD_REQ);
  //expect(bodyObj).toStrictEqual({ error: 'error' });

  //now we need to check the message has not been reacted to.
  //expect(data.channels[0].messages[0].isThisMessageReacted).not.toEqual(true);
});


test('Testing invalid channel/dm ID unreact', () => {
  requestClear();

  const jamesToken = requestAuthUserRegisterV3('james@gmail.com', 'testPassword123', 'James', 'Brown');
  const rufusToken = requestAuthUserRegisterV3('rufus@gmail.com', 'testPassword123', 'Rufus', 'Green');
  const testCreatedChannelID = requestChannelsCreateV2(jamesToken, 'testChannel1', true);
  requestchannelJoinV2(rufusToken, testCreatedChannelID);
  const jamesSentMessageID = testRequestMessageSendV1(jamesToken, testCreatedChannelID, 'I am james, please react rufus');

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
  //const bodyObj = JSON.parse(String(res.getBody()));

  expect(res.statusCode).toBe(BAD_REQ);
  //expect(bodyObj).toStrictEqual({ error: 'error' });

  //now we need to check the message has not been reacted to.
  //expect(data.channels[0].messages[0].isThisMessageReacted).not.toEqual(true);
});



test('Testing invalid token ID', () => {
  requestClear();

  const jamesToken = requestAuthUserRegisterV3('james@gmail.com', 'testPassword123', 'James', 'Brown');
  const rufusToken = requestAuthUserRegisterV3('rufus@gmail.com', 'testPassword123', 'Rufus', 'Green');
  const testCreatedChannelID = requestChannelsCreateV2(jamesToken, 'testChannel1', true);
  requestchannelJoinV2(rufusToken, testCreatedChannelID);
  const jamesSentMessageID = testRequestMessageSendV1(jamesToken, testCreatedChannelID, 'I am james, please react rufus');

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
  //const bodyObj = JSON.parse(String(res.getBody()));

  expect(res.statusCode).toBe(FORBID);
  //expect(bodyObj).toStrictEqual({ error: 'error' });

  //now we need to check the message has not been reacted to.
  //expect(data.channels[0].messages[0].isThisMessageReacted).not.toEqual(true);
});




test('Testing given channel, and reacted message, unreact to message successfully', () => {
  requestClear();

  const jamesToken = requestAuthUserRegisterV3('james@gmail.com', 'testPassword123', 'James', 'Brown');
  const rufusToken = requestAuthUserRegisterV3('rufus@gmail.com', 'testPassword123', 'Rufus', 'Green');
  const testCreatedChannelID = requestChannelsCreateV2(jamesToken, 'testChannel1', true);
  requestchannelJoinV2(rufusToken, testCreatedChannelID);
  const jamesSentMessageID = testRequestMessageSendV1(jamesToken, testCreatedChannelID, 'I am james, please react rufus');

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
  //const bodyObj = JSON.parse(String(res2.getBody()));

  expect(res2.statusCode).toBe(200);
  //expect(bodyObj).toStrictEqual({});

  //now we need to check the message has been reacted to.
  //expect(data.channels[0].messages[0].isThisMessageReacted).not.toEqual(true);
});





test('Testing given dm, and reacted message, unreact to message successfully', () => {
  requestClear();


  const jamesToken = requestAuthUserRegisterV3('james@gmail.com', 'testPassword123', 'James', 'Brown');
  const rufusToken = requestAuthUserRegisterV3('rufus@gmail.com', 'testPassword123', 'Rufus', 'Green');
  let dmId1 = requestDmCreateV2(jamesToken, [1, 2]);
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
  //const bodyObj = JSON.parse(String(res2.getBody()));

  expect(res2.statusCode).toBe(200);
  //expect(bodyObj).toStrictEqual({});

  //now we need to check the message has been reacted to.
  //expect(data.channels[0].messages[0].isThisMessageReacted).not.toEqual(true);
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

function requestChannelInviteV2(token: string, channelId: number, uId: number) {
  const res = request(
    'POST',
    `${url}:${port}/channel/invite/v2`,
    {
      json: {
        token: token,
        channelId: channelId,
        uId: uId,
      }
    }
  );

  return JSON.parse(String(res.getBody()));
}

function requestChannelLeaveV2(token: string, channelId: number) {
  const res = request(
    'POST',
    `${url}:${port}/channel/leave/v1`,
    {
      json: {
        token: token,
        channelId: channelId,
      }
    }
  );

  return JSON.parse(String(res.getBody()));
}

function requestDmLeaveV2(token: string, dmId: number) {
  const res = request(
    'POST',
    `${url}:${port}/dm/leave/v2`,
    {
      json: {
        dmId: dmId,
      },
      headers: {
        token: token,
      },
    }
  );

  return JSON.parse(String(res.getBody()));
}

function requestChannelMessageV2(token: string, channelId: number, start: number) {
  const res = request(
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

  return JSON.parse(String(res.getBody())).messages;
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

function requestDmMessageV2(token: string, dmId: number, start: number) {
  const res = request(
    'GET',
    `${url}:${port}/dm/messages/v2`,
    {
      qs: {
        dmId: dmId,
        start: start,
      },
      headers: {
        token: token,
      },
    }
  );

  return JSON.parse(String(res.getBody())).messages;
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
