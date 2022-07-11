import { getData, setData } from './dataStore';
import { channelsListV1 } from './channels';

type errorMessage = {
    error: 'error'
}

export function messageRemoveV1(token: string, messageId: number): errorMessage | Record<string, never> {
  const data = getData();

  // Token validation
  if (data.users.find(user => user.tokens.find(tok => tok === token)) === undefined) {
    return { error: 'error' };
  }
  
  const userId = data.users.find(user => user.token === token).uId;
  const channelsMemberOf = channelsListV1(token).channels;

  // MessageId validation and finding the channel it belongs to
  let channelGiven;
  const isMessageIdValid = data.channels.every((channel) => {
    if (channel.messages.find(message => message.messageId === messageId) !== undefined) {
      channelGiven = channel;
      return false;
    }

    return true;
  });

  if (isMessageIdValid === true) {
    return { error: 'error' };
  }

  const channelGivenIndex = data.channels.findIndex(channel => channel.channelId === channelGiven.channelId);
  const messageGiven = channelGiven.messages.find(message => message.messageId === messageId);

  // Finding channel (which message is in) and validating if user is a part of that channel
  // Validating if authorised user has owner permissions in the channel/DM. NOTE: can a global owner count as an owner?
  // Validating if authorised user sent the message
  if (channelsMemberOf.find(channel => channel.channelId === channelGiven.channelId) === undefined) {
    return { error: 'error' };
  } else if (channelGiven.ownerMembers.find(owner => owner === userId) === undefined) {
    return { error: 'error' };
  } else if (messageGiven.uId !== userId) {
    return { error: 'error' };
  }

  const removedMessage = channelGiven.messages.filter(message => message.messageId !== messageId);

  data.channels[channelGivenIndex].messages = removedMessage;
  setData(data);
  return {};
}
