import { checkValidToken } from './auth';
import { getData, setData, dm, dataStoreType } from './dataStore';
import { checkValidUids } from './other';
import { user } from './users';

export type dmListItem = {
  dmId: number,
  name: string,
}

export type dmList = { dms: dmListItem[]};

/*
dmDetailsV1 takes a dmId and an active token and returns basic details about the DM

Arguments:
    dmId    - the Id of the DM channel
    token    - the session token of the user calling the request

Return Value:
    Returns an object with {name, members} if no error
    Returns {error: 'error'} if any of,
     dmID is not valid
     dmID is valid but authUserId is not a member of the DM
     token us not valid
*/
export function dmDetailsV1(token: string, dmId: number) {
  // input check the 3 possible error returns
  if (!checkValidToken(token)) return { error: 'error' };
  if (!checkValidDmId(dmId)) return { error: 'error' };
  if (!isMemberOf(dmId, token) && !isOwnerOf(dmId, token)) return { error: 'error' };
  // if all if's above are not triggered, return details
  const data = getData();
  const members: user[] = [];
  const memberuId = data.users.filter(user => user.dms.includes(dmId));
  for (const user of memberuId) {
    const tempuser: user = {
      uId: user.uId,
      email: user.email,
      nameFirst: user.nameFirst,
      nameLast: user.nameLast,
      handleStr: user.handleStr,
    };
    members.push(tempuser);
  }
  return {
    name: data.dms.find(dm => dm.dmId === dmId).name,
    members: members,
  };
}
/*
dmLeaveV1 takes a dmId and an active token and removes the calling user from the DM

Arguments:
    dmId    - the Id of the DM channel
    token    - the session token of the user calling the request

Return Value:
    Returns an empty object - {} if no error
    Returns {error: 'error'} if any of,
     dmID is not valid
     dmID is valid but authUserId is not a member of the DM
     token us not valid
*/
export function dmLeaveV1(token: string, dmId: number) {
  // input check the 3 possible error returns
  if (!checkValidToken(token)) return { error: 'error' };
  if (!checkValidDmId(dmId)) return { error: 'error' };
  if (!isMemberOf(dmId, token)) return { error: 'error' };
  // if all if statements were passed over, remove the user from the dm
  const data = getData();
  const userId = tokenToUserId(token);
  // need to remove user from the DM's allMembers array as the user exists and the dm exists no need to safe index with '?.'
  const dmUserIndex = data.dms.find(dm => dm.dmId === dmId).allMembers.findIndex(member => member === userId);
  data.dms.find(dm => dm.dmId === dmId).allMembers.splice(dmUserIndex, 1);
  // need to remove dmId from user.dms
  const dmIndex = data.users.find(user => user.uId === userId).dms.findIndex(dm => dm === dmId);
  data.users.find(user => user.uId === userId).dms.splice(dmIndex, 1);
  // now set the modified data
  setData(data);
  return {};
}
/*
dmmessagesV1 takes a dmId an active token and a start index and paginates 50 messages from the DM

Arguments:
    dmId    - the Id of the DM channel
    token    - the session token of the user calling the request
    start   - the start index to paginate on

Return Value:
    Returns an object with {messages, start, end} if no error
    Returns {error: 'error'} if any of,
     dmID is not valid
     dmID is valid but authUserId is not a member of the DM
     token us not valid
     start is greater than the total number of messages in the channel
*/
export function dmMessagesV1(token: string, dmId: number, start: number) {
  // input check the 3 possible error returns
  if (!checkValidToken(token)) return { error: 'error' };
  if (!checkValidDmId(dmId)) return { error: 'error' };
  if (!isMemberOf(dmId, token)) return { error: 'error' };
  const data = getData();
  const dmObjMessages = data.dms.find(dm => dm.dmId === dmId).messages;
  if (dmObjMessages === undefined || dmObjMessages.length < start) return { error: 'error' };
  // if all if statements were passed over, paginate the messages.
  // start by setting the end of the current block to send
  let pageEnd = start + 50;
  let end : number;
  if (pageEnd >= dmObjMessages.length) {
    const numToPrint = pageEnd - 50;
    pageEnd = start + numToPrint;
    end = -1;
  } else {
    end = pageEnd;
  }
  return {
    messages: dmObjMessages.slice(start, pageEnd + 1),
    start: start,
    end: end,
  };
}
/*
dmCreateV1
Given an active token and array of valid userIds create a DM containing the auth user and the users in the array,
The creator is the owner of the DM. name should be automatically generated based on the users that are in this DM.
The name should be an alphabetically-sorted, comma-and-space-separated array of user handles,
e.g. 'ahandle1, bhandle2, chandle3'.

Arguments:
    token (string)      - token of the user calling the function
    uIds (array of numbers)  - array of the users the DM is sent to, not including the owner/authUser

Return Value:
    Returns { error : 'error' } on
        -token is invalid
        - and uID in uIDs is invalid
        -any uID in uIds is duplicated

    Returns { dmID } on sucess
*/
export function dmCreateV1(token: string, uIds: number[]) {
  const data: dataStoreType = getData();
  // Input checking 3 possible failures
  // token is invalid
  if (!checkValidToken(token)) return { error: 'error' };
  // any uId in uIds is invalid
  if (!checkValidUids(uIds)) return { error: 'error' };
  // duplicate uId in uIds by comparing array size to set size
  if (uIds.length !== new Set(uIds).size) return { error: 'error' };
  // if all above if's are passed over all input is valid and safe to reference into.

  const creator = data.users.find(user => user.tokens.find(t => t === token));
  const newDmId = data.dms.length + 1;

  const handleArray = [];
  // push the handle of the user who calls the creation of the DM
  handleArray.push(data.users.find(user => user.uId === tokenToUserId(token)).handleStr);
  for (const x of uIds) {
    const uIdUser = data.users.find(user => user.uId === x);
    data.users = data.users.filter(i => i.authUserId !== uIdUser.uId);
    uIdUser.dms.push(newDmId);
    data.users.push(uIdUser);
    handleArray.push(uIdUser.handleStr);
  }

  handleArray.sort();
  const newDmName = handleArray.join(', ');

  const allDmMembers = uIds;
  uIds.push(tokenToUserId(token));

  const newDm : dm = {

    dmId: newDmId,
    name: newDmName,
    allMembers: allDmMembers,
    owner: creator.uId,
    messages: []
  };

  data.dms.push(newDm);
  data.users = data.users.filter(i => i.authUserId !== creator.authUserId);
  creator.dms.push(newDmId);
  data.users.push(creator);

  setData(data);

  return { dmId: newDmId };
}
/*
dmListV1
Given an active token return an array of DMs the user is a member of.

Arguments:
    token (string)      - token of the user calling the function

Return Value:
    Returns { error : 'error' } on
        -token is invalid

    Returns { dms } on sucess where dms: array of objects, each contains {dmId, name}
*/
export function dmListV1(token: string) {
  const data = getData();
  // token is invalid
  if (!checkValidToken(token)) return { error: 'error' };
  const user = data.users.find(user => user.tokens.find(t => t === token));
  const dmsArray = [];

  for (const x of user.dms) {
    const dm = data.dms.find(dm => dm.dmId === x);
    const obj = {
      dmId: dm.dmId,
      name: dm.name
    };
    dmsArray.push(obj);
  }

  return { dms: dmsArray };
}
/*
dmRemoveV1
Given an active token and a valid dmId, remove the user from the DM. both in user and dm data.

Arguments:
    token (string)      - token of the user calling the function
    dmId  - ID of the DM to remove user from, number

Return Value:
    Returns { error : 'error' } on
        -token is invalid
        -dmId is invalid

    Returns {} on sucess
*/
export function dmRemoveV1(token: string, dmId: number) {
  const data = getData();

  let user = data.users.find(user => user.tokens.find(t => t === token));
  const dm = data.dms.find(dm => dm.dmId === dmId);

  if (user === undefined || dm === undefined) { return { error: 'error' }; }
  if (user.uId !== dm.owner) { return { error: 'error' }; }

  const users = dm.allMembers;
  users.push(dm.owner);

  for (const x of users) {
    user = data.users.find(i => i.uId === x);
    data.users = data.users.filter(i => i.uId !== x);
    user.dms = user.dms.filter(i => i !== dmId);
    data.users.push(user);
  }

  data.dms = data.dms.filter(i => i.dmId !== dmId);
  setData(data);
  return {};
}
// helper function returns true or false if the input dmId is or is not a valid dmId in the datastore repectivly.
function checkValidDmId(dmId: number) {
  const data = getData();
  if (data.dms?.find(dm => dm.dmId === dmId) !== undefined) {
    return true;
  } else {
    return false;
  }
}
// helper function returns true or false if the input token authuser is or is not a member of the dmId
function isMemberOf(dmId: number, token: string) {
  const data = getData();
  const userId = data.users?.find(user => user.tokens.find(tok => tok === token))?.uId;

  if (data.dms?.find(dm => dm.dmId === dmId).allMembers.find(member => member === userId) !== undefined) {
    return true;
  } else {
    return false;
  }
}
// helper function returns true or false if the input token authUSer is or is not a memebr of the dmId
function isOwnerOf(dmId: number, token: string) {
  const data = getData();
  const userId = data.users?.find(user => user.tokens.find(tok => tok === token))?.uId;
  // now check in the owner field of the DM intrested in
  if (data.dms?.find(dm => dm.dmId === dmId).owner === userId) {
    return true;
  } else {
    return false;
  }
}
// helper function returns userId of authUserId returns -1 if the authUserId is not in the datastore.
export function giveUid(authUserId: number) {
  const userId = getData().users?.find(user => user.authUserId === authUserId)?.uId;
  if (userId === undefined) return -1;
  else return userId;
}

// helper function retunrs userId of given active token returns -1 if the userId does not exist.
function tokenToUserId(token: string) {
  const data = getData();
  const userId = data.users?.find(user => user.tokens.find(tok => tok === token))?.uId;
  if (userId === undefined) return -1;
  else return userId;
}
