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

  const newMessageId = generateId('d'); 

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

function generateId(mode: string) {
  let newId;  
  if (mode === 'c') {
    newId = '1' + String(Date.now()) + String(Math.floor(Math.random() * 100)); 
  } else if (mode === 'd') {
    newId = '2' + String(Date.now()) + String(Math.floor(Math.random() * 100)); 
  }

  return Number(newId); 
}