import {getData} from './dataStore'

type user = {
  uId: number, 
  email: string,
  nameFirst: string, 
  nameLast: string, 
  handleStr: string
}

type error = {
  error : 'error'
}

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

function userProfileV1(token: string, uId: number) : error | user {
  let data = getData();
  let user1 = data.users.find(user => user.tokens.find(t => t === token));
  let user2 = data.users.find(i => i.uId === uId);

  if (user1 === undefined || user2 === undefined) { return { error : 'error'} };
  
  return {
    uId: user2.uId, 
    email: user2.email,
    nameFirst: user2.nameFirst, 
    nameLast: user2.nameLast, 
    handleStr: user2.handleStr
  }
}

export { userProfileV1 }