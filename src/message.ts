import { getData, setData, dataStoreType, user, channel, message, dm } from './dataStore';
import { channelsListV2 } from './channels';
import { getTags, sendNotificationsTag /* , sendNotificationReact */ } from './other';
import { dmListV2 } from './dm';
import HTTPError from 'http-errors';

type channelOutput = {
  channelId: number;
  name: string;
}

type dmOutput = {
  dmId: number;
  name: string;
}

const REMOVE = 'r';
const EDIT = 'e';
const CHANNEL = 'c';
const DM = 'd';
const PIN = 'p';
const UNPIN = 'u';

const FORBID = 403;
const BAD_REQ = 400;

/**
 * Given a valid inputs, sends message from user to specified channel and
 * returns a unique message id.
 *
 * Arguments:
 *      token:      string     The user's unique identifier
 *      channelId:  number     The channel's unique identifier
 *      message:    string     The message
 *
 * Returns:
 *      { messageId: <number> } object     Successful message send
 */
export function messageSendV2(token: string, channelId: number, message: string) {
  const data: dataStoreType = getData();

  // Token validation
  if (data.users.find(user => user.tokens.find(tok => tok === token)) === undefined) {
    throw HTTPError(FORBID, 'Invalid token');
  }

  const userId: number = data.users.find(user => user.tokens.find(tok => tok === token)).uId;

  // Checking if valid channelId were given
  if (data.channels.find(channel => channel.channelId === channelId) === undefined) {
    throw HTTPError(BAD_REQ, 'Invalid channelId');
  }

  // Validating if authorised user is a member of the channel
  if (isMember(CHANNEL, token, channelId) === false) {
    throw HTTPError(FORBID, 'Invalid access to channel');
  }

  const channelGivenIndex: number = data.channels.findIndex(channel => channel.channelId === channelId);

  // Message validation
  if (message.length < 1 || message.length > 1000) {
    throw HTTPError(BAD_REQ, 'Invalid message length');
  }

  const newMessageId: number = generateId('c');

  const newMessage: message = {
    messageId: newMessageId,
    uId: userId,
    timeSent: Math.floor(Date.now() / 1000),
    message: message,
  };

  data.channels[channelGivenIndex].messages.unshift(newMessage);
  setData(data);

  // Notifcation >>>>>>>>
  const uIds = getTags(message);
  const userHandle = data.users.find(user => user.tokens.find(tok => tok === token)).handleStr;
  sendNotificationsTag(data, uIds, channelId, userHandle, message);
  // >>>>>>>>>>

  // Analytics >>>>>>>>>>
  const time = Date.now();
  // User Stats
  const uId = userId;
  const userStats = data.userStats.find(i => i.uId === uId);

  data.userStats = data.userStats.filter(i => i.uId !== uId);

  const numMessagesSent = userStats.messagesSent[userStats.messagesSent.length - 1].numMessagesSent + 1;
  userStats.messagesSent.push({ numMessagesSent: numMessagesSent, timeStamp: time });
  data.userStats.push(userStats);

  // Workspace stats
  const numMessagesExist = data.workspaceStats.messagesExist[data.workspaceStats.messagesExist.length - 1].numMessagesExist + 1;
  data.workspaceStats.messagesExist.push({ numMessagesExist: numMessagesExist, timeStamp: time });

  setData(data);
  // >>>>>>>>>>

  const newMessageId = sendMessage(CHANNEL, userId, message, channelGivenIndex);
  return { messageId: newMessageId };
}

/**
 * Given a valid inputs, sends message from user to specified dm and
 * returns a unique message id.
 *
 * Arguments:
 *      token:      string     The user's unique identifier
 *      dmId:       number     The channel's unique identifier
 *      message:    string     The edited message
 *
 * Returns:
 *      { error: 'error' }      object     Error message (given invalid input)
 *      { messageId: <number> } object     Successful message send
 */
