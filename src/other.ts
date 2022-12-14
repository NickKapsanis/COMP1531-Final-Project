import { getData, setData, dataStoreType, message, dm, channel, user } from './dataStore';
import { getChannel } from './channel';
import HTTPError from 'http-errors';

type errorMessage = {
  error: 'error'
}

type uId = number

// type empty = Record<string, never>

/* Given an authUId returns the uId of the corresponding user
Parameters:
    authUserId - (integer)

Return Value:
    (1) Error returned if authUserId does not exist
    {error : 'error'}

    (2) In case of no error
    uId - (integer)
*/
function getUId(authUserId : number) : errorMessage | uId { // Does this need a token?
  const data = getData();
  const user = data.users.find(i => i.authUserId === authUserId);
  if (user === undefined) {
    return { error: 'error' };
  }
  return user.uId;
}

/*
clearV1 resets the data from dataStore.js to be empty as according to the structure in data.md

Arguments:
    VOID

Return Value:
    VOID
*/
function clearV1() {
  const newData : dataStoreType = {
    users: [],
    channels: [],
    dms: [],
    passwordReset: [],
  };

  setData(newData);
  return {};
}
/*
checkValidUid checks if each given Uid in the uIds array is in the datastore
Arguments:
    Uids: number[] - the user Ids of the users to check for

Return Value:
    boolean
*/
export function checkValidUids(uIds: number[]) {
  // filters through uIds returning an array of only the valid userIds
  // checks if the valid ids are less than the given ids, if so there are invalid ids. return false
  if (uIds.filter(uId => checkValidUid(uId) === true).length < uIds.length) return false;
  else return true;
}
export function checkValidUid(uId: number) {
  const data = getData();
  if (data.users?.find(user => user.uId === uId) === undefined) return false;
  else return true;
}

/* SEARCH V1
* Given a query string, return a collection of messages in all of the channels/DMs
* that the user has joined that contain the query (case-insensitive).
* There is no expected order for these messages.
*
* Parameters
* Token     String     The session id for the individual
* queryStr  String     The parameter to search against
*
* Result
* Messages[] - An array of objects with type messages
*/

function searchV1(token: string, queryStr: string) {
  const data: dataStoreType = getData();
  const outputArray: message[] = [];
  const user: user = data.users.find(user => user.tokens.find(tok => tok === token));

  if (user === undefined) {
    throw HTTPError(403, 'token is invalid');
  }
  if (queryStr.length >= 1000 || queryStr.length <= 0) {
    throw HTTPError(400, 'invalid queryStr length');
  }

  const channels: channel[] = [];
  const DMs: dm[] = [];
  for (const channelId of user.channels) {
    channels.push(getChannel(channelId, data.channels));
  }
  for (const DMid of user.dms) {
    DMs.push(getDMs(DMid, data.dms));
  }

  for (const channel of channels) {
    for (const message of channel.messages) {
      if (message.message.toLowerCase().includes(queryStr.toLowerCase())) {
        outputArray.push(message);
      }
    }
  }
  for (const dm of DMs) {
    for (const message of dm.messages) {
      if (message.message.toLowerCase().includes(queryStr.toLowerCase())) {
        outputArray.push(message);
      }
    }
  }
  return outputArray;
}

function getDMs(DMid: number, DMsArray: dm[]) {
  let dm: dm;
  for (let i = 0; i < DMsArray.length; i++) {
    if (DMid === DMsArray[i].dmId) {
      dm = DMsArray[i];
    }
  }
  return dm;
}

/* getTags
*
* Tag string - String (can contain none, single or multiple @___)
* Returns an array of uIds corresponding to the tagged handles
* should be uinque uIds }
*/

/*
function getTags(message: string) {
  const tagsArray: string[] = message.split('@');

  const users: user[] = getData().users;
  for (let user of users) {
    for (tag of )
    if (tagsArray.contains())
  }
*/

export { clearV1, getUId, searchV1 };
