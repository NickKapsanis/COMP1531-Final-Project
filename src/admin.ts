import { dataStoreType, getData, setData } from './dataStore';
import HTTPError from 'http-errors';
import { checkValidToken } from './auth';

const FORBID = 403;
const BAD_REQ = 400;
// const OKAY = 200;

/*
adminUserpermissionChangeV1
Given a user by their user ID, set global their permissions to
 new permissions described by permissionId

Arguments:
    uId (number)    - uID of the user having its permission modified
    permissionId (number)   - permission Id to set the uId to
    token (string)  - token of the calling user

Return Value:
   throw 400 Error on
    -> uId not valid uID
    -> uID refers to the only global owner and is being demoted (must have 1+ global owner)
    -> permission Id is invalid (1 or 2)
    -> user already has the permission ID

    throw 403 Error on
    -> authUser is not a global owner.

    Returns {} on no error throw
*/
export function adminUserpermissionChangeV1(uId: number, permissionId: number, token: string) {
  const data = getData();
  if (!checkValidToken(token)) { // token is invalid
    throw HTTPError(FORBID, 'Invalid Token');
  }
  if (!isGlobalOwner(tokenToUid(token, data), data)) {
    throw HTTPError(FORBID, 'Must be a global owner to change permissions');
  }
  if (!isValidUid(uId, data)) {
    throw HTTPError(BAD_REQ, 'Invalid uId');
  }
  if (countGlobalOwners(data) <= 1 && isGlobalOwner(uId, data)) {
    throw HTTPError(BAD_REQ, 'Cannot remove only global owner');
  }
  if (permissionId !== 1 && permissionId !== 2) {
    throw HTTPError(BAD_REQ, 'Permission code must be 1 or 2');
  }
  if (data.users.find(user => user.uId === uId).isGlobalOwner === permissionId) {
    throw HTTPError(BAD_REQ, 'User already has those permissions');
  }
  // after passing these if statement, in this order, as lower if statements are depenedant on upper ones not triggering
  // now change the user permissions.
  data.users.find(user => user.uId === uId).isGlobalOwner = permissionId;
  setData(data);
  return {};
}

/*
adminUserRemoveV1
Given a user by their uId, remove them from the Treats.
This means they should be removed from all channels/DMs,
and will not be included in the array of users returned by users/all.
Treats owners can remove other Treats owners
(including the original first owner).

-Once users are removed, the contents of the messages they sent
    will be replaced by 'Removed user'.

- Their profile must still be retrievable with user/profile,
    however nameFirst should be 'Removed' and nameLast should be 'user'.

- The user's email and handle should be reusable.

Arguments:
    uId (number)    - uID of the user being removed
    token (string)  - token of the calling user

Return Value:
   throw 400 Error on
    -> uId not valid uID
    -> uID refers to the only global owner (must have 1+ global owner)

    throw 403 Error on
    -> authUser is not a global owner.

    Returns {} on no error throw
*/
export function adminUserRemoveV1(uID: number, token: string) {
  return {};
}

// helper function, checks if uId is valid returns boolean
function isValidUid(uId: number, data: dataStoreType) {
  if (data.users.find(user => user.uId === uId) === undefined) return false;
  else return true;
}
// helper, counts num of globalOwners
function countGlobalOwners(data: dataStoreType) {
  return data.users.filter(user => user.isGlobalOwner === 1).length;
}
// helper, checks if is global owner, boolean return
function isGlobalOwner(uId: number, data: dataStoreType) {
  if (data.users.find(user => user.uId === uId).isGlobalOwner === 1) return true;
  else return false;
}
// helper, gets uID from token must be valid token
function tokenToUid(token: string, data: dataStoreType) {
  return data.users.find(user => user.tokens.find(tok => tok === token)).uId;
}
