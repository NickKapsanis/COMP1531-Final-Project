import { getData, setData, dataStoreType } from './dataStore';
import HTTPError from 'http-errors';
import { user, notification, dataStoreType } from './dataStore'

const FORBIDDEN = 403;

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
  
  // should be uinque uIds 
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
