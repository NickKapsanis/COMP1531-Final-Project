import request from 'sync-request';
import config from './config.json';

const OK = 200;
const port = config.port;
const url = config.url;

const BAD_REQ = 400;
const FORBID = 403;

type message = {
  messageId : number;
  uId : number;
  timeSent : number;
  message : string;
}

// Tests for message/send/v1
describe('Tests for message/send/V1', () => {
  let token1: string;
  let token2: string;
  let channelId1: number;
  let channelId2: number;

  beforeEach(() => {
    //  Channels token[x] is member of: token1: [1], token2: [2]
    token1 = requestAuthUserRegisterV3('example1@email.com', 'password1', 'John', 'Smith');
    token2 = requestAuthUserRegisterV3('example2@email.com', 'password2', 'Jane', 'Citizen');
    channelId1 = requestChannelsCreateV2(token1, 'Channel 1', true);
    channelId2 = requestChannelsCreateV2(token2, 'Channel 2', true);
  });

  afterEach(() => {
    requestClear();
  });

  test('Case 1: token is invalid', () => {
    const res = testRequestMessageSendV1('invalid-token', channelId1, 'Message 1');

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({ error: 'error' });
  });

  test('Case 2: channelId does not refer to valid channel', () => {
    // Get all channels token is a part of
    const allChannels = requestChannelsListallV2(token1);
    let invalidId = 199;
    for (const i in allChannels) {
      if (invalidId === allChannels[i].channelId) {
        invalidId = invalidId + 100;
      }
    }

    const res = testRequestMessageSendV1(token1, invalidId, 'Message 1');

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({ error: 'error' });
  });

  test('Case 3: length of message is less than 1 or more than 1000 characters', () => {
    // Generate 1000+ character message
    const testMessage100 = 'dlXqa8qv6YSWfOcAO7Vf9gAjigjRXGjHygJahreDg0yKUIpKRKhQWpruNwESu7nKdwtJU0zGsM34tgCm9CaWyPkV4hhVClmFfQNM';
    let testMessage1000 = '';
    for (let i = 0; i < 11; i++) {
      testMessage1000 = testMessage1000 + testMessage100;
    }

    const res1 = testRequestMessageSendV1(token1, channelId1, '');
    const res2 = testRequestMessageSendV1(token1, channelId1, testMessage1000);

    expect(res1.statusCode).toBe(OK);
    expect(res2.statusCode).toBe(OK);
    const bodyObj1 = JSON.parse(String(res1.getBody()));
    const bodyObj2 = JSON.parse(String(res2.getBody()));

    expect(bodyObj1).toStrictEqual({ error: 'error' });
    expect(bodyObj2).toStrictEqual({ error: 'error' });
  });

  test('Case 4: user not member of channel', () => {
    const res = testRequestMessageSendV1(token1, channelId2, 'Message 1');

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({ error: 'error' });
  });

  test('Case 5: successful message send', () => {
    const res = testRequestMessageSendV1(token1, channelId1, 'Message 1');

    const bodyObj = JSON.parse(String(res.getBody())).messageId;
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual(expect.any(Number)); // TODO: check if working
  });
});

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

