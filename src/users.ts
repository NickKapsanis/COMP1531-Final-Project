import HTTPError from 'http-errors';

const FORBIDDEN = 403;
const BAD_REQUEST = 400;

type user = {
  uId: number,
  email: string,
  nameFirst: string,
  nameLast: string,
  handleStr: string
}

import { getData, setData } from './dataStore';
import isEmail from 'validator/lib/isEmail';
import { checkValidToken } from './auth';
import { checkValidUid } from './other';

/*
Given an authUserId and a uId, the function userProfileV1
returns the user information of the corresponding uId

* Parameters :
    token      (string)
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

function userProfileV3(token: string, uId: number) {
  const data = getData();
  if (!checkValidToken(token)) { // token is invalid
    throw HTTPError(FORBIDDEN, 'Invalid Token');
  }
  if (!checkValidUid(uId)) { // token is invalid
    throw HTTPError(BAD_REQUEST, 'Invalid Uid');
  }
  // const user1 = data.users.find(user => user.tokens.find(t => t === token));
  const user = data.users.find(i => i.uId === uId);

  // checking if either uId or token are invalid
  // if (user1 === undefined) { throw HTTPError(FORBIDDEN, 'token passed in is invalid'); }
  // if (user2 === undefined) { throw HTTPError(BAD_REQUEST, 'uId does not refer to a valid user'); }

  // constructing output
  const userInfo: user = {
    uId: user.uId,
    email: user.email,
    nameFirst: user.nameFirst,
    nameLast: user.nameLast,
    handleStr: user.handleStr
  };

  return {
    user: userInfo
  };
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
  if (!checkValidToken(token)) return { error: 'error' };

  const data = getData();

  // does all the error checking
  if (nameFirst.length > 50 || nameFirst.length < 1 ||
    nameLast.length > 50 || nameLast.length < 1) {
    return { error: 'error' };
  }

  // finds person from the data.
  const authUserId: number = data.users.find(user => user.tokens.find(tok => tok === token)).authUserId;
  const user = data.users.find(i => i.authUserId === authUserId);
  const userIndex = data.users.findIndex(i => i.authUserId === authUserId);

  if (user === undefined) {
    return { error: 'error' };
  }

  // changes users first and last names.
  data.users[userIndex].nameFirst = nameFirst;
  data.users[userIndex].nameLast = nameLast;

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
  if (!checkValidToken(token)) return { error: 'error' };

  const data = getData();

  // does all the error checking
  if (!isEmail(email)) {
    return { error: 'error' };
  }

  // finds person from the data.
  const authUserId: number = data.users.find(user => user.tokens.find(tok => tok === token)).authUserId;
  const user = data.users.find(i => i.authUserId === authUserId);
  const userIndex = data.users.findIndex(i => i.authUserId === authUserId);

  if (user === undefined) {
    return { error: 'error' };
  }

  // if given name is current name, do nothing.
  if (data.users[userIndex].email === email) {
    return {};
  }
  // if given email is somebody else's email, return error.
  if (data.users.find(i => i.email === email) !== undefined) {
    return { error: 'error' };
  }

  // changes users email.
  data.users[userIndex].email = email;

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
  if (!checkValidToken(token)) return { error: 'error' };
  const data = getData();

  // finds the user.
  const authUserId: number = data.users.find(user => user.tokens.find(tok => tok === token)).authUserId;
  const user = data.users.find(i => i.authUserId === authUserId);
  const userIndex = data.users.findIndex(i => i.authUserId === authUserId);

  // if given name is current name, do nothing.
  if (data.users[userIndex].handleStr === handleStr) {
    return {};
  }
  // checks that the handle isn't already used by another user.
  if (data.users.find(i => i.handleStr === handleStr) !== undefined) {
    return { error: 'error' };
  }
  // does error checking
  if (handleStr.length > 20 || handleStr.length < 3 || !(handleStr.match(/^[0-9a-zA-Z]+$/))) {
    return { error: 'error' };
  }
  if (user === undefined) {
    return { error: 'error' };
  }

  data.users[userIndex].handleStr = handleStr;

  setData(data);
  return {};
}

/*
Given a session token, output all public user details in the system

* Parameters :
    token: string

* Return values :
    array of user details, including:
    uId
    email
    name
    surname
    handleStr
*/

function usersAllV2(token: string) {
  if (!checkValidToken(token)) return { error: 'error' };
  const outputArray: { uId: number, email: string, nameFirst: string, nameLast: string, handleStr: string}[] = [];
  const data = getData();
  for (const user of data.users.filter(user => user.isActiveUser === true)) {
    outputArray.push(
      {
        uId: user.uId,
        email: user.email,
        nameFirst: user.nameFirst,
        nameLast: user.nameLast,
        handleStr: user.handleStr
      }
    );
  }
  return outputArray;
}

export { userProfileV3, userSetnameV1, userSetemailV1, userSethandlelV1, usersAllV2, user };
