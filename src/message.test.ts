import request from 'sync-request';
import config from './config.json';

const OK = 200;
const port = config.port;
const url = config.url;

describe('Tests for message/edit/V1', () => {
  let token1;
  let token2;
  let channelId1;
  let channelId2;
  let messageId1;
  let messageId2;
  let messageId3;

  beforeEach(() => {
    //  channelMembers1: [1,2], channelOwners1: [1], channelMembers2: [2], channelOwners2: [2]
    token1 = requestAuthUserRegisterV2('example1@email.com', 'password1', 'John', 'Smith');
    token2 = requestAuthUserRegisterV2('example2@email.com', 'password2', 'Jane', 'Citizen');
    channelId1 = requestChannelsCreateV2(token1, 'Channel 1', true);
    // Invite token2 into Channel 1
    requestChannelInviteV2(token1, channelId1, 2); // TODO: change uID... getUId helper function?
    channelId2 = requestChannelsCreateV2(token2, 'Channel 2', true);
    messageId1 = requestMessageSendV1(token1, channelId1, 'Message 1.1');
    messageId2 = requestMessageSendV1(token2, channelId1, 'Message 1.2');
    messageId3 = requestMessageSendV1(token2, channelId2, 'Message 2.1');
  });

  afterEach(() => {
    requestClear();
  });

  test('Case 1: invalid token given', () => {
    const res = requestMessageEditV1('invalid-token', messageId1, 'Edited Message 1');

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({ error: 'error' });
  });

  test('Case 2: invalid messageId given', () => {
    const res = requestMessageEditV1(token1, -1, 'Edited Message 1.1');

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({ error: 'error' });
  });

  test('Case 3: messageId refers to message in a channel the user not member of ', () => {
    const res = requestMessageEditV1(token1, messageId3, 'Edited Message 2.1');

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({ error: 'error' });
  });

  test('Case 4: message not sent by user', () => {
    const res = requestMessageEditV1(token1, messageId2, 'Edited Message 1.2');

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({ error: 'error' });
  });

  test('Case 5: user does not have owner permissions', () => {
    const res = requestMessageEditV1(token2, messageId2, 'Edited Message 1.2');

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({ error: 'error' });
  });

  test('Case 6: successful message edit', () => {
    const res = requestMessageEditV1(token1, messageId1, 'Edited Message 1.1');
    const messages = requestChannelMessageV2(token1, channelId1, 0);
    const editedMessage = messages.find(message => message.messageId === messageId1);

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({});
    expect(editedMessage.message).toStrictEqual('Edited Message 1.1');
  });

  test('Case 7: successful message edit (empty message string)', () => {
    const res = requestMessageEditV1(token1, messageId1, '');
    const messages = requestChannelMessageV2(token1, channelId1, 0);
    const editedMessage = messages.find(message => message.messageId === messageId1);

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({});
    expect(editedMessage).toStrictEqual(undefined);
  });
});

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

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////        Helper Functions       /////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
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