// Tests for message/senddm/v1
describe('Tests for message/senddm/V1', () => {
  let token1: string;
  let token2: string;
  let token3: string;
  let dmId1: number;
  let dmId2: number;

  beforeEach(() => {
    //  member of: token1: [1], token2: [2]
    // TODO: find uIDs of token1 and token2 to pass in
    token1 = requestAuthUserRegisterV3('example1@email.com', 'password1', 'John', 'Smith');
    token2 = requestAuthUserRegisterV3('example2@email.com', 'password2', 'Jane', 'Citizen');
    token3 = requestAuthUserRegisterV3('example3@email.com', 'password3', 'James', 'Adams');
    dmId1 = requestDmCreateV2(token1, [1, 2]);
    dmId2 = requestDmCreateV2(token2, [2, 3]);
  });

  afterEach(() => {
    requestClear();
  });

  test('Case 1: token is invalid', () => {
    const res = testRequestMessageSendDmV1('invalid-token', dmId1, 'Message 1');

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({ error: 'error' });
  });

  test('Case 2: dmId does not refer to valid DM', () => {
    // NOTE: cannot use method as did before as cannot list all DMs in dataStore without referring to it
    const invalidId = Math.floor((Math.random() * 1000) + 1000);

    const res = testRequestMessageSendDmV1(token3, invalidId, 'Message 1');

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({ error: 'error' });
  });

  test('Case 3: length of message is less than 1 or more than 1000 characters', () => {
    // Generate 1000+ character message
    const testMessage100 = 'dlXqa8qv6YSWfOcAO7Vf9gAjigjRXGjHygJahreDg0yKUIpKRKhQWpruNwESu7nKdwtJU0zGsM34tgCm9CaWyPkV4hhVClmFfQNM';
    let testMessage1000 = '';
    for (let i = 0; i < 11; i++) {
      testMessage1000 = testMessage1000 + testMessage100;
    }

    const res1 = testRequestMessageSendDmV1(token1, dmId1, '');
    const res2 = testRequestMessageSendDmV1(token1, dmId1, testMessage1000);

    expect(res1.statusCode).toBe(OK);
    expect(res2.statusCode).toBe(OK);
    const bodyObj1 = JSON.parse(String(res1.getBody()));
    const bodyObj2 = JSON.parse(String(res2.getBody()));

    expect(bodyObj1).toStrictEqual({ error: 'error' });
    expect(bodyObj2).toStrictEqual({ error: 'error' });
  });

  test('Case 4: user not member of DM', () => {
    const res = testRequestMessageSendDmV1(token1, dmId2, 'Message 1');

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({ error: 'error' });
  });

  test('Case 5: successful message senddm', () => {
    const res = testRequestMessageSendDmV1(token1, dmId1, 'Message 1');
    const bodyObj = JSON.parse(String(res.getBody())).messageId;
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual(expect.any(Number)); // To change once format of ids finalised.
  });
});

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

// Tests for message/edit/v1
describe('Tests for message/edit/V1', () => {
  let token1: string;
  let token2: string;
  let token3: string;
  let channelId1: number;
  let channelId2: number;
  let messageId1: number;
  let messageId2: number;
  let messageId3: number;
  let messageId4: number;

  beforeEach(() => {
    //  channelId1: [owners: 1][members: 1,2] channelId2: [owners: 1, 2][members: 2, 3] (because token1 is a global owner)
    token1 = requestAuthUserRegisterV3('example1@email.com', 'password1', 'John', 'Smith');
    token2 = requestAuthUserRegisterV3('example2@email.com', 'password2', 'Jane', 'Citizen');
    token3 = requestAuthUserRegisterV3('example3@email.com', 'password3', 'James', 'Adam');

    channelId1 = requestChannelsCreateV2(token1, 'Channel 1', true);
    channelId2 = requestChannelsCreateV2(token2, 'Channel 2', true);

    // Invite token2 into Channel 1 and token3 into Channel 2
    requestChannelInviteV2(token1, channelId1, 2); // TODO: change uID... getUId helper function?
    requestChannelInviteV2(token2, channelId2, 3);

    messageId1 = requestMessageSendV1(token1, channelId1, 'Message 1.1');
    messageId2 = requestMessageSendV1(token2, channelId1, 'Message 1.2');
    messageId3 = requestMessageSendV1(token2, channelId2, 'Message 2.1');
    messageId4 = requestMessageSendV1(token3, channelId2, 'Message 2.2');
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
    const res = requestMessageEditV1(token1, 11, 'Edited Message 1.1');

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({ error: 'error' });
  });

  test('Case 3: invalid message (1000+)', () => {
    const testMessage100 = 'dlXqa8qv6YSWfOcAO7Vf9gAjigjRXGjHygJahreDg0yKUIpKRKhQWpruNwESu7nKdwtJU0zGsM34tgCm9CaWyPkV4hhVClmFfQNM';
    let testMessage1000 = '';
    for (let i = 0; i < 11; i++) {
      testMessage1000 = testMessage1000 + testMessage100;
    }

    const res = requestMessageEditV1(token1, messageId1, testMessage1000);

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({ error: 'error' });
  });

  test('Case 4: not global, messageId refers to message in a channel the user not member/owner of ', () => {
    const res = requestMessageEditV1(token3, messageId1, 'Edited Message 1.1');

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({ error: 'error' });
  });

  test('Case 5: successful edit: not global, owner of channel, message not sent by user', () => {
    const res = requestMessageEditV1(token2, messageId4, 'Edited Message 2.2');

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({});
  });

  test('Case 6: not global, not owner, member, message not sent by user', () => {
    const res = requestMessageEditV1(token3, messageId3, 'Edited Message 2.1');

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({ error: 'error' });
  });

  test('Case 7: not global, not owner, message sent by user but left channel', () => {
    requestChannelLeaveV2(token2, channelId1);
    const res = requestMessageEditV1(token2, messageId2, 'Edited Message 1.2');

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({ error: 'error' });
  });

  test('Case 8: successful message edit (in channels)', () => {
    const res = requestMessageEditV1(token1, messageId1, 'Edited Message 1.1');
    const messages: Array<message | undefined> = requestChannelMessageV2(token1, channelId1, 0);
    const editedMessage: message = messages.find(message => message.messageId === messageId1);

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({});
    expect(editedMessage.message).toStrictEqual('Edited Message 1.1');
  });

  test('Case 9: successful message edit (empty message string)', () => {
    const res = requestMessageEditV1(token1, messageId1, '');
    const messages: Array<message | undefined> = requestChannelMessageV2(token1, channelId1, 0);
    const editedMessage: message = messages.find(message => message.messageId === messageId1);

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({});
    expect(editedMessage).toStrictEqual(undefined);
  });

  test('Case 10: successful message edit (with global permissions)', () => {
    const res = requestMessageEditV1(token1, messageId3, 'Edited Message 2.1');
    const messages: Array<message | undefined> = requestChannelMessageV2(token2, channelId2, 0); // Assumption: global owner cannot access channelMessagesV2
    const editedMessage: message = messages.find(message => message.messageId === messageId3);

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({});
    expect(editedMessage.message).toStrictEqual('Edited Message 2.1');
  });

  test('Case 11: successful message edit (with dms)', () => {
    const dmId1: number = requestDmCreateV2(token1, [1, 3]);
    const messageId5: number = requestMessageSendDmV1(token1, dmId1, 'Message Dm 1.1');

    const res = requestMessageEditV1(token1, messageId5, 'Edited Message Dm 1.1');
    const messages: Array<message | undefined> = requestDmMessageV2(token1, dmId1, 0);
    const editedMessage: message = messages.find(message => message.messageId === messageId5);

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({});
    expect(editedMessage.message).toStrictEqual('Edited Message Dm 1.1');
  });
});

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

