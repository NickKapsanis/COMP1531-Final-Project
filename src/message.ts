import { getData, setData, dataStoreType, user, channel, message, dm } from './dataStore';
import { channelsListV2 } from './channels';
import { dmListV1 } from './dm';
import HTTPError from 'http-errors';

type channelOutput = {
  channelId: number;
  name: string;
}

type dmOutput = {
  dmId: number;
  name: string;
}

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
 *      { error: 'error' }      object     Error message (given invalid input)
 *      { messageId: <number> } object     Successful message send
 */
export function messageSendV1(token: string, channelId: number, message: string) {
  const data: dataStoreType = getData();

  // Token validation
  if (data.users.find(user => user.tokens.find(tok => tok === token)) === undefined) {
    return { error: 'error' };
  }

  const userId: number = data.users.find(user => user.tokens.find(tok => tok === token)).uId;
  const channelsMemberOf: Array<channelOutput> = channelsListV2(token).channels;

  // Checking if valid channelIds were given
  // Validating if authorised user is a member of the channel
  if (data.channels.find(channel => channel.channelId === channelId) === undefined) {
    return { error: 'error' };
  } else if (channelsMemberOf.find(channel => channel.channelId === channelId) === undefined) {
    return { error: 'error' };
  }

  const channelGivenIndex: number = data.channels.findIndex(channel => channel.channelId === channelId);

  // Message validation
  if (message.length < 1 || message.length > 1000) {
    return { error: 'error' };
  }

  // const newMessageId: number = generateId('c');

  // const newMessage: message = {
  //   messageId: newMessageId,
  //   uId: userId,
  //   timeSent: Math.floor(Date.now() / 1000),
  //   message: message,
  // };

  // data.channels[channelGivenIndex].messages.unshift(newMessage);
  // setData(data);

  const newMessageId = sendMessage('c', userId, message, channelGivenIndex);

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
export function messageSendDmV1(token: string, dmId: number, message: string) {
  const data: dataStoreType = getData();

  // Token validation
  if (data.users.find(user => user.tokens.find(tok => tok === token)) === undefined) {
    return { error: 'error' };
  }

  const userId: number = data.users.find(user => user.tokens.find(tok => tok === token)).uId;
  const dmsMemberOf: Array<dmOutput> = dmListV1(token).dms;

  // Checking if valid dmId was given
  // Validating if authorised user is a member of the DM
  if (data.dms.find(dm => dm.dmId === dmId) === undefined) {
    return { error: 'error' };
  } else if (dmsMemberOf.find(dm => dm.dmId === dmId) === undefined) {
    return { error: 'error' };
  }

  const dmGivenIndex: number = data.dms.findIndex(dm => dm.dmId === dmId);

  // Message validation
  if (message.length < 1 || message.length > 1000) {
    return { error: 'error' };
  }

  // const newMessageId: number = generateId('d');

  // const newMessage: message = {
  //   messageId: newMessageId,
  //   uId: userId,
  //   timeSent: Math.floor(Date.now() / 1000),
  //   message: message,
  // };

  // data.dms[dmGivenIndex].messages.unshift(newMessage);
  // setData(data);

  const newMessageId = sendMessage('d', userId, message, dmGivenIndex);

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
  if (mode === 'c') {
    newId = '1' + String(Date.now()) + String(Math.floor(Math.random() * 100));
  } else if (mode === 'd') {
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
*      { error: 'error' }     object     Error message when given invalid input
*      { }                    object     Successful messageEdit
*/
export function messageEditV1(token: string, messageId: number, message: string) {
  const data: dataStoreType = getData();
  const mode = 'e';

  // Token validation
  if (data.users.find(user => user.tokens.find(tok => tok === token)) === undefined) {
    return { error: 'error' };
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
    return { error: 'error' };
  } else if (message.length === 0) {
    return messageRemoveV1(token, messageId);
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
export function messageRemoveV1(token: string, messageId: number) {
  const data: dataStoreType = getData();
  const mode = 'r';

  // Token validation
  if (data.users.find(user => user.tokens.find(tok => tok === token)) === undefined) {
    return { error: 'error' };
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

  let channelGiven: channel;
  const isMessageValid: boolean = data.channels.every((channel) => {
    // If messageId exists in channel returns false, else returns true
    if (channel.messages.find(message => message.messageId === messageId) !== undefined) {
      channelGiven = channel;
      return false;
    }

    return true;
  });

  if (isMessageValid === true) {
    return { error: 'error' };
  }

  let isMember: boolean;
  const channelsMemberOf: Array<channelOutput> = channelsListV2(token).channels;
  if (channelsMemberOf.find(channel => channel.channelId === channelGiven.channelId) === undefined) {
    isMember = false;
  } else {
    isMember = true;
  }

  const messageGiven: message = channelGiven.messages.find(message => message.messageId === messageId);

  // Checks if user is global owner (who can edit messages), otherwise check further:
  if (isGlobalUser === false) {
    // Checks if user is not owner of channel (who can edit messages), otherwise check further:
    if (channelGiven.ownerMembers.find(owner => owner === userId) === undefined) {
      // Checks if the user is the one wrote message
      if (messageGiven.uId !== userId) {
        return { error: 'error' };
        // Checks if user wrote it and is still part of the channel (i.e. did not leave channel)
      } else if (messageGiven.uId === userId && isMember === false) {
        return { error: 'error' };
      }
    }
  }

  const messageGivenIndex: number = channelGiven.messages.findIndex(message => message.messageId === messageId);
  const channelGivenIndex: number = data.channels.findIndex(channel => channel.channelId === channelGiven.channelId);

  if (mode === 'e') {
    data.channels[channelGivenIndex].messages[messageGivenIndex].message = message;
  } else if (mode === 'r') {
    const removedMessage: Array<message> = channelGiven.messages.filter(message => message.messageId !== messageId);
    data.channels[channelGivenIndex].messages = removedMessage;
  }

  setData(data);
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

  let dmGiven: dm;
  const isMessageValid: boolean = data.dms.every((dm) => {
    // If messageId exists in channel returns false, else returns true
    if (dm.messages.find(message => message.messageId === messageId) !== undefined) {
      dmGiven = dm;
      return false;
    }

    return true;
  });

  if (isMessageValid === true) {
    return { error: 'error' };
  }

  let isMember: boolean;
  const dmsMemberOf: Array<dmOutput> = dmListV1(token).dms;
  if (dmsMemberOf.find(dm => dm.dmId === dmGiven.dmId) === undefined) {
    isMember = false;
  } else {
    isMember = true;
  }

  const messageGiven: message = dmGiven.messages.find(message => message.messageId === messageId);

  // If user is not owner of channel: If user is not the person who wrote it then return error
  if (dmGiven.owner !== userId) {
    if (messageGiven.uId !== userId) {
      return { error: 'error' };
    } else if (messageGiven.uId === userId && isMember === false) {
      return { error: 'error' };
    }
  }

  const messageGivenIndex: number = dmGiven.messages.findIndex(message => message.messageId === messageId);
  const dmGivenIndex: number = data.dms.findIndex(dm => dm.dmId === dmGiven.dmId);

  if (mode === 'e') {
    data.dms[dmGivenIndex].messages[messageGivenIndex].message = message;
  } else if (mode === 'r') {
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
  }

  // Checking validity of message length
  if (message.length > 1000) {
    throw HTTPError(BAD_REQ, 'Invalid message length');
  }

  const channelsMemberOf: Array<channelOutput> = channelsListV2(token).channels;
  const dmsMemberOf: Array<dmOutput> = dmListV1(token).dms;

  // Checking if ogMessageId is valid and if user is part of the channel/dm
  let ogChannel: channel;
  let ogDm: dm;
  let ogMessage: message;
  const firstDigit = String(ogMessageId)[0];
  if (firstDigit === '1') {
    ogChannel = isMessageValidChannel(ogMessageId);

    if (channelsMemberOf.find(channel => channel.channelId === ogChannel.channelId) === undefined) {
      throw HTTPError(BAD_REQ, 'Invalid access to ogChannel');
    }

    ogMessage = ogChannel.messages.find(message => message.messageId === ogMessageId);
  } else if (firstDigit === '2') {
    ogDm = isMessageValidDm(ogMessageId);

    if (dmsMemberOf.find(dm => dm.dmId === ogDm.dmId) === undefined) {
      throw HTTPError(BAD_REQ, 'Invalid access to ogDm');
    }

    ogMessage = ogDm.messages.find(message => message.messageId === ogMessageId);
  }

  // Checking validity of channelId or dmId
  let sharedMessageId;
  if (dmId === -1) {
    const channelGivenIndex = data.channels.findIndex(channel => channel.channelId === channelId);
    if (channelGivenIndex === -1) {
      throw HTTPError(BAD_REQ, 'Invalid channelId');
    }

    if (channelsMemberOf.find(channel => channel.channelId === channelId) === undefined) {
      throw HTTPError(FORBID, 'Invalid access to channel');
    }

    sharedMessageId = sendMessage('c', userId, message, channelGivenIndex, ogMessage.message);
    return { sharedMessageId: sharedMessageId };
  } else if (channelId === -1) {
    const dmGivenIndex = data.dms.findIndex(dm => dm.dmId === dmId);
    if (dmGivenIndex === -1) {
      throw HTTPError(BAD_REQ, 'Invalid dmId');
    }

    if (dmsMemberOf.find(dm => dm.dmId === dmId) === undefined) {
      throw HTTPError(FORBID, 'Invalid access to dm');
    }

    sharedMessageId = sendMessage('d', userId, message, dmGivenIndex, ogMessage.message);
    return { sharedMessageId: sharedMessageId };
  }
}

/// Helper Functions ///

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

  let newMessageId: number;
  if (mode === 'c') {
    newMessageId = generateId(mode);
  } else if (mode === 'd') {
    newMessageId = generateId(mode);
  }

  const newMessage: message = {
    messageId: newMessageId,
    uId: userId,
    timeSent: Math.floor(Date.now() / 1000),
    message: message,
  };

  if (mode === 'c') {
    data.channels[index].messages.unshift(newMessage);
  } else if (mode === 'd') {
    data.dms[index].messages.unshift(newMessage);
  }

  setData(data);

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
