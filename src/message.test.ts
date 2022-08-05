import request from 'sync-request';
import config from './config.json';

const port = config.port;
const url = config.url;
const FORBID = 403;
const BAD_REQ = 400;
const OK = 200;

type message = {
  messageId : number;
  uId : number;
  timeSent : number;
  message : string;
  isPinned: boolean;
}

// Tests for message/send/v2
describe('Tests for message/send/v2', () => {
  let token1: string;
  let token2: string;
  let channelId1: number;
  let channelId2: number;

  beforeEach(() => {
    requestClear();
    //  Channels token[x] is member of: token1: [1], token2: [2]
    token1 = requestAuthUserRegisterV3('example1@email.com', 'password1', 'John', 'Smith');
    token2 = requestAuthUserRegisterV3('example2@email.com', 'password2', 'Jane', 'Citizen');
    channelId1 = requestChannelsCreateV3(token1, 'Channel 1', true);
    channelId2 = requestChannelsCreateV3(token2, 'Channel 2', true);
  });

  afterEach(() => {
    requestClear();
  });

  test('Case 1: token is invalid', () => {
    const res = testRequestMessageSendV2('invalid-token', channelId1, 'Message 1');
    expect(res.statusCode).toBe(FORBID);
  });

  test('Case 2: channelId does not refer to valid channel', () => {
    // Get all channels token is a part of
    const allChannels = requestChannelsListallV3(token1);
    let invalidId = 199;
    for (const i in allChannels) {
      if (invalidId === allChannels[i].channelId) {
        invalidId = invalidId + 100;
      }
    }

    const res = testRequestMessageSendV2(token1, invalidId, 'Message 1');
    expect(res.statusCode).toBe(BAD_REQ);
  });

  test('Case 3: length of message is less than 1 or more than 1000 characters', () => {
    // Generate 1000+ character message
    const testMessage100 = 'dlXqa8qv6YSWfOcAO7Vf9gAjigjRXGjHygJahreDg0yKUIpKRKhQWpruNwESu7nKdwtJU0zGsM34tgCm9CaWyPkV4hhVClmFfQNM';
    let testMessage1000 = '';
    for (let i = 0; i < 11; i++) {
      testMessage1000 = testMessage1000 + testMessage100;
    }

    const res1 = testRequestMessageSendV2(token1, channelId1, '');
    const res2 = testRequestMessageSendV2(token1, channelId1, testMessage1000);

    expect(res1.statusCode).toBe(BAD_REQ);
    expect(res2.statusCode).toBe(BAD_REQ);
  });

  test('Case 4: user not member of channel', () => {
    const res = testRequestMessageSendV2(token1, channelId2, 'Message 1');
    expect(res.statusCode).toBe(FORBID);
  });

  test('Case 5: successful message send', () => {
    const res = testRequestMessageSendV2(token1, channelId1, 'Message 1');

    const bodyObj = JSON.parse(String(res.getBody())).messageId;
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual(expect.any(Number));
  });
});

// Helper function for message/send/v1 HTTP calls
function testRequestMessageSendV2(token: string, channelId: number, message: string) {
  return request(
    'POST',
    `${url}:${port}/message/send/v2`,
    {
      json: {
        channelId: channelId,
        message: message,
      },
      headers: {
        token: token,
      }
    }
  );
}

// Tests for message/senddm/v2
describe('Tests for message/senddm/v2', () => {
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
    const res = testRequestMessageSendDmV2('invalid-token', dmId1, 'Message 1');
    expect(res.statusCode).toBe(FORBID);
  });

  test('Case 2: dmId does not refer to valid DM', () => {
    // NOTE: cannot use method as did before as cannot list all DMs in dataStore without referring to it
    const invalidId = Math.floor((Math.random() * 1000) + 1000);

    const res = testRequestMessageSendDmV2(token3, invalidId, 'Message 1');
    expect(res.statusCode).toBe(BAD_REQ);
  });

  test('Case 3: length of message is less than 1 or more than 1000 characters', () => {
    // Generate 1000+ character message
    const testMessage100 = 'dlXqa8qv6YSWfOcAO7Vf9gAjigjRXGjHygJahreDg0yKUIpKRKhQWpruNwESu7nKdwtJU0zGsM34tgCm9CaWyPkV4hhVClmFfQNM';
    let testMessage1000 = '';
    for (let i = 0; i < 11; i++) {
      testMessage1000 = testMessage1000 + testMessage100;
    }

    const res1 = testRequestMessageSendDmV2(token1, dmId1, '');
    const res2 = testRequestMessageSendDmV2(token1, dmId1, testMessage1000);

    expect(res1.statusCode).toBe(BAD_REQ);
    expect(res2.statusCode).toBe(BAD_REQ);
  });

  test('Case 4: user not member of DM', () => {
    const res = testRequestMessageSendDmV2(token1, dmId2, 'Message 1');
    expect(res.statusCode).toBe(FORBID);
  });

  test('Case 5: successful message senddm', () => {
    const res = testRequestMessageSendDmV2(token1, dmId1, 'Message 1');
    const bodyObj = JSON.parse(String(res.getBody())).messageId;
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual(expect.any(Number)); // To change once format of ids finalised.
  });
});