export function messageSendDmV2(token: string, dmId: number, message: string) {
  const data: dataStoreType = getData();

  // Token validation
  if (data.users.find(user => user.tokens.find(tok => tok === token)) === undefined) {
    throw HTTPError(FORBID, 'Invalid token');
  }

  const userId: number = data.users.find(user => user.tokens.find(tok => tok === token)).uId;

  // Checking if valid dmId was given
  if (data.dms.find(dm => dm.dmId === dmId) === undefined) {
    throw HTTPError(BAD_REQ, 'Invalid dmId');
  }

  // Validating if authorised user is a member of the DM
  if (isMember(DM, token, dmId) === false) {
    throw HTTPError(FORBID, 'Invalid access to dm');
  }

  const dmGivenIndex: number = data.dms.findIndex(dm => dm.dmId === dmId);

  // Message validation
  if (message.length < 1 || message.length > 1000) {
    throw HTTPError(BAD_REQ, 'Invalid message length');
  }

  const newMessageId: number = generateId('d');

  const newMessage: message = {
    messageId: newMessageId,
    uId: userId,
    timeSent: Math.floor(Date.now() / 1000),
    message: message,
  };

  data.dms[dmGivenIndex].messages.unshift(newMessage);
  setData(data);

  // Notifcation >>>>>>>>
  const uIds = getTags(message);
  const userHandle = data.users.find(user => user.tokens.find(tok => tok === token)).handleStr;
  sendNotificationsTag(data, uIds, dmId, userHandle, message);
  // >>>>>>>>>>

  // Analytics >>>>>>>>
  const time = Date.now();
  // User Stats
  const uId = userId;
  const userStats = data.userStats.find(i => i.uId === uId);

  data.userStats = data.userStats.filter(i => i.uId !== uId);

  const numMessagesSent = userStats.messagesSent[userStats.messagesSent.length - 1].numMessagesSent + 1;
  userStats.messagesSent.push({ numMessagesSent: numMessagesSent, timeStamp: time });
  data.userStats.push(userStats);

  // Workspace stats
  const numMessagesExist = data.workspaceStats.messagesExist[data.workspaceStats.messagesExist.length - 1].numMessagesExist + 1;
  data.workspaceStats.messagesExist.push({ numMessagesExist: numMessagesExist, timeStamp: time });

  setData(data);
  // >>>>>>>>>>

  const newMessageId = sendMessage(DM, userId, message, dmGivenIndex);
  return { messageId: newMessageId };
}

/**
 * Given a valid mode (c/d), an id is generated by appending mode,
 * Unix timestamp and random number.
 *
 * Arguments:
 *      mode:      string     'c' denotes channel
 *                            'd' denotes dm
 *
 * Returns:
 *      newId      number     A unique identifier
 */
function generateId(mode: string) {
  let newId: string;
  if (mode === CHANNEL) {
    newId = '1' + String(Date.now()) + String(Math.floor(Math.random() * 100));
  } else if (mode === DM) {
    newId = '2' + String(Date.now()) + String(Math.floor(Math.random() * 100));
  }

  return Number(newId);
}

/**
* Given a valid messageId and message, the message with messageId is found
* and replaced with new message.
*
* Arguments:
*      token:      string     The user's unique identifier
*      messageId:  number     The messages's unique identifier
*      message:    string     The edited message
*
* Returns:
*      { }                    object     Successful messageEdit
*/
export function messageEditV2(token: string, messageId: number, message: string) {
  const data: dataStoreType = getData();
  const mode = EDIT;

  // Token validation
  if (data.users.find(user => user.tokens.find(tok => tok === token)) === undefined) {
    throw HTTPError(FORBID, 'Invalid token');
  }

  // Get user information
  const user: user = data.users.find(user => user.tokens.find(tok => tok === token));
  const userId = user.uId;
  let isGlobalUser: boolean;
  if (user.isGlobalOwner === 1) {
    isGlobalUser = true;
  } else {
    isGlobalUser = false;
  }

  // Message validation
  if (message.length > 1000) {
    throw HTTPError(BAD_REQ, 'Invalid message length');
  } else if (message.length === 0) {
    return messageRemoveV2(token, messageId);
  }

  const firstDigit = String(messageId)[0];
  if (firstDigit === '1') {
    return editInChannel(mode, token, userId, isGlobalUser, messageId, message);
  } else if (firstDigit === '2') {
    return editInDm(mode, token, userId, messageId, message);
  }
}

/**
 * Given a valid messageId, the message is removed from the channel or dm
 *
 * Arguments:
 *      token:      string     The user's unique identifier
 *      messageId:  number     The message's unique identifier
 *
 * Returns:
 *      { error: 'error' }      object     Error message (given invalid input)
 *      { }                     object     Successful message remove
 */
export function messageRemoveV2(token: string, messageId: number) {
  const data: dataStoreType = getData();
  const mode = REMOVE;

  // Token validation
  if (data.users.find(user => user.tokens.find(tok => tok === token)) === undefined) {
    throw HTTPError(FORBID, 'Invalid token');
  }

  // Get user information
  const user: user = data.users.find(user => user.tokens.find(tok => tok === token));
  const userId = user.uId;
  let isGlobalUser: boolean;
  if (user.isGlobalOwner === 1) {
    isGlobalUser = true;
  } else {
    isGlobalUser = false;
  }

  const firstDigit = String(messageId)[0];
  if (firstDigit === '1') {
    return editInChannel(mode, token, userId, isGlobalUser, messageId);
  } else if (firstDigit === '2') {
    return editInDm(mode, token, userId, messageId);
  }
}

