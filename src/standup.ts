// note @ tags shouldn't be parsed as notifications --> TALK TO WHOEVER IS DOING NOTIFICATIONS

import { getData, setData, dataStoreType, channel, message, user } from './dataStore';
import { getChannel } from './channel';
import HTTPError from 'http-errors';

/**
* standupStartV1
* This function allows user to create a Standup period for a given duration in a channel
*
* Arguments:
*   token - user's session identifier
*   channelId - the channel to host the standup
*   length - a number (in seconds) for the duration of the standup
*
* Return Value:
*   400 error         Error message when given invalid input
*   403 error         Invalid permissions
*   finishTime        Successful run
*/
function standupStartV1(token: string, channelId: number, length: number) {
  const data: dataStoreType = getData();
  const channel: channel = getChannel(channelId, data.channels);
  const finishTime: number = Math.floor((new Date()).getTime() / 1000) + length;
  const user: user = data.users.find(user => user.tokens.find(tok => tok === token));

  // error conditions
  if (user === undefined) {
    throw HTTPError(403, 'token is invalid');
  }
  if (channel === undefined) {
    throw HTTPError(400, 'channelId does not refer to a valid channel');
  }
  if (length <= 0) {
    throw HTTPError(400, 'length is a negative integer');
  }
  if (channel.standupActiveTime.isActive) {
    throw HTTPError(400, 'an active standup is already running in the channel');
  }
  if (!(user.channels.includes(channel.channelId))) {
    throw HTTPError(403, 'token is valid but user is not a member of the channel');
  }

  // return conditions
  const index: number = data.channels.indexOf(channel);
  data.channels[index].standupActiveTime.isActive = true;
  data.channels[index].standupActiveTime.timeFinish = finishTime;
  setData(data);
  setTimeout(function() { finishStandup(channel.channelId, user); }, length * 1000);
  return { finishTime: finishTime };
}

/**
* standupActiveV1
* This function displays whether a standup is active or not, and when it should finish if active
*
* Arguments:
*   token - user's session identifier
*   channelId - the channel to host the standup
*
* Return Value:
*   400 error         Error message when given invalid input
*   403 error         Error with invalid permissions
*   { isActive, timeFinish}      boolean - is standup active, timeFinish - null if no standup active
*/
function standupActiveV1(token: string, channelId: number) {
  const data: dataStoreType = getData();
  const channel: channel = getChannel(channelId, data.channels);
  const user: user = data.users.find(user => user.tokens.find(tok => tok === token));

  // error conditions
  if (user === undefined) {
    throw HTTPError(403, 'token is invalid');
  }
  if (channel === undefined) {
    throw HTTPError(400, 'channelId does not refer to a valid channel');
  }
  if (!(user.channels.includes(channel.channelId))) {
    throw HTTPError(403, 'token is valid but user is not a member of the channel');
  }

  // return conditions
  if (channel.standupActiveTime.isActive) {
    return { isActive: channel.standupActiveTime.isActive, timeFinish: channel.standupActiveTime.timeFinish };
  } else {
    // we know time finish should be null if standup is not Active --> can ignore the tsc flag
    // eslint-disable-next-line
    // @ts-ignore
    return { isActive: false, timeFinish: null };
  }
}

/**
* standupSendV1
* This function sends messages to be sent as a big block at the end of the standup
*
* Arguments:
*   token - user's session identifier
*   channelId - the channel to host the standup
*   message - the string to be added to the store to be sent after the standup ends
*
* Return Value:
*   400 error         Error message when given invalid input
*   403 error         Error with invalid permissions
*   {}                Empty Object, successful run
*/
function standupSendV1(token: string, channelId: number, message: string) {
  const data: dataStoreType = getData();
  const channel: channel = getChannel(channelId, data.channels);
  const user: user = data.users.find(user => user.tokens.find(tok => tok === token));

  // error conditions
  if (user === undefined) {
    throw HTTPError(403, 'token is invalid');
  }
  if (channel === undefined) {
    throw HTTPError(400, 'channelId does not refer to a valid channel');
  }
  if (message.length > 1000) {
    throw HTTPError(400, 'length of message is over 1000 characters');
  }
  if (!(channel.standupActiveTime.isActive)) {
    throw HTTPError(400, 'an active standup is not currently running in the channel');
  }
  if (!(user.channels.includes(channel.channelId))) {
    throw HTTPError(403, 'token is valid but user is not a member of the channel');
  }

  const index: number = data.channels.indexOf(channel);
  const outputStr: string = (user.handleStr + ': ' + message);
  data.channels[index].standupMessageBank.push(outputStr);
  setData(data);
  return {};
}

// helper function to call after length of standup expires. Sends all messages during standup to the channel
function finishStandup(channelId: number, user: user) {
  const data = getData();
  const channel: channel = getChannel(channelId, data.channels);
  let finalOutput = '';

  if (channel === undefined) {
    console.log('WAS UNDEFINED');
    return;
  }

  // send all messages in the standup bank as one big message from the user who began the standup
  if (channel.standupMessageBank.length !== 0) {
    for (let i = 0; i < channel.standupMessageBank.length - 1; i++) {
      finalOutput += (channel.standupMessageBank[i] + '\n');
    }
    // last message shouldn't print a newline afterwards
    finalOutput += channel.standupMessageBank[(channel.standupMessageBank.length) - 1];
  } else {
    return;
  }

  const newId = Number('1' + String(Date.now()) + String(Math.floor(Math.random() * 100)));
  const UId = Number(user.uId);
  const newMessage: message = {
    messageId: newId,
    uId: UId,
    timeSent: Math.floor(Date.now() / 1000),
    message: finalOutput,
  };

  const index: number = data.channels.indexOf(channel);
  data.channels[index].messages.unshift(newMessage);
  data.channels[index].standupActiveTime.isActive = false;
  data.channels[index].standupMessageBank = [];
  delete data.channels[index].standupActiveTime.timeFinish;
  console.log('GOT HERE!');
  setData(data);
  return {};
}

export { standupActiveV1, standupSendV1, standupStartV1 };
