import { getData, setData, dataStoreType, channel, message, user } from './dataStore';
import { userProfileV2 } from './users';
import { channelsListV2 } from './channels';
import { getUId } from './other';
import { checkValidToken } from './auth';
import HTTPError from 'http-errors';

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

const FORBID = 403;
const BAD_REQ = 400;

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
function channelDetailsV3(token: string, channelId: number) {
  const data: dataStoreType = getData();

  // Token validation
  if (data.users.find(user => user.tokens.find(tok => tok === token)) === undefined) {
    throw HTTPError(FORBID, 'Invalid token');
  }

  const channelsMemberOf: Array<channelOutput> = channelsListV2(token).channels;

  // Checking if valid channelIds were given
  if (data.channels.find(channel => channel.channelId === channelId) === undefined) {
    throw HTTPError(BAD_REQ, 'Invalid channelId');
  } else if (channelsMemberOf.find(channel => channel.channelId === channelId) === undefined) {
    throw HTTPError(FORBID, 'Not a member of channel');
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

// helper function to reduce reptition
function getChannel(channelId: number, channelsArray: channel[]) {
  let channel: channel;
  for (let i = 0; i < channelsArray.length; i++) {
    if (channelId === channelsArray[i].channelId) {
      channel = channelsArray[i];
    }
  }
  return channel;
}

/**
* channelJoinV2
* this function allows a user to join public channels
* (or private channels if they are a global owner)
*
* Arguments:
*   token: string - the users unique session identifier
*   channelId - the channel to be joined
*
* Return Value:
*   {error: 'error'}     object         Error message when given invalid input
*   {}                   empty object   Successful run
*/
function channelJoinV2(token: string, channelId: number) {
  const data: dataStoreType = getData();
  const authUserId: number = data.users.find(user => user.tokens.find(tok => tok === token)).authUserId;
  const userIndex = data.users.findIndex(user => user.authUserId === authUserId);
  const channel: channel = getChannel(channelId, data.channels);

  // error when we can't find a valid user or channel
  if (channel === undefined) {
    return { error: 'error' };
  }

  if (authUserId === undefined) {
    return { error: 'error' };
  }

  if (userIndex === undefined) {
    return { error: 'error' };
  }

  // error when the authorized user is already a member of the channel
  if (data.users[userIndex].channels.includes(channelId)) {
    return { error: 'error' };
  }

  // error when the channel is private, and the user is not already a member or a global owner
  if (!channel.isPublic) {
    if (data.users[userIndex].isGlobalOwner !== 1) {
      return { error: 'error' };
    }
  }

  // update dataStore.js
  data.users[data.users.indexOf(data.users[userIndex])].channels.push(channelId);
  data.channels[data.channels.indexOf(channel)].allMembers.push(data.users[userIndex].uId);
  setData(data);
  return {};
}

/**
* channelInviteV2
* this function allows a user to join a channel
* (public or private) by being invited by an existing member
*
* Arguments:
*   token: string - the users unique session identifier
*   channelId - The channel to be joined
*   uId - the Id for the joining member
*
* Return Value:
*   {error: 'error'}     object         Error message when given invalid input
*   {}                   empty object   Successful run
*/
function channelInviteV2(token: string, channelId: number, uId: number) {
  const data: dataStoreType = getData();
  const channel: channel = getChannel(channelId, data.channels);
  const authUserId: number = data.users.find(user => user.tokens.find(tok => tok === token)).authUserId;
  const userInviting: user = data.users[data.users.findIndex(user => user.authUserId === authUserId)];
  let userJoining: user;
  for (const user of data.users) {
    if (uId === user.uId) {
      userJoining = user;
    }
  }

  // error when we can't find a valid user or channel ID
  if (userJoining === undefined) {
    return { error: 'error' };
  }

  if (userInviting === undefined) {
    return { error: 'error' };
  }

  if (channel === undefined) {
    return { error: 'error' };
  }

  // error when uId refers to user already in channel
  if (userJoining.channels.includes(channelId)) {
    return { error: 'error' };
  }

  // error when authUserId is not a member of the channel
  if (!userInviting.channels.includes(channelId)) {
    return { error: 'error' };
  }

  // updating dataStore.js
  data.users[data.users.indexOf(userJoining)].channels.push(channelId);
  data.channels[data.channels.indexOf(channel)].allMembers.push(userJoining.uId);
  setData(data);
  return {};
}

/**
* addChannelOwnerV1
* this function adds a user as a channel owner
*
* Arguments:
*   token: string - the user adding the owner's unique session identifier
*   channelId - the channel in question
*   uId - the user to be added as an owner
*
* Return Value:
*   {error: 'error'}     object         Error message when given invalid input
*   {}                   empty object   Successful run
*/
function addChannelOwnerV1(token: string, channelId: number, uId: number) {
  const data: dataStoreType = getData();
  const channel: channel = getChannel(channelId, data.channels);
  const authUserId: number = data.users.find(user => user.tokens.find(tok => tok === token)).authUserId;
  const userGivingOwner: user = data.users[data.users.findIndex(user => user.authUserId === authUserId)];
  const userBecomingOwnerIndex: number = data.users.findIndex(user => user.uId === uId);
  const userBecomingOwner: user = data.users[userBecomingOwnerIndex];

  // error when channelId fails to find a valid channel
  if (channel === undefined) {
    return { error: 'error' };
  }

  // error when uId doesn't find a valid user
  if (userBecomingOwner === undefined) {
    return { error: 'error' };
  }

  // error when authUserId doesn't find a valid user
  if (userGivingOwner === undefined) {
    return { error: 'error' };
  }

  // error when the user becoming owner is not a member of the channel
  if (!userBecomingOwner.channels.includes(channelId)) {
    return { error: 'error' };
  }

  // error when the user is already a channel owner
  if (channel.ownerMembers.includes(uId)) {
    return { error: 'error' };
  }

  // error when the user adding is not an existing channel owner or global owner
  if (!(channel.ownerMembers.includes(userGivingOwner.uId)) && (userGivingOwner.isGlobalOwner !== 1)) {
    return { error: 'error' };
  }

  data.channels[data.channels.indexOf(channel)].ownerMembers.push(uId);
  setData(data);
  return {};
}

/**
* removeChannelOwnerV1
* this function remove a user as a channel owner
*
* Arguments:
*   token: string - the user removing the owner's unique session identifier
*   channelId - the channel in question
*   uId - the user to be removed as an owner
*
* Return Value:
*   {error: 'error'}     object         Error message when given invalid input
*   {}                   empty object   Successful run
*/
function removeChannelOwnerV1(token: string, channelId: number, uId: number) {
  const data: dataStoreType = getData();
  const authUserId: number = data.users.find(user => user.tokens.find(tok => tok === token)).authUserId;
  const channel: channel = getChannel(channelId, data.channels);
  const userRemovingOwner: user = data.users[data.users.findIndex(user => user.authUserId === authUserId)];
  const userBeingRemovedIndex: number = data.users.findIndex(user => user.uId === uId);
  const userBeingRemoved: user = data.users[userBeingRemovedIndex];

  // error when channelId fails to find a valid channel
  if (channel === undefined) {
    return { error: 'error' };
  }

  // error when uId doesn't find a valid user
  if (userBeingRemoved === undefined) {
    return { error: 'error' };
  }

  // error when authUserId doesn't find a valid user
  if (userRemovingOwner === undefined) {
    return { error: 'error' };
  }

  // error when uId is not an owner of the channel
  if (!channel.ownerMembers.includes(uId)) {
    return { error: 'error' };
  }

  // error when uId refers to a user who is currently the only owner of the channel
  if (channel.ownerMembers.length === 1) {
    return { error: 'error' };
  }

  // error when the user removing owner is not a member of the channel
  if (!userRemovingOwner.channels.includes(channelId)) {
    return { error: 'error' };
  }

  // error when the user removing the channel owner is not a global owner and channel owner
  if (!(userRemovingOwner.isGlobalOwner === 1) && !channel.ownerMembers.includes(userRemovingOwner.uId)) {
    return { error: 'error' };
  }

  const index: number = data.channels.indexOf(channel);
  data.channels[index].ownerMembers.splice(data.channels[index].ownerMembers.indexOf(uId, 1));
  setData(data);
  return {};
}

/**
* channelLeaveV1
* this function makes a user leave a channel.
* (public or private) given their token and the channelId of leaving channel.
*
* Arguments:
*   token: integer - the authUserID for the member inviting a new member
*   channelId - The channel to be joined
*
* Return Value:
*   {error: 'error'}     object         Error message when given invalid channelId
*                                       or valid channelId given member is not a part of.
*   {}                   empty object   Successful run
*/
function channelsLeaveV1(token: string, channelId: number) {
  if (!checkValidToken(token)) return { error: 'error' };

  const data = getData();

  const authUserId: number = data.users.find(user => user.tokens.find(tok => tok === token)).authUserId;

  const user = data.users.find(i => i.authUserId === authUserId);
  if (user === undefined) { return { error: 'error' }; }

  // the channelsListV1, which uses getUId function already does error checking within.
  const channelsArray = channelsListV2(token).channels;
  const uId = getUId(authUserId);

  if (channelsArray.length === 0) {
    return { error: 'error' };
  }

  // loops through all channels given member is a part of, removes member.
  for (let i = 0; i < channelsArray.length; i++) {
    if (channelsArray[i].channelId === channelId) {
      const foundChannel = data.channels.find(channel => channel.channelId === channelId);
      const foundChannelIndex = data.channels.findIndex(channel => channel.channelId === channelId);

      for (let n = 0; n < foundChannel.allMembers.length; n++) {
        if (foundChannel.allMembers[n] === uId) {
          const newMembersArray = foundChannel.allMembers.filter(item => item !== uId);
          foundChannel.allMembers = newMembersArray;
          data.channels[foundChannelIndex] = foundChannel;

          setData(data);
          return {};
        }
      }
    }
  }
  // case given user wasn't a part of channel.
  return { error: 'error' };
}

export { channelJoinV2, channelInviteV2, addChannelOwnerV1, removeChannelOwnerV1, getChannel, channelDetailsV3, channelMessagesV2, channelsLeaveV1 };