/**
 * Helper function for messageEditV1/messageRemoveV1 to edit/ remove messages in channels.
 *
 * Arguments:
 *      token:          string     The user's unique identifier
 *      userId:         number     The user's identifier
 *      isGlobalUser:   boolean    The user's global permissions
 *      messageId:      number     The message's unique identifier
 *      message:        string     The edited message
 *
 * Returns:
 *      { error: 'error' }     object     Error message when given invalid input
 *      { }                    object     Successful messageEdit
 */
function editInChannel(mode: string, token: string, userId: number, isGlobalUser: boolean, messageId: number, message?: string) {
  const data: dataStoreType = getData();

  const channelGiven: channel = isMessageValidChannel(messageId);
  const messageGiven: message = channelGiven.messages.find(message => message.messageId === messageId);

  // Checks if user is global owner (who can edit messages), otherwise check further:
  if (isGlobalUser === false) {
    // Checks if user is not owner of channel (who can edit messages), otherwise check further:
    if (channelGiven.ownerMembers.find(owner => owner === userId) === undefined) {
      // Checks if user is part of the channel (i.e. did not leave channel)
      if (isMember(CHANNEL, token, channelGiven.channelId) === false) {
        throw HTTPError(BAD_REQ, 'Invalid user accessing valid message');
        // Checks if the user (who is a member of channel) is the one wrote message
      } else if (messageGiven.uId !== userId) {
        throw HTTPError(FORBID, 'Invalid user accessing message');
      }
    }
  }

  const messageGivenIndex: number = channelGiven.messages.findIndex(message => message.messageId === messageId);
  const channelGivenIndex: number = data.channels.findIndex(channel => channel.channelId === channelGiven.channelId);

  if (mode === EDIT) {
    data.channels[channelGivenIndex].messages[messageGivenIndex].message = message;
  } else if (mode === REMOVE) {
    const removedMessage: Array<message> = channelGiven.messages.filter(message => message.messageId !== messageId);
    data.channels[channelGivenIndex].messages = removedMessage;
  }

  setData(data);
  // Notifcation >>>>>>>>
  if (mode === 'e') {
    const uIds = getTags(message);
    const userHandle = data.users.find(user => user.tokens.find(tok => tok === token)).handleStr;
    sendNotificationsTag(data, uIds, channelGiven.channelId, userHandle, message);
  }
  // >>>>>>>>>>

  // Analytics>>>>>>>>>>
  const time = Date.now();
  if (mode === 'r') {
    // Workspace stats
    const numMessagesExist = data.workspaceStats.messagesExist[data.workspaceStats.messagesExist.length - 1].numMessagesExist - 1;
    data.workspaceStats.messagesExist.push({ numMessagesExist: numMessagesExist, timeStamp: time });

    setData(data);
  }
  // >>>>>>>>>>

  return {};
}

/**
 * Helper function for messageEditV1/messageRemoveV1 to edit/remove messages in dms.
 *
 * Arguments:
 *      token:          string     The user's unique identifier
 *      userId:         number     The user's identifier
 *      messageId:      number     The message's unique identifier
 *      message:        string     The edited message
 *
 * Returns:
 *      { error: 'error' }     object     Error message when given invalid input
 *      { }                    object     Successful messageEdit
 */
function editInDm(mode: string, token: string, userId: number, messageId: number, message?: string) {
  const data: dataStoreType = getData();

  const dmGiven: dm = isMessageValidDm(messageId);
  const messageGiven: message = dmGiven.messages.find(message => message.messageId === messageId);

  // If user is not owner of channel: If user is not the person who wrote it then return error
  if (dmGiven.owner !== userId) {
    if (isMember(DM, token, dmGiven.dmId) === false) {
      throw HTTPError(BAD_REQ, 'Invalid user accessing valid message');
    } else if (messageGiven.uId !== userId) {
      throw HTTPError(FORBID, 'Invalid user accessing message');
    }
  }

  const messageGivenIndex: number = dmGiven.messages.findIndex(message => message.messageId === messageId);
  const dmGivenIndex: number = data.dms.findIndex(dm => dm.dmId === dmGiven.dmId);

  if (mode === EDIT) {
    data.dms[dmGivenIndex].messages[messageGivenIndex].message = message;
  } else if (mode === REMOVE) {
    const removedMessage: Array<message> = dmGiven.messages.filter(message => message.messageId !== messageId);
    data.dms[dmGivenIndex].messages = removedMessage;
  }

  setData(data);
  return {};
}

