import { getData, setData } from './dataStore';
import { dmListV1 } from './dm';

type messageId = {
    messageId: number;
}

type errorMessage = {
    error: 'error'
}

export function messageSendDmV1(token: string, dmId: number, message: string): messageId | errorMessage {
  const data = getData();

  // Token validation
  if (data.users.find(user => user.tokens.find(tok => tok === token)) === undefined) {
    return { error: 'error' };
  }

  const userId = data.users.find(user => user.token === token).uId;
  const dmsMemberOf = dmListV1(token).dms;

  // Checking if valid dmId was given
  // Validating if authorised user is a member of the DM
  if (data.dms.find(dm => dm.dmId === dmId) === undefined) {
    return { error: 'error' };
  } else if (dmsMemberOf.find(dm => dm.dmId === dmId) === undefined) {
    return { error: 'error' };
  }

  const dmGiven = data.dms.find(dm => dm.dmId === dmId);
  const dmGivenIndex = data.dms.findIndex(dm => dm.dmId === dmId);

  // Message validation
  if (message.length < 1 || message.length > 1000) {
    return { error: 'error' };
  }

  // Finding number of messages in channel
  const numMessages = dmGiven.messages.length;
  let newMessageId;

  // PROBLEM: eg. You have messages 10001, 10002, 10003, 10004. numMessages = 4
  // When you delete 10002, the array is 10001, 10003, 10004 numMessages = 3.
  // Then when new message is created the id will be 10004. Thus duplicate arises.

  // Creating a unique messageId:
  if (numMessages < 10000) {
    newMessageId = dmId * 10000 + numMessages + 1;
  } else {
    newMessageId = dmId * 1000000 + numMessages + 1;
  }

  const newMessage = {
    messageId: newMessageId,
    uId: userId,
    message: message,
    timeSent: Math.floor(Date.now() / 1000),
  };

  data.dms[dmGivenIndex].messages.unshift(newMessage);
  setData(data);

  return { messageId: newMessageId };
}
