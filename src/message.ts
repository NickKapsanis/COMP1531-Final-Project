import { getData, setData, dataStoreType, user, channel, message, dm } from './dataStore';
import { channelsListV2 } from './channels';
import { dmListV1 } from './dm';

type channelOutput = {
  channelId: number;
  name: string;
}

type dmOutput = {
  dmId: number;
  name: string;
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
  } else {
    return { error: 'error' };
  }
}

/**
 * Helper function for messageEditV1 to edit messages in channels.
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
  const isMessageValid = data.channels.every((channel) => {
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

  // If user is not global owner: If user is not owner of channel: If user is not the person who wrote it then return error
  if (isGlobalUser === false) {
    if (channelGiven.ownerMembers.find(owner => owner === userId) === undefined) {
      if (messageGiven.uId !== userId) {
        return { error: 'error' };
      } else if (messageGiven.uId === userId && isMember === false) {
        return { error: 'error' };
      }
    }
  }

  const messageGivenIndex: number = channelGiven.messages.findIndex(message => message.messageId === messageId);
  const channelGivenIndex: number = data.channels.findIndex(channel => channel.channelId === channelGiven.channelId);

  if (mode === 'e') {
    data.channels[channelGivenIndex].messages[messageGivenIndex].message = message;
  }

  setData(data);
  return {};
}

/**
 * Helper function for messageEditV1 to edit messages in dms.
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

  // If user is not global owner: If user is not owner of channel: If user is not the person who wrote it then return error
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
  }

  setData(data);
  return {};
}