/**
 * Given a valid ogMessageId, an optional message is attached and sent to the
 * specified channel or dm, and returns the a messageId.
 *
 * Arguments:
 *      token:              string     The user's unique identifier
 *      ogMessageId:        number     The message's unique identifier
 *      message:            string     The message
 *      channelId:          number     The channel's unique identifier or -1
 *      dmId:               number     The dm's unique identifier or -1
 *
 * Returns:
 *      sharedMessageId:    number     The message's unique identifier
 */
export function messageShareV1(token: string, ogMessageId: number, message: string, channelId: number, dmId: number) {
  const data: dataStoreType = getData();

  // Token validation
  if (data.users.find(user => user.tokens.find(tok => tok === token)) === undefined) {
    throw HTTPError(FORBID, 'Invalid token');
  }

  const user: user = data.users.find(user => user.tokens.find(tok => tok === token));
  const userId = user.uId;

  // Checking valid id pairs given
  if (channelId > 0 && dmId !== -1) {
    throw HTTPError(BAD_REQ, 'Invalid id pair');
  } else if (dmId > 0 && channelId !== -1) {
    throw HTTPError(BAD_REQ, 'Invalid id pair');
  } else if (channelId === -1 && dmId === -1) {
    throw HTTPError(BAD_REQ, 'Invalid id pair');
  }

  // Checking validity of message length
  if (message.length > 1000) {
    throw HTTPError(BAD_REQ, 'Invalid message length');
  }

  // Checking if ogMessageId is valid, if user is part of the channel/dm and
  // if valid find message.
  let ogChannel: channel;
  let ogDm: dm;
  let ogMessage: message;
  const firstDigit = String(ogMessageId)[0];
  if (firstDigit === '1') {
    ogChannel = isMessageValidChannel(ogMessageId);

    if (isMember(CHANNEL, token, ogChannel.channelId) === false) {
      throw HTTPError(BAD_REQ, 'Invalid access to ogChannel');
    }

    ogMessage = ogChannel.messages.find(message => message.messageId === ogMessageId);
  } else if (firstDigit === '2') {
    ogDm = isMessageValidDm(ogMessageId);

    if (isMember(DM, token, ogDm.dmId) === false) {
      throw HTTPError(BAD_REQ, 'Invalid access to ogDm');
    }

    ogMessage = ogDm.messages.find(message => message.messageId === ogMessageId);
  }

  // Checking validity of channelId or dmId
  let sharedMessageId: number;
  if (dmId === -1) {
    const channelGivenIndex = data.channels.findIndex(channel => channel.channelId === channelId);
    if (channelGivenIndex === -1) {
      throw HTTPError(BAD_REQ, 'Invalid channelId');
    }

    if (isMember(CHANNEL, token, channelId) === false) {
      throw HTTPError(FORBID, 'Invalid access to channel');
    }

    sharedMessageId = sendMessage(CHANNEL, userId, message, channelGivenIndex, ogMessage.message);
  } else if (channelId === -1) {
    const dmGivenIndex = data.dms.findIndex(dm => dm.dmId === dmId);
    if (dmGivenIndex === -1) {
      throw HTTPError(BAD_REQ, 'Invalid dmId');
    }

    if (isMember(DM, token, dmId) === false) {
      throw HTTPError(FORBID, 'Invalid access to dm');
    }

    sharedMessageId = sendMessage(DM, userId, message, dmGivenIndex, ogMessage.message);
  }

  return { sharedMessageId: sharedMessageId };
}

/**
 * Given a valid messageId, the message is marked as pinned.
 *
 * Arguments:
 *      token:      string     The user's unique identifier
 *      messageId:  number     The message's unique identifier
 *
 * Returns:
 *      { }         object     Successful message pin
 */
export function messagePinV1(token: string, messageId: number) {
  return pinMessage(PIN, token, messageId);
}

/**
 * Given a valid messageId, the message is marked as pinned.
 *
 * Arguments:
 *      token:      string     The user's unique identifier
 *      messageId:  number     The message's unique identifier
 *
 * Returns:
 *      { }         object     Successful message unpin
 */
export function messageUnPinV1(token: string, messageId: number) {
  return pinMessage(UNPIN, token, messageId);
}

