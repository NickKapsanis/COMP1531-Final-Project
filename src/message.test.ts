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
}

// Tests for message/edit/v1
describe('Tests for message/edit/V1', () => {
  let token1: string;
  let token2: string;
  let token3: string;
  let channelId1: number;
  let channelId2: number;
  let messageId1: number;
  // let messageId2: number;
  let messageId3: number;

  beforeEach(() => {
    //  channelMembers1: [1,2], channelOwners1: [1], channelMembers2: [2, 3], channelOwners2: [1, 2] (because token1 is a global owner)
    token1 = requestAuthUserRegisterV2('example1@email.com', 'password1', 'John', 'Smith');
    token2 = requestAuthUserRegisterV2('example2@email.com', 'password2', 'Jane', 'Citizen');
    token3 = requestAuthUserRegisterV2('example3@email.com', 'password3', 'James', 'Adam');
    channelId1 = requestChannelsCreateV2(token1, 'Channel 1', true);
    // Invite token2 into Channel 1
    requestChannelInviteV2(token1, channelId1, 2); // TODO: change uID... getUId helper function?
    // Invite token3 into Channel 2
    requestChannelInviteV2(token2, channelId2, 3);
    channelId2 = requestChannelsCreateV2(token2, 'Channel 2', true);
    messageId1 = requestMessageSendV1(token1, channelId1, 'Message 1.1');
    // messageId2 = requestMessageSendV1(token2, channelId1, 'Message 1.2');
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
    const res = requestMessageEditV1(token3, messageId1, 'Edited Message 1.1');

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({ error: 'error' });
  });

  test('Case 4: message not sent by user', () => {
    const res = requestMessageEditV1(token2, messageId1, 'Edited Message 1.1');

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({ error: 'error' });
  });

  test('Case 5: user does not have owner permissions', () => {
    const res = requestMessageEditV1(token3, messageId3, 'Edited Message 2.1');

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({ error: 'error' });
  });

  test('Case 6: successful message edit (in channels)', () => {
    const res = requestMessageEditV1(token1, messageId1, 'Edited Message 1.1');
    const messages: Array<message | undefined> = requestChannelMessageV2(token1, channelId1, 0);
    const editedMessage: message = messages.find(message => message.messageId === messageId1);

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({});
    expect(editedMessage.message).toStrictEqual('Edited Message 1.1');
  });

  test('Case 7: successful message edit (empty message string)', () => {
    const res = requestMessageEditV1(token1, messageId1, '');
    const messages: Array<message | undefined> = requestChannelMessageV2(token1, channelId1, 0);
    const editedMessage: message = messages.find(message => message.messageId === messageId1);

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({});
    expect(editedMessage).toStrictEqual(undefined);
  });

  test('Case 8: successful message edit (with global permissions)', () => {
    const res = requestMessageEditV1(token1, messageId3, 'Edited Message 2.1');
    const messages: Array<message | undefined> = requestChannelMessageV2(token2, channelId2, 0); // Assumption: global owner cannot access channelMessagesV2
    const editedMessage: message = messages.find(message => message.messageId === messageId3);

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({});
    expect(editedMessage.message).toStrictEqual('Edited Message 2.1');
  });

  test('Case 9: successful message edit (with dms)', () => {
    const dmId1: number = requestDmCreateV1(token1, [1, 3]);
    const messageId5: number = requestMessageSendDmV1(token1, dmId1, 'Message Dm 1.1');

    const res = requestMessageEditV1(token1, messageId5, 'Edited Message Dm 1.1');
    const messages: Array<message | undefined> = requestDmMessageV1(token1, dmId1, 0);
    const editedMessage: message = messages.find(message => message.messageId === messageId5);

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({});
    expect(editedMessage.message).toStrictEqual('Edited Message Dm 1.1');
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

// Tests for message/remove/v1
describe('Tests for message/remove/V1', () => {
  let token1: string;
  let token2: string;
  let token3: string;
  let channelId1: number;
  let channelId2: number;
  let messageId1: number;
  let messageId2: number;
  let messageId3: number;

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
    const res = requestMessageRemoveV1(token3, messageId1);

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({ error: 'error' });
  });

  test('Case 4: message not sent by user and not global owner', () => {
    const res = requestMessageRemoveV1(token3, messageId2);

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({ error: 'error' });
  });

  test('Case 5: user does not have owner permissions', () => {
    const res = requestMessageRemoveV1(token3, messageId3);

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({ error: 'error' });
  });

  test('Case 6: successful message remove', () => {
    const res = requestMessageRemoveV1(token1, messageId1);
    const messages: Array<message | undefined> = requestChannelMessageV2(token1, channelId1, 0);
    const removedMessage: message = messages.find(message => message.messageId === messageId1);

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({});
    expect(removedMessage).toStrictEqual(undefined);
  });
});

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

function requestDmCreateV1(token: string, uIds: Array<number>) {
  const res = request(
    'POST',
    `${url}:${port}/dm/create/v1`,
    {
      json: {
        token: token,
        uIds: uIds,
      }
    }
  );

  return JSON.parse(String(res.getBody())).dmId;
}

function requestDmMessageV1(token: string, dmId: number, start: number) {
  const res = request(
    'GET',
    `${url}:${port}/dm/messages/v1`,
    {
      qs: {
        token: token,
        dmId: dmId,
        start: start,
      }
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
