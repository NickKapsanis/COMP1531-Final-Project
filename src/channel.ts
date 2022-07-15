import { getData, setData, dataStoreType, channel, message } from './dataStore';
import { userProfileV2 } from './users';
import { channelsListV2 } from './channels';

type userOutput = {
  uId: number;
  email: string;
  nameFirst: string;
  nameLast: string;
  handleStr: string;
}

type channelOutput = {
  channelId: number;
  name: string;
}

type messagesOutput = {
  messages: Array<message>;
  start: number;
  end: number;
}

/**
 * Returns the basic details about the channel (such as its name, public status,
 * owners and members) given a channelId and authUserId.
 *
 * Arguments:
 *      authUserId: integer     The user's unique identifier
 *      channelId:  integer     The channel's unique identifier
 *
 * Returns:
 *      { error: 'error' }     object     Error message when given invalid input
 *      {
 *        name, isPublic,      object     Object containing specified keys that
 *        ownerMembers,                   give detail about the channel
 *        allMembers
 *      }
 */
function channelDetailsV2(token: string, channelId: number) {
  const data: dataStoreType = getData();

  // Token validation
  if (data.users.find(user => user.tokens.find(tok => tok === token)) === undefined) {
    return { error: 'error' };
  }

  const channelsMemberOf: Array<channelOutput> = channelsListV2(token).channels;

  // Checking if valid channelIds were given
  if (data.channels.find(channel => channel.channelId === channelId) === undefined) {
    return { error: 'error' };
  } else if (channelsMemberOf.find(channel => channel.channelId === channelId) === undefined) {
    return { error: 'error' };
  }

  // Finding the given channel
  const channelDetails: channel = data.channels.find(channel => channel.channelId === channelId);

  // Iterating through owners (which contains uIds) and finding their details
  // using userProfileV1
  const owners = channelDetails.ownerMembers;
  const ownerMembersDetails: Array<userOutput> = [];

  owners.forEach(uId => {
    const user = userProfileV2(token, uId).user;
    ownerMembersDetails.push(user);
  });

  // Iterating through members (which contains uIds) and finding their details
  // using userProfileV1
  const members = channelDetails.allMembers;
  const allMembersDetails: Array<userOutput> = [];

  members.forEach(uId => {
    const user = userProfileV2(token, uId).user;
    allMembersDetails.push(user);
  });

  return {
    name: channelDetails.name,
    isPublic: channelDetails.isPublic,
    ownerMembers: ownerMembersDetails,
    allMembers: allMembersDetails,
  };
}

/**
 * Returns up to 50 of user's most recent messages in given channel
 * and a specified range.
 *
 * Arguments:
 *      authUserId: integer     The user's unique identifier
 *      channelId:  integer     The channel's unique identifier
 *      start:      integer     The left-bound of range
 *
 * Returns:
 *      {error: 'error'}     object     Error message when given invalid input
 *      messageDetails       object     Object containing {messages, start, end},
 *                                      where messages is an array of objects,
 *                                      start and end are integers.
 */
function channelMessagesV2(token: string, channelId: number, start: number) {
  const data: dataStoreType = getData();

  // Token validation
  if (data.users.find(user => user.tokens.find(tok => tok === token)) === undefined) {
    return { error: 'error' };
  }

  const channelsMemberOf: Array<channelOutput> = channelsListV2(token).channels;

  // Checking validity of 'channelId' input
  if (data.channels.find(channel => channel.channelId === channelId) === undefined) {
    return { error: 'error' };
  } else if (channelsMemberOf.find(channel => channel.channelId === channelId) === undefined) {
    return { error: 'error' };
  }

  const channelGiven: channel = data.channels.find(channel => channel.channelId === channelId);

  // Checking validity of 'start' input
  let end: number;
  if (start > channelGiven.messages.length) {
    return { error: 'error' };
  } else if (start + 50 > channelGiven.messages.length) {
    end = -1;
  } else {
    end = start + 50;
  }

  // Creating object to contain messages and the specified range
  const messageDetails: messagesOutput = {
    messages: channelGiven.messages.slice(start, start + 50),
    start: start,
    end: end,
  };

  return messageDetails;
}

export { channelDetailsV2, channelMessagesV2 };
