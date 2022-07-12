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
  };

  setData(newData);
  return {};
}

export { clearV1, getUId };
