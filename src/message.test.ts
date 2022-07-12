import request from 'sync-request';
import config from './config.json';

const OK = 200;
const port = config.port;
const url = config.url;

describe('Tests for message/remove/V1', () => {
  let token1;
  let token2;
  let token3;
  let channelId1;
  let channelId2;
  let messageId1;
  let messageId2;
  let messageId3;

  beforeEach(() => {
    //  channelMembers1: [1,2], channelOwners1: [1], channelMembers2: [2, 3], channelOwners2: [1, 2] //because 1 is a global owner
    token1 = requestAuthUserRegisterV2('example1@email.com', 'password1', 'John', 'Smith');
    token2 = requestAuthUserRegisterV2('example2@email.com', 'password2', 'Jane', 'Citizen');
    token3 = requestAuthUserRegisterV2('example3@email.com', 'password3', 'James', 'Adam');
    channelId1 = requestChannelsCreateV2(token1, 'Channel 1', true);
    // Invite token2 into Channel 1
    requestChannelInviteV2(token1, channelId1, 2);
    requestChannelInviteV2(token2, channelId2, 3); // TODO: change uID
    channelId2 = requestChannelsCreateV2(token2, 'Channel 2', true);
    messageId1 = requestMessageSendV1(token1, channelId1, 'Message 1.1');
    messageId2 = requestMessageSendV1(token2, channelId1, 'Message 1.2');
    messageId3 = requestMessageSendV1(token2, channelId2, 'Message 2.1');
  });

  afterEach(() => {
    requestClear();
  });

  test('Case 1: invalid token given', () => {
    const res = requestMessageRemoveV1('invalid-token', messageId1);

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({ error: 'error' });
  });

  test('Case 2: invalid messageId given', () => {
    const res = requestMessageRemoveV1(token1, -1);

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({ error: 'error' });
  });

  test('Case 3: messageId refers to message in a channel user not member of ', () => {
    const res = requestMessageRemoveV1(token3, messageId3);

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({ error: 'error' });
  });

  test('Case 4: message not sent by user', () => {
    const res = requestMessageRemoveV1(token1, messageId2);

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({ error: 'error' });
  });

  test('Case 5: user does not have owner permissions', () => {
    const res = requestMessageRemoveV1(token2, messageId2);

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({ error: 'error' });
  });

  test('Case 6: successful message remove', () => {
    const res = requestMessageRemoveV1(token1, messageId1);
    const messages = requestChannelMessageV2(token1, channelId1, 0);
    const removedMessage = messages.find(message => message.messageId === messageId1);

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({});
    expect(removedMessage).toStrictEqual(undefined);
  });
});

function requestMessageRemoveV1(token: string, messageId: number) {
  return request(
    'DELETE',
        `${url}:${port}/message/edit/v1`,
        {
          qs: {
            token: token,
            messageId: messageId,
          }
        }
  );
}

/// /////////////////////////////////////////////////////////////////////////////
/// /////////////////////////////////////////////////////////////////////////////
/// /////////////////////        Helper Functions       /////////////////////////
/// /////////////////////////////////////////////////////////////////////////////
/// /////////////////////////////////////////////////////////////////////////////
function requestAuthUserRegisterV2(email: string, password: string, nameFirst: string, nameLast: string) {
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

function requestChannelMessageV2(token: string, channelId: number, start: number) {
  const res = request(
    'POST',
          `${url}:${port}/channel/messages/v2`,
          {
            json: {
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

function requestClear() {
  const res = request(
    'DELETE',
          `${url}:${port}/clear/v1`
  );

  return JSON.parse(String(res.getBody()));
}
