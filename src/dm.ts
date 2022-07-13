import { checkValidToken } from './auth';
import { getData, setData } from './dataStore';
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
  if (!isMemberOf(dmId, token)) return { error: 'error' };
  // if all if's above are not triggered, return details
  const data = getData();
  return {
    name: data.dms?.find(dm => dm.dmId === dmId)?.name,
    members: data.users?.filter(user => user.dms.includes(dmId)),
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
  // need to remove user from dm all members in data
  const dmUserIndex = data.dms?.find(dm => dm.dmId === dmId)?.allMembers.findIndex(member => member === userId);
  if (dmUserIndex !== undefined) {
    data.dms?.find(dm => dm.dmId === dmId)?.allMembers.splice(dmUserIndex, 1);
  }
  // need to remove dmId from user.dms
  const dmIndex = data.users?.find(user => user.uId === userId)?.dms.findIndex(dm => dm === dmId);
  if (dmIndex !== undefined) {
    data.users?.find(user => user.uId === userId)?.dms.splice(dmIndex, 1);
  }
  // now set the modified data
  setData(data);
  return {};
}

// returns true or false if the input dmId is or is not a valid dmId in the datastore repectivly.
function checkValidDmId(dmId: number) {
  const data = getData();
  if (data.dms?.find(dm => dm.dmId === dmId) !== undefined) {
    return true;
  } else {
    return false;
  }
}
// returns true or false if the input authUserId is or is not a member of the dmId
function isMemberOf(dmId: number, token: string) {
  const data = getData();
  const authUserId = data.users?.find(user => user.tokens.find(tok => tok === token))?.authUserId;
  if (data.dms?.find(dm => dm.allMembers.find(member => member === authUserId)) !== undefined) {
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