// Helper function for message/senddm/v1 HTTP calls
function testRequestMessageSendDmV2(token: string, dmId: number, message: string) {
  return request(
    'POST',
        `${url}:${port}/message/senddm/v2`,
        {
          json: {
            dmId: dmId,
            message: message,
          },
          headers: {
            token: token,
          }
        }
  );
}

// Tests for message/edit/v2
describe('Tests for message/edit/v2', () => {
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

    channelId1 = requestChannelsCreateV3(token1, 'Channel 1', true);
    channelId2 = requestChannelsCreateV3(token2, 'Channel 2', true);

    // Invite token2 into Channel 1 and token3 into Channel 2
    requestChannelInviteV3(token1, channelId1, 2); // TODO: change uID... getUId helper function?
    requestChannelInviteV3(token2, channelId2, 3);

    messageId1 = requestMessageSendV2(token1, channelId1, 'Message 1.1');
    messageId2 = requestMessageSendV2(token2, channelId1, 'Message 1.2');
    messageId3 = requestMessageSendV2(token2, channelId2, 'Message 2.1');
    messageId4 = requestMessageSendV2(token3, channelId2, 'Message 2.2');
  });

  afterEach(() => {
    requestClear();
  });

  test('Case 1: invalid token given', () => {
    const res = requestMessageEditV2('invalid-token', messageId1, 'Edited Message 1');
    expect(res.statusCode).toBe(FORBID);
  });

  test('Case 2: invalid messageId given', () => {
    const res = requestMessageEditV2(token1, 11, 'Edited Message 1.1');
    expect(res.statusCode).toBe(BAD_REQ);
  });

  test('Case 3: invalid message (1000+)', () => {
    const testMessage100 = 'dlXqa8qv6YSWfOcAO7Vf9gAjigjRXGjHygJahreDg0yKUIpKRKhQWpruNwESu7nKdwtJU0zGsM34tgCm9CaWyPkV4hhVClmFfQNM';
    let testMessage1000 = '';
    for (let i = 0; i < 11; i++) {
      testMessage1000 = testMessage1000 + testMessage100;
    }

    const res = requestMessageEditV2(token1, messageId1, testMessage1000);
    expect(res.statusCode).toBe(BAD_REQ);
  });

  test('Case 4: not global, messageId refers to valid message in a channel the user not member/owner of ', () => {
    const res = requestMessageEditV2(token3, messageId1, 'Edited Message 1.1');
    expect(res.statusCode).toBe(BAD_REQ);
  });

  test('Case 5: successful edit: not global, owner of channel, message not sent by user', () => {
    const res = requestMessageEditV2(token2, messageId4, 'Edited Message 2.2');
    expect(res.statusCode).toBe(OK);

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(bodyObj).toStrictEqual({});
  });

  test('Case 6: not global, not owner, is member, message not sent by user', () => {
    const res = requestMessageEditV2(token3, messageId3, 'Edited Message 2.1');
    expect(res.statusCode).toBe(FORBID);
  });

  test('Case 7: not global, not owner, message sent by user but left channel', () => {
    requestChannelLeaveV2(token2, channelId1);
    const res = requestMessageEditV2(token2, messageId2, 'Edited Message 1.2');
    expect(res.statusCode).toBe(BAD_REQ);
  });

  test('Case 8: successful message edit (in channels)', () => {
    const res = requestMessageEditV2(token1, messageId1, 'Edited Message 1.1');
    const messages: Array<message | undefined> = requestChannelMessageV3(token1, channelId1, 0);
    const editedMessage: message = messages.find(message => message.messageId === messageId1);

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({});
    expect(editedMessage.message).toStrictEqual('Edited Message 1.1');
  });

  test('Case 9: successful message edit (empty message string)', () => {
    const res = requestMessageEditV2(token1, messageId1, '');
    const messages: Array<message | undefined> = requestChannelMessageV3(token1, channelId1, 0);
    const editedMessage: message = messages.find(message => message.messageId === messageId1);

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({});
    expect(editedMessage).toStrictEqual(undefined);
  });

  test('Case 10: successful message edit (with global permissions)', () => {
    const res = requestMessageEditV2(token1, messageId3, 'Edited Message 2.1');
    const messages: Array<message | undefined> = requestChannelMessageV3(token2, channelId2, 0); // Assumption: global owner cannot access channelMessagesV3
    const editedMessage: message = messages.find(message => message.messageId === messageId3);

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({});
    expect(editedMessage.message).toStrictEqual('Edited Message 2.1');
  });

  test('Case 11: successful message edit (with dms)', () => {
    const dmId1: number = requestDmCreateV2(token1, [1, 3]);
    const messageId5: number = requestMessageSendDmV2(token1, dmId1, 'Message Dm 1.1');

    const res = requestMessageEditV2(token1, messageId5, 'Edited Message Dm 1.1');
    const messages: Array<message | undefined> = requestDmMessageV2(token1, dmId1, 0);
    const editedMessage: message = messages.find(message => message.messageId === messageId5);

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({});
    expect(editedMessage.message).toStrictEqual('Edited Message Dm 1.1');
  });
});