/**
 * Helper function for messagePin and messageUnPin. Given valid
 * token and messageId, pins or unpins message according to mode.
 *
 * Arguments:
 *      mode:       string     Either 'p' (pin) or 'u' (unpin)
 *      token:      string     The user's unique identifier
 *      messageId:  number     The message's unique identifier
 *
 * Returns:
 *      { }         object     Successful message unpin
 */
function pinMessage(mode: string, token: string, messageId: number) {
  const data: dataStoreType = getData();

  // Token validation
  if (data.users.find(user => user.tokens.find(tok => tok === token)) === undefined) {
    throw HTTPError(FORBID, 'Invalid token');
  }

  // Finding userId
  const user: user = data.users.find(user => user.tokens.find(tok => tok === token));
  const userId: number = user.uId;

  let channelGiven: channel;
  let dmGiven: dm;
  let messageGiven: message;
  const firstDigit = String(messageId)[0];
  if (firstDigit === '1') {
    // Checking if messageId is valid
    channelGiven = isMessageValidChannel(messageId);
    messageGiven = channelGiven.messages.find(message => message.messageId === messageId);

    // Checking if user is global owner
    if (user.isGlobalOwner !== 1) {
      // Checks if user is member of the channel
      if (isMember(CHANNEL, token, channelGiven.channelId) === false) {
        throw HTTPError(BAD_REQ, 'Invalid user accessing valid message');
        // Checks if user is not owner of channel (who can pin messages)
      } else if (channelGiven.ownerMembers.find(owner => owner === userId) === undefined) {
        throw HTTPError(FORBID, 'Invalid permissions to pin message');
      }
    }
  } else if (firstDigit === '2') {
    // Checking if messageId is valid
    dmGiven = isMessageValidDm(messageId);
    messageGiven = dmGiven.messages.find(message => message.messageId === messageId);

    // Checking if member/owner of the message's channel
    if (isMember(DM, token, dmGiven.dmId) === false) {
      throw HTTPError(BAD_REQ, 'Invalid access to message');
    } else if (dmGiven.owner !== userId) {
      throw HTTPError(FORBID, 'Invalid permissions to pin message');
    }
  }

  if (mode === PIN && messageGiven.isPinned === true) {
    throw HTTPError(BAD_REQ, 'Message already pinned');
  } else if (mode === UNPIN && messageGiven.isPinned === false) {
    throw HTTPError(BAD_REQ, 'Message already unpinned');
  }

  let messageGivenIndex: number;
  if (firstDigit === '1') {
    const channelGivenIndex = data.channels.findIndex(channel => channel.channelId === channelGiven.channelId);
    messageGivenIndex = channelGiven.messages.findIndex(message => message.messageId === messageId);

    data.channels[channelGivenIndex].messages[messageGivenIndex].isPinned = !messageGiven.isPinned;
  } else if (firstDigit === '2') {
    const dmGivenIndex = data.dms.findIndex(dm => dm.dmId === dmGiven.dmId);
    messageGivenIndex = dmGiven.messages.findIndex(message => message.messageId === messageId);

    data.dms[dmGivenIndex].messages[messageGivenIndex].isPinned = !messageGiven.isPinned;
  }

  setData(data);
  return {};
}

/**
 * Given a valid channelId, message and timeSent, the message is sent at the time specified.
 *
 * Arguments:
 *      token:      string     The user's unique identifier
 *      channelId:  number     The channel's unique identifier
 *      message:    string     The message to be sent
 *      timeSent:   number     The time to send message
 *
 * Returns:
 *      { messageId: <number> } object     Successful message send
 */
export function messageSendLaterV1(token: string, channelId: number, message: string, timeSent: number) {
  const timeRemain: number = Math.ceil(timeSent - Math.floor(Date.now() / 1000)) * 1000;
  if (timeRemain < 0) {
    throw HTTPError(BAD_REQ, 'Invalid time');
  }

  sleep(CHANNEL, timeRemain);
  return messageSendV2(token, channelId, message);
}

/**
 * Given a valid dmId, message and timeSent, the message is sent at the time specified.
 *
 * Arguments:
 *      token:      string     The user's unique identifier
 *      dmId:       number     The dm's unique identifier
 *      message:    string     The message to be sent
 *      timeSent:   number     The time to send message
 *
 * Returns:
 *      { messageId: <number> } object     Successful message send
 */
