import { getData, setData } from './dataStore';
import { channelsListV1 } from './channels';

type messageId = {
    messageId: number;
}

type errorMessage = {
    error: 'error'
}

export function messageSendV1(token: string, channelId: number, message: string): messageId | errorMessage {
  const data = getData();

  // Token validation
  if (data.users.find(user => user.tokens.find(tok => tok === token)) === undefined) {
    return { error: 'error' };
  }

  const userId = data.users.find(user => user.token === token).uId;
  const channelsMemberOf = channelsListV1(token).channels;

  // Checking if valid channelIds were given
  // Validating if authorised user is a member of the channel
  if (data.channels.find(channel => channel.channelId === channelId) === undefined) {
    return { error: 'error' };
  } else if (channelsMemberOf.find(channel => channel.channelId === channelId) === undefined) {
    return { error: 'error' };
  }

  const channelGiven = data.channels.find(channel => channel.channelId === channelId);
  const channelGivenIndex = data.channels.findIndex(channel => channel.channelId === channelId);

  // Message validation
  if (message.length < 1 || message.length > 1000) {
    return { error: 'error' };
  }

  const newMessageId = generateId('c'); 

  const newMessage = {
    messageId: newMessageId,
    uId: userId,
    message: message,
    timeSent: Math.floor(Date.now() / 1000),
  };

  data.channels[channelGivenIndex].messages.unshift(newMessage);
  setData(data);

  return { messageId: newMessageId };
}

function generateId(mode: string) {
  let newId;  
  if (mode === 'c') {
    newId = '1' + String(Date.now()) + String(Math.floor(Math.random() * 100)); 
  } else if (mode === 'd') {
    newId = '2' + String(Date.now()) + String(Math.floor(Math.random() * 100)); 
  }

  return Number(newId); 
}