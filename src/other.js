import {getData, setData} from './dataStore';

/* Given an authUId returns the uId of the corresponding user
Parameters:
    authUserId - (integer)

Return Value:
    (1) Error returned if authUserId does not exist
    {error : 'error'}

    (2) In case of no error
    uId - (integer)
*/
function getUId(authUserId) {
  let data = getData();
  let user = data.users.find(i => i.authUserId === authUserId);
  if (user === undefined) {
    return { error : 'error'};
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
let data = getData();  
data = {
  users : [],
  channels : [],
};

setData(data);
  return {};
}

export { clearV1, getUId };