export function messageSendLaterDmV1(token: string, dmId: number, message: string, timeSent: number) {
  const timeRemain: number = Math.ceil(timeSent - Math.floor(Date.now() / 1000)) * 1000;
  if (timeRemain < 0) {
    throw HTTPError(BAD_REQ, 'Invalid time');
  }

  const data: dataStoreType = getData();
  if (data.dms.find(dm => dm.dmId === dmId) === undefined) {
    throw HTTPError(BAD_REQ, 'Invalid dmId');
  }

  const messageId: number | undefined = sleep(DM, timeRemain, dmId);
  if (messageId !== undefined) {
    return { messageId: messageId };
  }

  return messageSendDmV2(token, dmId, message);
}

/**
 * Helper function for messageSendLaterV1 and messageSendLaterDmV1. Given a time period
 * in seconds, pauses execution of above functions for the time period.
 *
 * Arguments:
 *      timeRemain:   number     The time period in seconds
 */
function sleep(mode: string, timeRemain: number, id?: number) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, timeRemain);

  if (mode === DM) {
    const data: dataStoreType = getData();
    if (data.dms.find(dm => dm.dmId === id) === undefined) {
      return generateId(mode);
    }
  }
}

/**
* Given a valid messageId and reactId,adds a "react" to that particular message
*
* Arguments:

{ token, messageId, reactId }
*      token:      string     The user's unique identifier
*      messageId:  string     The message the user wants to react to
*      reactId:    string     The ID of the reaction
*
* Returns:
*      { }                    object     Successful react
*/
export function messageReactV1(token: string, messageId: number, reactId: number) {
  return reactUnreactMessage('r', token, messageId, reactId);
}

/**
* Given a valid messageId and reactId,removes a "react" to that particular message
*
* Arguments:

{ token, messageId, reactId }
*      token:      string     The user's unique identifier
*      messageId:  string     The message the user wants to unreact to
*      reactId:    string     The ID of the reaction
*
* Returns:
*      { }                    object     Successful unreact
*/
export function messageUnReactV1(token: string, messageId: number, reactId: number) {
  return reactUnreactMessage('u', token, messageId, reactId);
}

// this is a helper function for the react (r) and unreact (u) functions
// since they are very similar, to simplify the code.

