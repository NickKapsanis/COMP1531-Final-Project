import { getData, setData } from './dataStore'; 
import isEmail from "validator/lib/isEmail";
/*
Given an authUserId and a uId, the function userProfileV1
returns the user information of the corresponding uId

* Parameters :
    authUserId (integer)
    uId        (integer)

* Return values :
  (1) Error returned if either authUserId or uId do not exist
    {error : 'error'} 
   
  (2) User information returned for user with uId given as parameter
    { 
      uId       : (integer)   
      email     : (string)
      nameFirst : (string)
      nameLast  : (string)
      handleStr : (string)
    }
*/

function userProfileV1(authUserId, uId) {
  let data = getData();
  let user1 = data.users.find(i => i.authUserId === authUserId);
  let user2 = data.users.find(i => i.uId === uId);

  if (user1 === undefined || user2 === undefined) {return { error : 'error'} };
  
  return {
    uId: user2.uId, 
    email: user2.email,
    nameFirst: user2.nameFirst, 
    nameLast: user2.nameLast, 
    handleStr: user2.handleStr
  }
}

/*
Given an authUserId, firstname and lastname, the function userSetnameV1
changes the user details according to what was inputted.

* Parameters :
    authUserId (integer)
    nameFirst        (string)
    nameLast         (string)

* Return values :
  (1) Error returned if either authUserId or uId do not exist
    {error : 'error'} 
   
  (2) nothing
    {}
*/
function userSetnameV1(token: string, nameFirst: string, nameLast: string) {
  const data: dataStoreType = getData();

  //does all the error checking
  if (nameFirst.length > 50 || nameFirst.length < 1 || 
    nameLast.length > 50 || nameLast.length < 1) {
    return {error: 'error'};
  }

  //finds person from the data, and changes their firstname.
  let user = data.users.find(i => i.token === token);
  if (user === undefined) {
    return { error : 'error'};
  }
  user.nameFirst = nameFirst;

  setData(data);
  return {};
}


/*
Given an authUserId, and email, the function userSetnameV1
changes the user details according to what was inputted.

* Parameters :
    authUserId (integer)
    email        (string)

* Return values :
  (1) Error returned if either authUserId or uId do not exist
    {error : 'error'} 
   
  (2) nothing
    {}
*/
function userSetemailV1(token: string, email: string) {
  const data: dataStoreType = getData();

  //does all the error checking
  if (!isEmail(email)) {
    return {error: 'error'};
  }

  //finds person from the data, and changes their firstname.
  let user = data.users.find(i => i.token === token);
  if (user === undefined) {
    return { error : 'error'};
  }
  user.email = email;

  setData(data);
  return {};
}

/*
Given an authUserId, and handle, the function userSetnameV1
changes the user details according to what was inputted.

* Parameters :
    authUserId (integer)
    handle        (string)

* Return values :
  (1) Error returned if either authUserId or uId do not exist
    {error : 'error'} 
   
  (2) nothing
    {}
*/
function userSethandlelV1(token: string, handleStr: string) {
  const data: dataStoreType = getData();

  //does all the error checking
  if (nameFirst.length > 20 || nameFirst.length < 3 || !(nameFirst.match(/^[0-9a-z]+$/))) {
    return {error: 'error'};
  }

  //checks that the handle isn't already used by another user.
  if (data.users.find(i => i.handleStr === handleStr) !== undefined) {
    return {error: 'error'};
  }

  //finds person from the data, and changes their firstname.
  let user = data.users.find(i => i.token === token);
  if (user === undefined) {
    return { error : 'error'};
  }
  user.handleStr = handleStr;

  setData(data);
  return {};
}


export { userProfileV1, userSetnameV1, userSetemailV1, userSethandlelV1 }