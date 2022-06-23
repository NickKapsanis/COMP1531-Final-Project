import {getData, setData} from './dataStore';
// Given an authUId returns the uId of the corresponding user
// returns error if user does not exist
// parameter - authUserId (integer)
// returns - uId (integer)
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