function reactUnreactMessage(mode: string, token: string, messageId: number, reactId: number) {
  const data: dataStoreType = getData();

  // Token validation
  if (data.users.find(user => user.tokens.find(tok => tok === token)) === undefined) {
    throw HTTPError(FORBID, 'Invalid token');
  }

  // does reactId validation. only need to make sure it is 1 since no other possible case.
  if (reactId !== 1) {
    throw HTTPError(BAD_REQ, 'Invalid reactId');
  }

  // Finding userId
  const user: user = data.users.find(user => user.tokens.find(tok => tok === token));
  const userId: number = user.uId;

  // Finding the channels and dms the user is a member of
  const channelsMemberOf: Array<channelOutput> = channelsListV2(token).channels;
  const dmsMemberOf: Array<dmOutput> = dmListV2(token).dms;

  let channelGiven: channel;
  let dmGiven: dm;
  let messageGiven: message;
  const firstDigit = String(messageId)[0];

  // case if channel given
  if (firstDigit === '1') {
    // Checking if messageId is valid
    channelGiven = isMessageValidChannel(messageId);

    // not sure if parts of this code block are required...
    // Checking if user is global owner, otherwise check if member/owner of the message's channel
    if (channelsMemberOf.find(channel => channel.channelId === channelGiven.channelId) === undefined) {
      throw HTTPError(BAD_REQ, 'Invalid access to message, user is not in given channel.');
    }

    messageGiven = channelGiven.messages.find(message => message.messageId === messageId);
  } else if (firstDigit === '2') {
    // case if dm given
    // Checking if messageId is valid
    dmGiven = isMessageValidDm(messageId);

    // Checking if member/owner of the message's dm. doesn't have to be owner though. commented out.
    if (dmsMemberOf.find(dm => dm.dmId === dmGiven.dmId) === undefined) {
      throw HTTPError(BAD_REQ, 'Invalid access to message');
    }

    messageGiven = dmGiven.messages.find(message => message.messageId === messageId);
  } else {
    throw HTTPError(BAD_REQ, 'invalid messageId!');
  }

  // checks if message has already been reacted/unreacted with
  if (messageGiven.reacts.length !== 0) {
    if (mode === 'r') {
      const thumbsUpReact = messageGiven.reacts.find(({ reactId }) => reactId === 1);
      if (thumbsUpReact.uIds.find(uId => uId === userId) !== undefined) {
        throw HTTPError(BAD_REQ, 'Message already reacted');
      }
    }
  }

  // finds index of message in channel or dm.
  let messageGivenIndex: number;
  // case if channel given
  if (firstDigit === '1') {
    const channelGivenIndex = data.channels.findIndex(channel => channel.channelId === channelGiven.channelId);
    messageGivenIndex = channelGiven.messages.findIndex(message => message.messageId === messageId);

    // case when nobody has reacted to message so far. creates first react object.
    if (mode === 'r' && messageGiven.reacts.length === 0) {
      const uIds: number[] = [userId];
      const newReact = {
        reactId: reactId,
        uIds: uIds,
        isThisUserReacted: true,
      };
      data.channels[channelGivenIndex].messages[messageGivenIndex].reacts.push(newReact);
      setData(data);
      return {};
    }

    if (mode === 'u' && messageGiven.reacts.length === 0) {
      return {};
    } else if (mode === 'u' && messageGiven.reacts.length === 1) {
      if (data.channels[channelGivenIndex].messages[messageGivenIndex].reacts[0].uIds.length === 1) {
        data.channels[channelGivenIndex].messages[messageGivenIndex].reacts = [];
        setData(data);
        return {};
      }
      // don't need to account for >1 reacts.
      /* data.channels[channelGivenIndex].messages[messageGivenIndex].reacts[0].uIds.filter(uId => uId = userId);
      data.channels[channelGivenIndex].messages[messageGivenIndex].reacts[0].isThisUserReacted = false;
      setData(data);
      return {}; */
    }
    // removed since reimplemented above.
    /* data.channels[channelGivenIndex].messages[messageGivenIndex].reacts[0].reactId = reactId;
    data.channels[channelGivenIndex].messages[messageGivenIndex].reacts[0].uIds.push(userId);
    data.channels[channelGivenIndex].messages[messageGivenIndex].reacts[0].isThisUserReacted = !data.channels[channelGivenIndex].messages[messageGivenIndex].reacts[0].isThisUserReacted; */
  } else if (firstDigit === '2') {
    // case if dm given
    const dmGivenIndex = data.dms.findIndex(dm => dm.dmId === dmGiven.dmId);
    messageGivenIndex = dmGiven.messages.findIndex(message => message.messageId === messageId);

    // case when nobody has reacted to message so far. creates first react object.
    if (mode === 'r' && messageGiven.reacts.length === 0) {
      const uIds: number[] = [userId];
      const newReact = {
        reactId: reactId,
        uIds: uIds,
        isThisUserReacted: true,
      };
      data.dms[dmGivenIndex].messages[messageGivenIndex].reacts.push(newReact);
      setData(data);
      return {};
    }

    if (mode === 'u' && messageGiven.reacts.length === 0) {
      return {};
    } else if (mode === 'u' && messageGiven.reacts.length === 1) {
      if (data.dms[dmGivenIndex].messages[messageGivenIndex].reacts[0].uIds.length === 1) {
        data.dms[dmGivenIndex].messages[messageGivenIndex].reacts = [];
        setData(data);
        return {};
      }
      // don't need to account for >1 reacts.
      /* data.dms[dmGivenIndex].messages[messageGivenIndex].reacts[0].uIds.filter(uId => uId = userId);
      data.dms[dmGivenIndex].messages[messageGivenIndex].reacts[0].isThisUserReacted = false;
      setData(data);
      return {}; */
    }

    // removed since reimplemented above.
    /* data.dms[dmGivenIndex].messages[messageGivenIndex].reacts[0].reactId = reactId;
    data.dms[dmGivenIndex].messages[messageGivenIndex].reacts[0].uIds.push(userId);
    data.dms[dmGivenIndex].messages[messageGivenIndex].reacts[0].isThisUserReacted = !data.dms[dmGivenIndex].messages[messageGivenIndex].reacts[0].isThisUserReacted; */
  }
}

/// /////////////////////////////////////////////////////////////////////////////
/// /////////////////////////////////////////////////////////////////////////////
/// /////////////////////        Helper Functions       /////////////////////////
/// /////////////////////////////////////////////////////////////////////////////
/// /////////////////////////////////////////////////////////////////////////////

/**
 * Helper function to check if the user is a member of the channel or dm.
 *
 * Arguments:
 *      mode:               string     Either 'c' (channel) or 'd' (dm)
 *      token:              number     The user's unique session identifer
 *      id:                 number     The channel/dm's unique identifier
 *
 * Returns:
 *      true/false:         boolean
 */
