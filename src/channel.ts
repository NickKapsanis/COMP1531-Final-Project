import { getData, setData, dataStoreType, channel } from './dataStore';
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

export { channelDetailsV2 };
