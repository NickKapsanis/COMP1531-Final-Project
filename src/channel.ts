import { getData, setData, message, dataStoreType, channel } from './dataStore';
// import { userProfileV2 } from './users';
import { channelsListV2 } from './channels';

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

export { channelMessagesV2 };
