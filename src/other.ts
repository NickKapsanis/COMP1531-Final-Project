import { getData, setData, dataStoreType } from './dataStore';

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

Argument:
  None

Return type:
  array of 20 latest notifications

*/

export { clearV1, getUId };