// Helper function for message/edit/v1 HTTP calls
function requestMessageEditV2(token: string, messageId: number, message: string) {
  return request(
    'PUT',
    `${url}:${port}/message/edit/v2`,
    {
      json: {
        messageId: messageId,
        message: message,
      },
      headers: {
        token: token,
      }
    }
  );
}

// Tests for message/remove/v2
describe('Tests for message/remove/v2 (for input and channels)', () => {
  let token1: string;
  let token2: string;
  let token3: string;
  let channelId1: number;
  let channelId2: number;
  let messageId1: number;
  // let messageId2: number;
  let messageId3: number;

  beforeEach(() => {
    //  channelId1: [owners: 1][members: 1,2] channelId2: [owners: 1, 2][members: 2, 3] (because token1 is a global owner)
    token1 = requestAuthUserRegisterV3('example1@email.com', 'password1', 'John', 'Smith');
    token2 = requestAuthUserRegisterV3('example2@email.com', 'password2', 'Jane', 'Citizen');
    token3 = requestAuthUserRegisterV3('example3@email.com', 'password3', 'James', 'Adam');

    channelId1 = requestChannelsCreateV3(token1, 'Channel 1', true);
    channelId2 = requestChannelsCreateV3(token2, 'Channel 2', true);

    // Invite token2 into Channel 1
    requestChannelInviteV3(token1, channelId1, 2);
    requestChannelInviteV3(token2, channelId2, 3); // TODO: change uID
    messageId1 = requestMessageSendV2(token1, channelId1, 'Message 1.1');
    // messageId2 = requestMessageSendV2(token2, channelId1, 'Message 1.2');
    messageId3 = requestMessageSendV2(token2, channelId2, 'Message 2.1');
  });

  afterEach(() => {
    requestClear();
  });

  test('Case 1: invalid token given', () => {
    const res = requestMessageRemoveV2('invalid-token', messageId1);
    expect(res.statusCode).toBe(FORBID);
  });

  test('Case 2: invalid messageId given', () => {
    const res = requestMessageRemoveV2(token1, 11);
    expect(res.statusCode).toBe(BAD_REQ);
  });

  test('Case 3: messageId refers to valid message in a channel user not member of ', () => {
    const res = requestMessageRemoveV2(token3, messageId1);
    expect(res.statusCode).toBe(BAD_REQ);
  });

  test('Case 4: message not sent by user and not global owner', () => {
    const res = requestMessageRemoveV2(token2, messageId1);
    expect(res.statusCode).toBe(FORBID);
  });

  test('Case 5: user does not have owner permissions', () => {
    const res = requestMessageRemoveV2(token3, messageId3);
    expect(res.statusCode).toBe(FORBID);
  });

  test('Case 6: successful message remove (channel)', () => {
    const res = requestMessageRemoveV2(token1, messageId1);
    const messages: Array<message | undefined> = requestChannelMessageV3(token1, channelId1, 0);
    const removedMessage: message = messages.find(message => message.messageId === messageId1);

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({});
    expect(removedMessage).toStrictEqual(undefined);
  });
});

describe('Tests for message/remove/v2 (for dms)', () => {
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

    messageId1 = requestMessageSendDmV2(token1, dmId1, 'Message 1.1');
    messageId2 = requestMessageSendDmV2(token2, dmId1, 'Message 1.2');
    messageId3 = requestMessageSendDmV2(token2, dmId2, 'Message 2.1');
    messageId4 = requestMessageSendDmV2(token3, dmId2, 'Message 2.2');
  });

  afterEach(() => {
    requestClear();
  });

  test('Case 1: invalid messageId given', () => {
    const res = requestMessageRemoveV2(token1, 21);
    expect(res.statusCode).toBe(BAD_REQ);
  });

  test('Case 2: user did not sent message, not owner of channel', () => {
    const res = requestMessageRemoveV2(token3, messageId3);
    expect(res.statusCode).toBe(FORBID);
  });

  test('Case 3: user sent message, not member of channel (i.e left channel)', () => {
    requestDmLeaveV2(token3, dmId2);
    const res = requestMessageRemoveV2(token3, messageId4);
    expect(res.statusCode).toBe(BAD_REQ);
  });

  test('Case 4: success remove: user is owner, did not send message', () => {
    const res = requestMessageRemoveV2(token1, messageId2);
    const messages: Array<message | undefined> = requestDmMessageV2(token1, dmId1, 0);
    const removedMessage: message = messages.find(message => message.messageId === messageId2);

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({});
    expect(removedMessage).toStrictEqual(undefined);
  });

  test('Case 5: successful message remove', () => {
    const res = requestMessageRemoveV2(token1, messageId1);
    const messages: Array<message | undefined> = requestDmMessageV2(token1, dmId1, 0);

    const removedMessage: message = messages.find(message => message.messageId === messageId1);

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({});
    expect(removedMessage).toStrictEqual(undefined);
  });
});

