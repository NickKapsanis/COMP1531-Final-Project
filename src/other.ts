<<<<<<< HEAD
import { getData, setData, dataStoreType } from './dataStore';
import HTTPError from 'http-errors';
import { user, notification, dataStoreType } from './dataStore'

const FORBIDDEN = 403;
=======
import { getData, setData, dataStoreType, message, dm, channel, user } from './dataStore';
import { getChannel } from './channel';
import HTTPError from 'http-errors';
>>>>>>> Analytics-users/stats-user/stats

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

<<<<<<< HEAD
/*
notifications/get/v1

Parameter:
  token - String

Return type:
  array of 20 latest notifications (of type notifications)

*/
function getNotifications(token: string) {

  const data = getData();
  const user = data.users.find(user => user.tokens.find(t => t === token));

  if (user === undefined) {throw HTTPError(FORBIDDEN, "token passed in is invalid") }

  return { notifications : user.notifications}

}

/*
getTags

Parameter:
  message - string

output:
  undefined     - if message doesn't have any tag
  array of uIds - Returns uIds of all corresponding tagged
                  handles in message

*/
export function getTags(message: string) {
  let uIdArray: number[] = []
 
  const tagsArray: string[] = message.split('@');
  const users: user[] = getData().users;
  for (let user of users) {
    for (let tag of tagsArray) {
      if (tag.includes(user.handleStr)) {
        if (uIdArray.find(user.uId) === undefined) {
          uIdArray.push(user.uId);
        }
      }
    }
 }
}

/*
sendNotificationsAdd()
Parameter:
  data            - dataStoreType
  uIds            - Array of uIds
  ChannelOrDmid   - DmId / ChannelId
  senderHandle    - handle of the person who triggers the notification
                    (sender is the person who adds you to a channel/dm
                    or sends a message that has tagged another person)

return:
    none
*/
export function sendNotificationsAdd(data: dataStoreType, uIds: Number[], ChannelOrDmid: Number, senderHandle: string) {

  // Sends Notification for adding to channel/dm 
  for (let i of uIds) {
    let user = data.users.find(j => j.uId === i);
    let notification: notification;

    let channel = user.channels.find(j => j === ChannelOrDmid);
    let dm = user.dms.find(j => j === ChannelOrDmid);

    if (channel === undefined && dm === undefined) {
      continue;
    }

    if (channel != undefined) {
      notification = {
        channelId: ChannelOrDmid,
        dmId: -1,
        notificationMessage: `${senderHandle} added you to ${channel.name}`
      };
    }
    else if (dm != undefined) {
      notification = {
        channelId: -1,
        dmId: ChannelOrDmid,
        notificationMessage: `${senderHandle} added you to ${dm.name}`
      };
    }

    data.users = data.users.filter(j => j.uId !== i);

    user = addNotification(notification, user);
    data.users.push(user);
    setData(data);

  }

  return;
}

/*
sendNotificationsAdd()
Parameter:
  data            - dataStoreType
  uIds            - Array of uIds
  ChannelOrDmid   - DmId / ChannelId
  senderHandle    - handle of the person who triggers the notification
                    (sender is the person who adds you to a channel/dm
                    or sends a message that has tagged another person)
  message            - string

return:
  none
*/
function sendNotificationsTag(data: dataStoreType, uIds: Number[], ChannelOrDmid: Number, senderHandle: string, message: string) {
  // Sends Notification for tags in channel/dms

  const messageSlice = message.subString(0,20);
  for (let i of uIds) {
    let user = data.users.find(j => j.uId === i);
    let notification: notification;

    let channel = user.channels.find(j => j === ChannelOrDmid);
    let dm = user.dms.find(j => j === ChannelOrDmid);

    if (channel === undefined && dm === undefined) {
      continue;
    }

    if (channel !== undefined) {
      notification = {
        channelId: ChannelOrDmid,
        dmId: -1,
        notificationMessage: `${senderHandle} tagged you in ${channel.name}: ${messageSlice}`
      };
    }
    else if (dm !== undefined) {
      notification = {
        channelId: -1,
        dmId: ChannelOrDmid,
        notificationMessage: `${senderHandle} tagged you in ${dm.name}: ${messageSlice}`
      };
    }

    data.users = data.users.filter(j => j.uId !== i);

    user = addNotification(notification, user);
    data.users.push(user);
    setData(data);

  }
  return;
}

/*
sendNotificationReact

PARAMETERS- 
  uId(of user who sent the message) - number
  ChannelOrDmid                     - number
  reactorHandle                     - string

RETURNS-
  {}
*/
export function sendNotificationReact(uId: number, ChannelOrDmid: number, reactorHandle: strings) {
  let user = data.users.find(j => j.uId === i);
  let notification: notification;

  let channel = user.channels.find(j => j === ChannelOrDmid);
  let dm = user.dms.find(j => j === ChannelOrDmid);

  if (channel === undefined && dm === undefined) {
    continue;
  }

  if (channel !== undefined) {
    notification = {
      channelId: ChannelOrDmid,
      dmId: -1,
      notificationMessage: `${reactorHandle} reacted to your message in ${channel.name}`
    };
  }
  else if (dm !== undefined) {
    notification = {
      channelId: -1,
      dmId: ChannelOrDmid,
      notificationMessage: `${reactorHandle} reacted to your message in ${dm.name}`
    };
  }

  data.users = data.users.filter(j => j.uId !== i);

  user = addNotification(notification, user);
  data.users.push(user);
  setData(data);

  return;
}

/*
getTags

Parameter:
  message - string

output:
  user - Returns user with added notification

*/

export function addNotification(notification: notification, user: user) {

  if (user.notifications.length === 20) {
    (user.notification).pop();
  }

  user.notifications.unshift(notification);

  return user;
}


export { clearV1, getUId, getNotifications };
=======
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
>>>>>>> Analytics-users/stats-user/stats
