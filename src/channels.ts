import { getData, setData, channel } from './dataStore';
import { checkValidToken } from './auth';

export type channelsListItem = {
    channelId: number,
    name: string
  };

export type channelsListType = {channels: channelsListItem[]};

/*
this function gives an array of all channels the user is in

Arguments:
    authUserId: integer    - the users unique identification number

Return Value:
    channelsArray: array    - an array of all channels user is in.
*/
function channelsListV2(token: string) {
  if (!checkValidToken(token)) return { error: 'error' };

  const data = getData();

  const authUserId = data.users.find(user => user.tokens.find(tok => tok === token)).authUserId;

  const user = data.users.find(i => i.authUserId === authUserId);
  if (user === undefined) { return { error: 'error' }; }

  let numChannels = 0;
  const channelsArray = [];

  // this loop searches for given user id within every channel.
  for (let i = 0; i < data.channels.length; i++) {
    for (let n = 0; n < data.channels[i].allMembers.length; n++) {
      if (data.channels[i].allMembers[n] === user.uId) {
        numChannels++;

        const channel = {
          channelId: data.channels[i].channelId,
          name: data.channels[i].name
        };
        channelsArray.push(channel);
      }
    }
  }

  // case with no channels
  if (numChannels === 0) {
    return { channels: [] };
  }

  return { channels: channelsArray };
}

/*
  this function gives an array of all channels.
  converted to typescript for v2.

  Arguments:
      authUserId: integer    - the users unique identification number

  Return Value:
      allChannelsArray: array    - an array of all channels.
  */
function channelsListallV2(token: string) {
  if (!checkValidToken(token)) return { error: 'error' };

  const data = getData();

  const authUserId: number = data.users.find(user => user.tokens.find(tok => tok === token)).authUserId;

  const user = data.users.find(i => i.authUserId === authUserId);
  if (user === undefined) { return { error: 'error' }; }

  const allChannelsArray = [];

  // case with no channels
  if (data.channels.length === 0) {
    return { channels: [] };
  }

  // this loop finds all arrays, adds them to channelsArray
  for (let j = 0; j < data.channels.length; j++) {
    const channel = {
      channelId: data.channels[j].channelId,
      name: data.channels[j].name
    };
    allChannelsArray.push(channel);
  }

  return { channels: allChannelsArray };
}

/*
The function channelsCreateV1() creates a channel and adds it to
the dataStore. the user is added as the owner and member of the channel.
Returns the unique channelId for the created channel.

* Parameters -
    token      - (string)
    name       - (string)
    isPublic   - (boolean)

* Returns -
    (1) error if authUserId does not exist
    {error : 'error'}

    (2)
    channelId - (integer)
*/
function channelsCreateV1(token: string, name: string, isPublic: boolean) {
  const data = getData();
  const creator = data.users.find(user => user.tokens.find(t => t === token));

  // Error cases
  if (creator === undefined) { return { error: 'error' }; }
  if (name.length > 20 || name.length < 1) { return { error: 'error' }; }

  const newChannelId = data.channels.length + 1;

  const newChannel : channel = {

    channelId: newChannelId,
    name: name,
    isPublic: isPublic,
    allMembers: [creator.uId],
    ownerMembers: [creator.uId],
    messages: [],
    standupActiveTime: { isActive: false },
    standupMessageBank: []
  };

  data.channels.push(newChannel);
  data.users = data.users.filter(i => i.authUserId !== creator.authUserId);
  creator.channels.push(newChannelId);
  data.users.push(creator);

  setData(data);

  return { channelId: newChannelId };
}

export { channelsCreateV1, channelsListV2, channelsListallV2 };