// Helper function for message/remove/v1 HTTP calls
function requestMessageRemoveV2(token: string, messageId: number) {
  return request(
    'DELETE',
    `${url}:${port}/message/remove/v2`,
    {
      qs: {
        messageId: messageId,
      },
      headers: {
        token: token,
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
    token1 = requestAuthUserRegisterV3('example1@email.com', 'password1', 'John', 'Smith');
    token2 = requestAuthUserRegisterV3('example2@email.com', 'password2', 'Jane', 'Citizen');
    token3 = requestAuthUserRegisterV3('example3@email.com', 'password3', 'James', 'Adam');
    channelId1 = requestChannelsCreateV3(token1, 'Channel 1', true);
    channelId2 = requestChannelsCreateV3(token2, 'Channel 2', true);
    dmId1 = requestDmCreateV2(token2, [2, 3]);
    dmId2 = requestDmCreateV2(token1, [1, 2]);

    // Invite token2 into Channel 1
    requestChannelInviteV3(token1, channelId1, 2);
    requestChannelInviteV3(token2, channelId2, 3);
    messageId1 = requestMessageSendV2(token1, channelId1, 'CMessage 1.1');
    messageId2 = requestMessageSendV2(token2, channelId1, 'CMessage 1.2');
    messageId3 = requestMessageSendV2(token2, channelId2, 'CMessage 2.1');
    messageId4 = requestMessageSendDmV2(token2, dmId1, 'DMessage 1.1');
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

  test('Case 2: Neither channelId nor dmId are -1 or both are -1', () => {
    // Token 2 is sharing messageId to channel2 and dm1 but not -1
    const res1 = requestMessageShareV1(token2, messageId1, 'Attach message', channelId1, -100);
    const res2 = requestMessageShareV1(token2, messageId1, 'Attach message', -100, dmId1);
    const res3 = requestMessageShareV1(token2, messageId1, 'Attach message', -1, -1);
    expect(res1.statusCode).toBe(BAD_REQ);
    expect(res2.statusCode).toBe(BAD_REQ);
    expect(res3.statusCode).toBe(BAD_REQ);
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

    const messages: Array<message | undefined> = requestChannelMessageV3(token2, channelId2, 0);
    const sharedMessage: message = messages.find(message => message.messageId === bodyObj.sharedMessageId);
    expect(sharedMessage.message.includes('Attach message')).toStrictEqual(true);
  });

  test('Case 7: (dm) successful message share with no attached message', () => {
    // Token 2 share message from dm1 to dm2
    const res = requestMessageShareV1(token2, messageId4, '', -1, dmId2);
    expect(res.statusCode).toBe(OK);

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(bodyObj.sharedMessageId).toStrictEqual(expect.any(Number));

    const messages: Array<message | undefined> = requestDmMessageV2(token2, dmId2, 0);
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

// Tests for message/sendlater/v1
describe('Tests for message/sendlater/v1', () => {
  let channelId1: number;
  let token1: string;
  let token2: string;

  beforeEach(() => {
    token1 = requestAuthUserRegisterV3('example1@email.com', 'password1', 'John', 'Smith');
    token2 = requestAuthUserRegisterV3('example2@email.com', 'password2', 'Jane', 'Citizen');
    channelId1 = requestChannelsCreateV3(token1, 'Channel 1', true);
  });

  afterEach(() => {
    requestClear();
  });

  test('Case 1: channelId does not refer to valid channel', () => {
    const allChannels = requestChannelsListallV3(token1);
    let invalidId = 199;
    for (const i in allChannels) {
      if (invalidId === allChannels[i].channelId) {
        invalidId = invalidId + 100;
      }
    }

    const timeSent = Math.floor(Date.now() / 1000) + 3;
    const res = requestMessageSendLaterV1(token1, invalidId, 'Message 1', timeSent);
    expect(res.statusCode).toBe(BAD_REQ);
  });

  test('Case 2: length of message is more than 1000 characters', () => {
    // Generate 1000+ character message
    const testMessage100 = 'dlXqa8qv6YSWfOcAO7Vf9gAjigjRXGjHygJahreDg0yKUIpKRKhQWpruNwESu7nKdwtJU0zGsM34tgCm9CaWyPkV4hhVClmFfQNM';
    let testMessage1000 = '';
    for (let i = 0; i < 11; i++) {
      testMessage1000 = testMessage1000 + testMessage100;
    }

    const timeSent = Math.floor(Date.now() / 1000) + 1;
    const res = requestMessageSendLaterV1(token1, channelId1, testMessage1000, timeSent);
    expect(res.statusCode).toBe(BAD_REQ);
  });

  test('Case 3: length of message is less than 1 character', () => {
    const timeSent = Math.floor(Date.now() / 1000) + 1;
    const res = requestMessageSendLaterV1(token1, channelId1, '', timeSent);
    expect(res.statusCode).toBe(BAD_REQ);
  });

  test('Case 3: timeSent is in the past', () => {
    // Token 1 attempt to send message to channel1
    const timeSent = Math.floor(Date.now() / 1000) - 5;
    const res = requestMessageSendLaterV1(token1, channelId1, 'Message 1', timeSent);
    expect(res.statusCode).toBe(BAD_REQ);
  });

  test('Case 4: channelId refers to channel user not member of', () => {
    // Token 2 attempt to send message to channel1 (1 second later)
    const timeSent = Math.floor(Date.now() / 1000) + 3;
    const res = requestMessageSendLaterV1(token2, channelId1, 'Message 1', timeSent);
    expect(res.statusCode).toBe(FORBID);
  });

  test('Case 5: successful send later', () => {
    // Token 1 send message 1 second later to channel1
    const timeSent = Math.floor(Date.now() / 1000) + 2;
    const res = requestMessageSendLaterV1(token1, channelId1, 'Message 1', timeSent);
    expect(res.statusCode).toBe(OK);

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(bodyObj.messageId).toStrictEqual(expect.any(Number));
  });

  test('Case 6: invalid token', () => {
    // Invalid token send message 1 second later to channel1
    const timeSent = Math.floor(Date.now() / 1000) + 1;
    const res = requestMessageSendLaterV1('invalid-token', channelId1, 'Message 1', timeSent);
    expect(res.statusCode).toBe(FORBID);
  });
});

function requestMessageSendLaterV1(token: string, channelId: number, message: string, timeSent: number) {
  return request(
    'POST',
    `${url}:${port}/message/sendlater/v1`,
    {
      json: {
        channelId: channelId,
        message: message,
        timeSent: timeSent,
      },
      headers: {
        token: token,
      }
    }
  );
}

// Tests for message/sendlaterdm/v1
describe('Tests for message/sendlaterdm/v1', () => {
  let dmId1: number;
  let dmId2: number;
  let token1: string;
  let token2: string;

  beforeEach(() => {
    token1 = requestAuthUserRegisterV3('example1@email.com', 'password1', 'John', 'Smith');
    token2 = requestAuthUserRegisterV3('example2@email.com', 'password2', 'Jane', 'Citizen');
    dmId1 = requestDmCreateV2(token1, [1, 2]);
    dmId2 = requestDmCreateV2(token2, [2]);
  });

  afterEach(() => {
    requestClear();
  });

  test('Case 1: dmId does not refer to valid dm', () => {
    // NOTE: cannot use method as did before as cannot list all DMs in dataStore without referring to it
    const invalidId = Math.floor((Math.random() * 1000) + 1000);

    const timeSent = Math.floor(Date.now() / 1000) + 1;
    const res = requestMessageSendLaterDmV1(token1, invalidId, 'Message 1', timeSent);
    expect(res.statusCode).toBe(BAD_REQ);
  });

  test('Case 2: length of message is more than 1000 characters', () => {
    // Generate 1000+ character message
    const testMessage100 = 'dlXqa8qv6YSWfOcAO7Vf9gAjigjRXGjHygJahreDg0yKUIpKRKhQWpruNwESu7nKdwtJU0zGsM34tgCm9CaWyPkV4hhVClmFfQNM';
    let testMessage1000 = '';
    for (let i = 0; i < 11; i++) {
      testMessage1000 = testMessage1000 + testMessage100;
    }

    const timeSent = Math.floor(Date.now() / 1000) + 1;
    const res = requestMessageSendLaterDmV1(token1, dmId1, testMessage1000, timeSent);
    expect(res.statusCode).toBe(BAD_REQ);
  });

  test('Case 3: length of message is less than 1 character', () => {
    const timeSent = Math.floor(Date.now() / 1000) + 1;
    const res = requestMessageSendLaterDmV1(token1, dmId1, '', timeSent);
    expect(res.statusCode).toBe(BAD_REQ);
  });

  test('Case 4: timeSent is in the past', () => {
    // Token 1 attempt to send message to channel1
    const timeSent = Math.floor(Date.now() / 1000) - 5;
    const res = requestMessageSendLaterDmV1(token1, dmId1, 'Message 1', timeSent);
    expect(res.statusCode).toBe(BAD_REQ);
  });

  test('Case 5: dmID refers to dm user not member of', () => {
    // Token 1 attempt to send message to channel1 (5 seconds later)
    const timeSent = Math.floor(Date.now() / 1000) + 1;
    const res = requestMessageSendLaterDmV1(token1, dmId2, 'Message 1', timeSent);
    expect(res.statusCode).toBe(FORBID);
  });

  test('Case 6: successful send later', () => {
    // Token 1 send message 5 seconds later to channel1
    const timeSent = Math.floor(Date.now() / 1000) + 2;
    const res = requestMessageSendLaterDmV1(token1, dmId1, 'Message 1', timeSent);
    expect(res.statusCode).toBe(OK);

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(bodyObj.messageId).toStrictEqual(expect.any(Number));
  });

  test('Case 7: DM is removed before the message has sent', () => {
    const timeSent = Math.floor(Date.now() / 1000) + 1;
    const res = requestMessageSendLaterDmV1(token1, dmId1, 'Message 1', timeSent);
    requestDmRemoveV2(token1, dmId1);
    expect(res.statusCode).toBe(OK);

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(bodyObj.messageId).toStrictEqual(expect.any(Number));
  });

  test('Case 8: invalid token', () => {
    const timeSent = Math.floor(Date.now() / 1000) + 1;
    const res = requestMessageSendLaterDmV1('invalid-token', dmId1, 'Message 1', timeSent);
    expect(res.statusCode).toBe(FORBID);
  });
});

function requestMessageSendLaterDmV1(token: string, dmId: number, message: string, timeSent: number) {
  return request(
    'POST',
    `${url}:${port}/message/sendlaterdm/v1`,
    {
      json: {
        dmId: dmId,
        message: message,
        timeSent: timeSent,
      },
      headers: {
        token: token,
      }
    }
  );
}

// Tests for message/pin/v1
describe('Tests for message/pin/v1', () => {
  let token1: string;
  let token2: string;
  let token3: string;
  let channelId1: number;
  let channelId2: number;
  let dmId1: number;
  let messageId1: number;
  let messageId2: number;
  // let messageId3: number;
  let messageId4: number;
  // let messageId5: number;

  beforeEach(() => {
    //  channelId1: [owners: 1][members: 1,2] channelId2: [owners: 1, 2][members: 2, 3] (because token1 is a global owner)
    token1 = requestAuthUserRegisterV3('example1@email.com', 'password1', 'John', 'Smith');
    token2 = requestAuthUserRegisterV3('example2@email.com', 'password2', 'Jane', 'Citizen');
    token3 = requestAuthUserRegisterV3('example3@email.com', 'password3', 'James', 'Adam');
    channelId1 = requestChannelsCreateV3(token1, 'Channel 1', true);
    channelId2 = requestChannelsCreateV3(token2, 'Channel 2', true);
    dmId1 = requestDmCreateV2(token2, [2, 3]);

    // Invite token2 into Channel 1 and token3 into Channel 2
    requestChannelInviteV3(token1, channelId1, 2);
    requestChannelInviteV3(token2, channelId2, 3);

    messageId1 = requestMessageSendV2(token1, channelId1, 'Message C1.1');
    messageId2 = requestMessageSendV2(token2, channelId2, 'Message C2.1');
    // messageId3 = requestMessageSendV2(token3, channelId2, 'Message C2.2');
    messageId4 = requestMessageSendDmV2(token2, dmId1, 'Message D1.1');
    // messageId5 = requestMessageSendDmV2(token3, dmId1, 'Message D1.2');
  });

  afterEach(() => {
    requestClear();
  });

  test('Case 1: messageId refers to message in a channel user not member of', () => {
    // Token3 is pinning messageId1 which is in different channel
    const res = requestMessagePinV1(token3, messageId1);
    expect(res.statusCode).toBe(BAD_REQ);
  });

  test('Case 2: messageId refers to message in a dm user not member of', () => {
    // Token1 is pinning messageId1 which is in different channel
    const res = requestMessagePinV1(token1, messageId4);
    expect(res.statusCode).toBe(BAD_REQ);
  });

  test('Case 3: messageId is already pinned', () => {
    // Token1 is pinning messageId1 in channel1
    requestMessagePinV1(token1, messageId1);

    // Token1 is pinning messageId1 again
    const res = requestMessagePinV1(token1, messageId1);
    expect(res.statusCode).toBe(BAD_REQ);
  });

  test('Case 4: user with no owner permissions in channel', () => {
    // Token 3 (not owner) pins messageId2
    const res = requestMessagePinV1(token3, messageId2);
    expect(res.statusCode).toBe(FORBID);
  });

  test('Case 5: user with no owner permissions in dm', () => {
    // Token 3 (not owner) pins messageId3
    const res = requestMessagePinV1(token3, messageId4);
    expect(res.statusCode).toBe(FORBID);
  });

  test('Case 6: sucessful pin, user global owner (channel)', () => {
    // Token 1 (global owner) pins messageId2
    const res = requestMessagePinV1(token1, messageId2);
    expect(res.statusCode).toBe(OK);

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(bodyObj).toStrictEqual({});
  });

  test('Case 7: sucessful pin, (dm)', () => {
    // Token 2 (owner of dm) pins messageId3
    const res = requestMessagePinV1(token2, messageId4);
    expect(res.statusCode).toBe(OK);

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(bodyObj).toStrictEqual({});
  });

  test('Case 8: invalid token', () => {
    const res = requestMessagePinV1('invalid-token', messageId1);
    expect(res.statusCode).toBe(FORBID);
  });

  test('Case 9: invalid messageId (channel)', () => {
    const res = requestMessagePinV1(token1, 11);
    expect(res.statusCode).toBe(BAD_REQ);
  });
});

// Helper function for message/pin/v1 HTTP requests
function requestMessagePinV1(token: string, messageId: number) {
  return request(
    'POST',
    `${url}:${port}/message/pin/v1`,
    {
      json: {
        messageId: messageId,
      },
      headers: {
        token: token,
      }
    }
  );
}

// Tests for message/unpin/v1
describe('Tests for message/unpin/v1', () => {
  let token1: string;
  let token2: string;
  let token3: string;
  let channelId1: number;
  let channelId2: number;
  let dmId1: number;
  let messageId1: number;
  let messageId2: number;
  let messageId3: number;

  beforeEach(() => {
    //  channelId1: [owners: 1][members: 1,2] channelId2: [owners: 1, 2][members: 2, 3] (because token1 is a global owner)
    token1 = requestAuthUserRegisterV3('example1@email.com', 'password1', 'John', 'Smith');
    token2 = requestAuthUserRegisterV3('example2@email.com', 'password2', 'Jane', 'Citizen');
    token3 = requestAuthUserRegisterV3('example3@email.com', 'password3', 'James', 'Adam');
    channelId1 = requestChannelsCreateV3(token1, 'Channel 1', true);
    channelId2 = requestChannelsCreateV3(token2, 'Channel 2', true);
    dmId1 = requestDmCreateV2(token2, [2, 3]);

    // Invite token2 into Channel 1 and token3 into Channel 2
    requestChannelInviteV3(token1, channelId1, 2);
    requestChannelInviteV3(token2, channelId2, 3);

    messageId1 = requestMessageSendV2(token1, channelId1, 'Message C1.1');
    messageId2 = requestMessageSendV2(token2, channelId2, 'Message C2.1');
    messageId3 = requestMessageSendDmV2(token2, dmId1, 'Message D1.1');
    requestMessagePinV1(token1, messageId1);
    requestMessagePinV1(token1, messageId2);
    requestMessagePinV1(token2, messageId3);
  });

  afterEach(() => {
    requestClear();
  });

  test('Case 1: messageId refers to message in a channel user not member of', () => {
    // Token3 is unpinning messageId1 which is in different channel
    const res = requestMessageUnPinV1(token3, messageId1);
    expect(res.statusCode).toBe(BAD_REQ);
  });

  test('Case 2: messageId is already unpinned', () => {
    // Token1 is unpinning messageId1 in channel1
    requestMessageUnPinV1(token1, messageId1);

    // Token1 is unpinning messageId1 again
    const res = requestMessageUnPinV1(token1, messageId1);
    expect(res.statusCode).toBe(BAD_REQ);
  });

  test('Case 3: user no owner permissions in channel', () => {
    // Token 3 (not owner) unpins messageId2
    const res = requestMessageUnPinV1(token3, messageId2);
    expect(res.statusCode).toBe(FORBID);
  });

  test('Case 4: user no owner permissions in dm', () => {
    // Token 3 (not owner) unpins messageId3
    const res = requestMessageUnPinV1(token3, messageId3);
    expect(res.statusCode).toBe(FORBID);
  });

  test('Case 5: sucessful unpin, user global owner (channel)', () => {
    // Token 1 (global owner) unpins messageId2
    const res = requestMessageUnPinV1(token1, messageId2);
    expect(res.statusCode).toBe(OK);

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(bodyObj).toStrictEqual({});
  });

  test('Case 6: sucessful unpin, (dm)', () => {
    // Token 2 (owner of dm) unpins messageId3
    const res = requestMessageUnPinV1(token2, messageId3);
    expect(res.statusCode).toBe(OK);

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(bodyObj).toStrictEqual({});
  });

  test('Case 7: invalid token', () => {
    const res = requestMessageUnPinV1('invalid-token', messageId1);
    expect(res.statusCode).toBe(FORBID);
  });

  test('Case 8: invalid messageId (dm)', () => {
    const res = requestMessageUnPinV1(token2, 21);
    expect(res.statusCode).toBe(BAD_REQ);
  });
});

// Helper function for message/pin/v1 HTTP requests
function requestMessageUnPinV1(token: string, messageId: number) {
  return request(
    'POST',
    `${url}:${port}/message/unpin/v1`,
    {
      json: {
        messageId: messageId,
      },
      headers: {
        token: token,
      }
    }
  );
}

/// ///////////////////////////////////////////////////////////////////
/// /////////////////// Tests for messageReactV1 //////////////////////
/// ///////////////////////////////////////////////////////////////////

test('Testing invalid reactID', () => {
  requestClear();

  const jamesToken = requestAuthUserRegisterV3('james@gmail.com', 'testPassword123', 'James', 'Brown');
  const rufusToken = requestAuthUserRegisterV3('rufus@gmail.com', 'testPassword123', 'Rufus', 'Green');
  const testCreatedChannelID = requestChannelsCreateV3(jamesToken, 'testChannel1', true);
  requestchannelJoinV3(rufusToken, testCreatedChannelID);
  const jamesSentMessageID = requestMessageSendV2(jamesToken, testCreatedChannelID, 'I am james, please react rufus');

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
  const testCreatedChannelID = requestChannelsCreateV3(jamesToken, 'testChannel1', true);
  requestchannelJoinV3(rufusToken, testCreatedChannelID);
  const jamesSentMessageID = requestMessageSendV2(jamesToken, testCreatedChannelID, 'I am james, please react rufus');

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
  const testCreatedChannelID = requestChannelsCreateV3(jamesToken, 'testChannel1', true);
  const jamesSentMessageID = requestMessageSendV2(jamesToken, testCreatedChannelID, 'I am james, please react rufus');

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
  const testCreatedChannelID = requestChannelsCreateV3(jamesToken, 'testChannel1', true);
  requestchannelJoinV3(rufusToken, testCreatedChannelID);
  const jamesSentMessageID = requestMessageSendV2(jamesToken, testCreatedChannelID, 'I am james, please react rufus');

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
  const testCreatedChannelID = requestChannelsCreateV3(jamesToken, 'testChannel1', true);
  requestchannelJoinV3(rufusToken, testCreatedChannelID);
  const jamesSentMessageID = requestMessageSendV2(jamesToken, testCreatedChannelID, 'I am james, please react rufus');

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
  const testCreatedChannelID = requestChannelsCreateV3(jamesToken, 'testChannel1', true);
  requestchannelJoinV3(rufusToken, testCreatedChannelID);
  const jamesSentMessageID = requestMessageSendV2(jamesToken, testCreatedChannelID, 'I am james, please react rufus');

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
  const jamesSentMessageID = requestMessageSendDmV2(jamesToken, dmId1, 'I am james, please react rufus');

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
  const jamesSentMessageID = requestMessageSendDmV2(jamesToken, dmId1, 'I am james, please react rufus');

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
  const jamesSentMessageID = requestMessageSendDmV2(jamesToken, dmId1, 'I am james, please react rufus');

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
  const testCreatedChannelID = requestChannelsCreateV3(jamesToken, 'testChannel1', true);
  requestchannelJoinV3(rufusToken, testCreatedChannelID);
  const jamesSentMessageID = requestMessageSendV2(jamesToken, testCreatedChannelID, 'I am james, please react rufus');

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
  const testCreatedChannelID = requestChannelsCreateV3(jamesToken, 'testChannel1', true);
  requestchannelJoinV3(rufusToken, testCreatedChannelID);
  const jamesSentMessageID = requestMessageSendV2(jamesToken, testCreatedChannelID, 'I am james, please react rufus');

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
  const testCreatedChannelID = requestChannelsCreateV3(jamesToken, 'testChannel1', true);
  requestchannelJoinV3(rufusToken, testCreatedChannelID);
  const jamesSentMessageID = requestMessageSendV2(jamesToken, testCreatedChannelID, 'I am james, please react rufus');

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
  const testCreatedChannelID = requestChannelsCreateV3(jamesToken, 'testChannel1', true);
  requestchannelJoinV3(rufusToken, testCreatedChannelID);
  const jamesSentMessageID = requestMessageSendV2(jamesToken, testCreatedChannelID, 'I am james, please react rufus');

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
  const testCreatedChannelID = requestChannelsCreateV3(jamesToken, 'testChannel1', true);
  requestchannelJoinV3(rufusToken, testCreatedChannelID);
  const jamesSentMessageID = requestMessageSendV2(jamesToken, testCreatedChannelID, 'I am james, please react rufus');

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
  const jamesSentMessageID = requestMessageSendDmV2(jamesToken, dmId1, 'I am james, please react rufus');

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
  const jamesSentMessageID = requestMessageSendDmV2(jamesToken, dmId1, 'I am james, please react rufus');

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

function requestChannelsCreateV3(token: string, name: string, isPublic: boolean) {
  const res = request(
    'POST',
    `${url}:${port}/channels/create/v3`,
    {
      body: JSON.stringify({ name: name, isPublic: isPublic }),
      headers: {
        token: token,
        'Content-type': 'application/json',
      },
    }
  );

  return JSON.parse(String(res.getBody())).channelId;
}

function requestChannelsListallV3(token: string) {
  const res = request(
    'GET',
    `${url}:${port}/channels/listall/v3`,
    {
      headers: {
        token: token,
      },
    }
  );

  return JSON.parse(String(res.getBody())).channels;
}

function requestChannelInviteV3(token: string, channelId: number, uId: number) {
  const res = request(
    'POST',
    `${url}:${port}/channel/invite/v3`,
    {
      json: {
        channelId: channelId,
        uId: uId,
      },
      headers: {
        token: token,
      },
    });

  return JSON.parse(String(res.getBody()));
}

function requestchannelJoinV3(tokens: string, channelIds: number) {
  const res = request(
    'POST', `${url}:${port}/channel/join/v3`,
    {
      body: JSON.stringify({ channelId: channelIds }),
      headers: {
        token: tokens,
        'Content-type': 'application/json',
      },
    }
  );
  return JSON.parse(String(res.getBody()));
}

function requestChannelLeaveV2(token: string, channelId: number) {
  const res = request(
    'POST',
    `${url}:${port}/channel/leave/v2`,
    {
      json: {
        channelId: channelId,
      },
      headers: {
        token: token,
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

function requestChannelMessageV3(token: string, channelId: number, start: number) {
  const res = request(
    'GET',
    `${url}:${port}/channel/messages/v3`,
    {
      qs: {
        channelId: channelId,
        start: start,
      },
      headers: {
        token: token,
      }
    }
  );

  return JSON.parse(String(res.getBody())).messages;
}

export function requestMessageSendV2(token: string, channelId: number, message: string) {
  const res = request(
    'POST',
    `${url}:${port}/message/send/v2`,
    {
      json: {
        channelId: channelId,
        message: message,
      },
      headers: {
        token: token,
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

function requestDmRemoveV2(token: string, dmId: number) {
  const res = request(
    'DELETE',
    `${url}:${port}/dm/remove/v2`,
    {
      qs: {
        dmId: dmId,
      },
      headers: {
        token: token,
      },
    }
  );

  return JSON.parse(String(res.getBody()));
}

export function requestMessageSendDmV2(token: string, dmId: number, message: string) {
  const res = request(
    'POST',
        `${url}:${port}/message/senddm/v2`,
        {
          json: {
            dmId: dmId,
            message: message,
          },
          headers: {
            token: token,
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