// Tests for message/remove/v1
describe('Tests for message/remove/V1 (for input and channels)', () => {
  let token1: string;
  let token2: string;
  let token3: string;
  let channelId1: number;
  let channelId2: number;
  let messageId1: number;
  let messageId2: number;
  let messageId3: number;

  beforeEach(() => {
    //  channelId1: [owners: 1][members: 1,2] channelId2: [owners: 1, 2][members: 2, 3] (because token1 is a global owner)
    token1 = requestAuthUserRegisterV3('example1@email.com', 'password1', 'John', 'Smith');
    token2 = requestAuthUserRegisterV3('example2@email.com', 'password2', 'Jane', 'Citizen');
    token3 = requestAuthUserRegisterV3('example3@email.com', 'password3', 'James', 'Adam');

    channelId1 = requestChannelsCreateV2(token1, 'Channel 1', true);
    channelId2 = requestChannelsCreateV2(token2, 'Channel 2', true);

    // Invite token2 into Channel 1
    requestChannelInviteV2(token1, channelId1, 2);
    requestChannelInviteV2(token2, channelId2, 3); // TODO: change uID

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
    const res = requestMessageRemoveV1(token1, 11);

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

  test('Case 6: successful message remove (channel)', () => {
    const res = requestMessageRemoveV1(token1, messageId1);
    const messages: Array<message | undefined> = requestChannelMessageV2(token1, channelId1, 0);
    const removedMessage: message = messages.find(message => message.messageId === messageId1);

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({});
    expect(removedMessage).toStrictEqual(undefined);
  });
});

describe('Tests for message/remove/v1 (for dms)', () => {
  let token1: string;
  let token2: string;
  let token3: string;
  let dmId1: number;
  let dmId2: number;
  let messageId1: number;
  let messageId2: number;
  let messageId3: number;
  let messageId4: number;

  beforeEach(() => {
    //  dmId1: [owner: 1][members: 1, 2] dmId2: [owner: 2][members: 2, 3]
    token1 = requestAuthUserRegisterV3('example1@email.com', 'password1', 'John', 'Smith');
    token2 = requestAuthUserRegisterV3('example2@email.com', 'password2', 'Jane', 'Citizen');
    token3 = requestAuthUserRegisterV3('example3@email.com', 'password3', 'James', 'Adam');

    dmId1 = requestDmCreateV2(token1, [1, 2]);
    dmId2 = requestDmCreateV2(token2, [2, 3]);

    messageId1 = requestMessageSendDmV1(token1, dmId1, 'Message 1.1');
    messageId2 = requestMessageSendDmV1(token2, dmId1, 'Message 1.2');
    messageId3 = requestMessageSendDmV1(token2, dmId2, 'Message 2.1');
    messageId4 = requestMessageSendDmV1(token3, dmId2, 'Message 2.2');
  });

  afterEach(() => {
    requestClear();
  });

  test('Case 1: invalid messageId given', () => {
    const res = requestMessageRemoveV1(token1, 21);

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({ error: 'error' });
  });

  test('Case 2: user did not sent message, not owner of channel', () => {
    const res = requestMessageRemoveV1(token3, messageId3);

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({ error: 'error' });
  });

  test('Case 3: user sent message, not member of channel (i.e left channel)', () => {
    requestDmLeaveV2(token3, dmId2);
    const res = requestMessageRemoveV1(token3, messageId4);
    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({ error: 'error' });
  });

  test('Case 4: success remove: user is owner, did not send message', () => {
    const res = requestMessageRemoveV1(token1, messageId2);
    const messages: Array<message | undefined> = requestDmMessageV2(token1, dmId1, 0);
    const removedMessage: message = messages.find(message => message.messageId === messageId2);

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({});
    expect(removedMessage).toStrictEqual(undefined);
  });

  test('Case 5: successful message remove', () => {
    const res = requestMessageRemoveV1(token1, messageId1);
    const messages: Array<message | undefined> = requestDmMessageV2(token1, dmId1, 0);
    const removedMessage: message = messages.find(message => message.messageId === messageId1);

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({});
    expect(removedMessage).toStrictEqual(undefined);
  });
});

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

// Tests for message/share/v1
describe('Tests for message/share/v1', () => {
  let token1: string;
  let token2: string;
  let token3: string;
  let channelId1: number;
  let channelId2: number;
  let dmId1: number;
  let dmId2: number;
  let messageId1: number;
  let messageId2: number;
  let messageId3: number;
  let messageId4: number;

  beforeEach(() => {
    //  channelMembers1: [1,2], channelOwners1: [1], channelMembers2: [2, 3], channelOwners2: [1, 2] //because 1 is a global owner
    token1 = requestAuthUserRegisterV2('example1@email.com', 'password1', 'John', 'Smith');
    token2 = requestAuthUserRegisterV2('example2@email.com', 'password2', 'Jane', 'Citizen');
    token3 = requestAuthUserRegisterV2('example3@email.com', 'password3', 'James', 'Adam');
    channelId1 = requestChannelsCreateV2(token1, 'Channel 1', true);
    channelId2 = requestChannelsCreateV2(token2, 'Channel 2', true);
    dmId1 = requestDmCreateV1(token2, [2, 3]);
    dmId2 = requestDmCreateV1(token1, [1, 2]);

    // Invite token2 into Channel 1
    requestChannelInviteV2(token1, channelId1, 2);
    requestChannelInviteV2(token2, channelId2, 3);
    messageId1 = requestMessageSendV1(token1, channelId1, 'CMessage 1.1');
    messageId2 = requestMessageSendV1(token2, channelId1, 'CMessage 1.2');
    messageId3 = requestMessageSendV1(token2, channelId2, 'CMessage 2.1');
    messageId4 = requestMessageSendDmV1(token2, dmId1, 'DMessage 1.1');
  });

  afterEach(() => {
    requestClear();
  });

  test('Case 1: channelId and/or dmId are invalid', () => {
    // Token 2 is sharing messageId to invalid channel/dm
    const res1 = requestMessageShareV1(token2, messageId1, 'Attach message', 11, 21);
    const res2 = requestMessageShareV1(token2, messageId1, 'Attach message', 11, -1);
    const res3 = requestMessageShareV1(token2, messageId1, 'Attach message', -1, 21);

    expect(res1.statusCode).toBe(BAD_REQ);
    expect(res2.statusCode).toBe(BAD_REQ);
    expect(res3.statusCode).toBe(BAD_REQ);
  });

  test('Case 2: Neither channelId nor dmId are -1', () => {
    // Token 2 is sharing messageId to channel2 and dm1 but not -1
    const res1 = requestMessageShareV1(token2, messageId1, 'Attach message', channelId1, -100);
    const res2 = requestMessageShareV1(token2, messageId1, 'Attach message', -100, dmId1);
    expect(res1.statusCode).toBe(BAD_REQ);
    expect(res2.statusCode).toBe(BAD_REQ);
  });

  test('Case 3: ogMessageId refers to message in a channel/dm user not member of', () => {
    // Token 3 is not a member of channel1, attempting to share to dm1
    const res1 = requestMessageShareV1(token3, messageId2, 'Attach message', -1, dmId1);
    // Token 1 is not a member of dm1, attempting to share to dm2
    const res2 = requestMessageShareV1(token1, messageId4, 'Attach message', -1, dmId2);
    expect(res1.statusCode).toBe(BAD_REQ);
    expect(res2.statusCode).toBe(BAD_REQ);
  });

  test('Case 4: length of message is 1000+', () => {
    // Token 2 is sharing message in channel1, to channel 2
    // Generate 1000+ character message
    const testMessage100 = 'dlXqa8qv6YSWfOcAO7Vf9gAjigjRXGjHygJahreDg0yKUIpKRKhQWpruNwESu7nKdwtJU0zGsM34tgCm9CaWyPkV4hhVClmFfQNM';
    let testMessage1000 = '';
    for (let i = 0; i < 11; i++) {
      testMessage1000 = testMessage1000 + testMessage100;
    }

    const res = requestMessageShareV1(token2, messageId1, testMessage1000, channelId2, -1);
    expect(res.statusCode).toBe(BAD_REQ);
  });

  test('Case 5: user not joined channel/DM trying to message share to', () => {
    // Token 3 attempting to share message from channel2 to channel1
    const res1 = requestMessageShareV1(token3, messageId3, 'Attach message', channelId1, -1);
    // Token 1 attempting to share message from channel1 to dm1
    const res2 = requestMessageShareV1(token1, messageId1, 'Attach message', -1, dmId1);
    expect(res1.statusCode).toBe(FORBID);
    expect(res2.statusCode).toBe(FORBID);
  });

  test('Case 6: (channel) successful message share with attached message', () => {
    // Token 2 share message from channel1 to channel2
    const res = requestMessageShareV1(token2, messageId2, 'Attach message', channelId2, -1);
    expect(res.statusCode).toBe(OK);

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(bodyObj.sharedMessageId).toStrictEqual(expect.any(Number));

    const messages: Array<message | undefined> = requestChannelMessageV2(token2, channelId2, 0);
    const sharedMessage: message = messages.find(message => message.messageId === bodyObj.sharedMessageId);
    expect(sharedMessage.message.includes('Attach message')).toStrictEqual(true);
  });

  test('Case 7: (dm) successful message share with no attached message', () => {
    // Token 2 share message from dm1 to dm2
    const res = requestMessageShareV1(token2, messageId4, '', -1, dmId2);
    expect(res.statusCode).toBe(OK);

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(bodyObj.sharedMessageId).toStrictEqual(expect.any(Number));

    const messages: Array<message | undefined> = requestDmMessageV1(token2, dmId2, 0);
    const sharedMessage: message = messages.find(message => message.messageId === bodyObj.sharedMessageId);
    expect(sharedMessage.message.includes('Attach message')).toStrictEqual(false);
  });

  test('Case 8: invalid token', () => {
    // Invalid token shares message from channel1 to channel2
    const res = requestMessageShareV1('invalid-token', messageId2, 'Attach message', channelId2, -1);
    expect(res.statusCode).toBe(FORBID);
  });

  test('Case 9: invalid ogMessageId (from channel) given', () => {
    const res = requestMessageShareV1(token2, 11, 'Attach message', channelId2, -1);
    expect(res.statusCode).toBe(BAD_REQ);
  });

  test('Case 10: invalid ogMessageId (from dm) given', () => {
    const res = requestMessageShareV1(token2, 21, 'Attach message', channelId2, -1);
    expect(res.statusCode).toBe(BAD_REQ);
  });
});

function requestMessageShareV1(token: string, ogMessageId: number, message: string, channelId: number, dmId: number) {
  return request(
    'POST',
    `${url}:${port}/message/share/v1`,
    {
      json: {
        ogMessageId: ogMessageId,
        message: message,
        channelId: channelId,
        dmId: dmId,
      },
      headers: {
        token: token,
      }
    }
  );
}

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
