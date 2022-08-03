import { getData, setData, dataStoreType, user, channel, message, dm } from './dataStore';
import { channelsListV2 } from './channels';
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

const FORBID = 403;
const BAD_REQ = 400;




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

  const newMessageId: number = generateId('c');

  const newMessage: message = {
    messageId: newMessageId,
    uId: userId,
    timeSent: Math.floor(Date.now() / 1000),
    message: message,
    reacts: [],
  };

  data.channels[channelGivenIndex].messages.unshift(newMessage);
  setData(data);

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
  const dmsMemberOf: Array<dmOutput> = dmListV2(token).dms;

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

  const newMessageId: number = generateId('d');

  const newMessage: message = {
    messageId: newMessageId,
    uId: userId,
    timeSent: Math.floor(Date.now() / 1000),
    message: message,
    reacts: [],
  };

  data.dms[dmGivenIndex].messages.unshift(newMessage);
  setData(data);

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
  const dmsMemberOf: Array<dmOutput> = dmListV2(token).dms;
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




//this is a helper function for the react (r) and unreact (u) functions 
//since they are very similar, to simplify the code.

function reactUnreactMessage(mode: string, token: string, messageId: number, reactId: number) {

  const data: dataStoreType = getData();

  // Token validation
  if (data.users.find(user => user.tokens.find(tok => tok === token)) === undefined) {
    throw HTTPError(FORBID, 'Invalid token');
  }

  //does reactId validation. only need to make sure it is 1 since no other possible case.
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

  //case if channel given
  if (firstDigit === '1') {
    // Checking if messageId is valid
    channelGiven = isMessageValidChannel(messageId);

    //not sure if parts of this code block are required...
    // Checking if user is global owner, otherwise check if member/owner of the message's channel
    if (user.isGlobalOwner === 2) {
      if (channelsMemberOf.find(channel => channel.channelId === channelGiven.channelId) === undefined) {
        throw HTTPError(BAD_REQ, 'Invalid access to message');
      } else if (channelGiven.ownerMembers.find(user => user === userId) === undefined) {
        throw HTTPError(BAD_REQ, 'Invalid access to reacting message');
      } else if (channelGiven.allMembers.find(user => user === userId) === undefined) {
        throw HTTPError(BAD_REQ, 'invalid userId!');
      }
    }


    messageGiven = channelGiven.messages.find(message => message.messageId === messageId);
  } else if (firstDigit === '2') {
    //case if dm given
    // Checking if messageId is valid
    dmGiven = isMessageValidDm(messageId);

    // Checking if member/owner of the message's channel. doesn't have to be owner though. commented out.
    if (dmsMemberOf.find(dm => dm.dmId === dmGiven.dmId) === undefined) {
      throw HTTPError(BAD_REQ, 'Invalid access to message');
    } /*else if (dmGiven.owner !== userId) {
      throw HTTPError(FORBID, 'Invalid access to reacting message');
    }*/

    messageGiven = dmGiven.messages.find(message => message.messageId === messageId);
  }

                                                                                          console.log(channelGiven);
                                                                                          console.log(messageGiven);
  //case when nobody has reacted to message so far. creates first react object.
  if (mode === 'r' && messageGiven.reacts.length === 0) {
    let uIds: number[] = [userId];

    const newReact = {
      reactId: reactId,
      uIds: uIds,
      isThisUserReacted: true,
    };
    messageGiven.reacts.push(newReact);
  }

  //checks if message has already been reacted/unreacted with
  if (mode === 'r') {
    let thumbsUpReact = messageGiven.reacts.find(({reactId}) => reactId === 1);
    if (thumbsUpReact.uIds.find(uId => uId === userId) !== undefined) {
      throw HTTPError(BAD_REQ, 'Message already reacted');
    }
  } else if (mode === 'u') {
    let thumbsUpReact = messageGiven.reacts.find(({reactId}) => reactId === 1);
    if (thumbsUpReact.uIds.find(uId => uId === userId) !== undefined) {
      throw HTTPError(BAD_REQ, 'Message already unreacted');
    }
  }

  //finds index of message in channel or dm.
  let messageGivenIndex: number;
  //case if channel given
  if (firstDigit === '1') {
    const channelGivenIndex = data.channels.findIndex(channel => channel.channelId === channelGiven.channelId);
    messageGivenIndex = channelGiven.messages.findIndex(message => message.messageId === messageId);

      //TODO: change isMessageReacted from =reactId to =!messageGiven.isThisMessageReacted, check IVAN implementation/////////////!!!!!! wb case when nobody reacted yet?

    let thumbsUpReact = data.channels[channelGivenIndex].messages[messageGivenIndex].reacts[0];     //find(reactId => reactId === 1);
    
    thumbsUpReact.reactId = reactId;
    thumbsUpReact.uIds.push(userId);
    thumbsUpReact.isThisUserReacted = true;
  } else if (firstDigit === '2') {
    //case if dm given
    const dmGivenIndex = data.dms.findIndex(dm => dm.dmId === dmGiven.dmId);
    messageGivenIndex = dmGiven.messages.findIndex(message => message.messageId === messageId);

    //TODO: change isMessageReacted from =reactId to =!messageGiven.isThisMessageReacted, check IVAN implementation/////////////!!!!!!

    let thumbsUpReact = data.dms[dmGivenIndex].messages[messageGivenIndex].reacts[0];     //find(reactId => reactId === 1);
    thumbsUpReact.reactId = reactId;
    thumbsUpReact.uIds.push(userId);
    thumbsUpReact.isThisUserReacted = true;
  }

  setData(data);
  return {};
  
}