function isMember(mode: string, token: string, id: number) {
  if (mode === CHANNEL) {
    const channelsMemberOf: Array<channelOutput> = channelsListV2(token).channels;

    if (channelsMemberOf.find(channel => channel.channelId === id) === undefined) {
      return false;
    }
  } else if (mode === DM) {
    const dmsMemberOf: Array<dmOutput> = dmListV2(token).dms;

    if (dmsMemberOf.find(dm => dm.dmId === id) === undefined) {
      return false;
    }
  }

  return true;
}

/**
 * Helper function for messageSend, messageSendDm and messageShare
 * Creates a new message, sends it to desired channel/dm and returns id.
 *
 * Arguments:
 *      message:            string     The message
 *      index:              number     The channel/dm's index in the dataStore
 *      membersOf:          object[]   An array of channels/dms user is member of
 *
 * Returns:
 *      sharedMessageId:    number     The message's unique identifier
 */
function sendMessage(mode: string, userId: number, message: string, index: number, ogMessage?: string) {
  const data: dataStoreType = getData();

  if (ogMessage !== undefined) {
    // Concat new message
    if (message.length > 0) {
      message = ogMessage.concat(' ', message);
    } else {
      message = ogMessage;
    }
  }

  const newMessageId: number = generateId(mode);

  const newMessage: message = {
    messageId: newMessageId,
    uId: userId,
    timeSent: Math.floor(Date.now() / 1000),
    message: message,
    isPinned: false,
    reacts: [],
  };

  if (mode === CHANNEL) {
    data.channels[index].messages.unshift(newMessage);
  } else if (mode === DM) {
    data.dms[index].messages.unshift(newMessage);
  }

  // Notifcation >>>>>>>>
  if (mode === 'e') {
    const uIds = getTags(message);
    const userHandle = data.users.find(user => user.tokens.find(tok => tok === token)).handleStr;
    sendNotificationsTag(data, uIds, dmGiven.dmId, userHandle, message);
  }
  // >>>>>>>>>>

  setData(data);

  // Analytics
  const time = Date.now();
  if (mode === 'r') {
    // Workspace stats
    const numMessagesExist = data.workspaceStats.messagesExist[data.workspaceStats.messagesExist.length - 1].numMessagesExist - 1;
    data.workspaceStats.messagesExist.push({ numMessagesExist: numMessagesExist, timeStamp: time });

    setData(data);
  }

  return newMessageId;
}

/**
 * Helper function to check if messageId is valid and returns the channel
 * the message is in if valid
 *
 * Arguments:
 *      messageId:      number     The message's unique identifier
 *
 * Returns:
 *      channelGiven:   object     The message's corresponding channel
 */
function isMessageValidChannel(messageId: number) {
  const data: dataStoreType = getData();

  let channelGiven: channel;
  const isValid: boolean = data.channels.every((channel) => {
    // If messageId exists in channel returns false, else returns true
    if (channel.messages.find(message => message.messageId === messageId) !== undefined) {
      channelGiven = channel;
      return false;
    }

    return true;
  });

  if (isValid === true) {
    throw HTTPError(BAD_REQ, 'Invalid messageId');
  }

  return channelGiven;
}

/**
 * Helper function to check if messageId is valid and returns the DM
 * the message is in if valid
 *
 * Arguments:
 *      messageId:      number     The message's unique identifier
 *
 * Returns:
 *      dmGiven:        object     The message's corresponding DM
 */
function isMessageValidDm(messageId: number) {
  const data: dataStoreType = getData();

  let dmGiven: dm;
  const isValid: boolean = data.dms.every((dm) => {
    // If messageId exists in dm returns false, else returns true
    if (dm.messages.find(message => message.messageId === messageId) !== undefined) {
      dmGiven = dm;
      return false;
    }

    return true;
  });

  if (isValid === true) {
    throw HTTPError(BAD_REQ, 'Invalid messageId');
  }

  return dmGiven;
}

/*
function DummyMessageShare() {

  // Notification >>>>>>>>
  const uIds = getTags(message);
  const userHandle = data.users.find(user => user.tokens.find(tok => tok === token).handleStr);
  sendNotificationsTag(data, uIds, forwardedChannel/dm.id, userHandle, message);
  //>>>>>>>>>>

}
*/

/*
function DummyMessageReact() {

  // Notification >>>>>>>>
  const uId = messageOwner.uId; // uId of user to whom the message belongs
  const reactorHandle = data.users.find(user => user.tokens.find(tok => tok === token)).handleStr;
  sendNotificationReact(uId, reactedChannel/dm.id, reactorHandle);
  //>>>>>>>>>>

}
*/
