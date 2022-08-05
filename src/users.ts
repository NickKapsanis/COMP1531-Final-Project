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
  const user1 = data.users.find(user => user.tokens.find(t => t === token));
  const user2 = data.users.find(i => i.uId === uId);

  // checking if either uId or token are invalid
  if (user1 === undefined) { throw HTTPError(FORBIDDEN, 'token passed in is invalid'); }
  if (user2 === undefined) { throw HTTPError(BAD_REQUEST, 'uId does not refer to a valid user'); }

  // constructing output
  const user2Info: user = {
    uId: user2.uId,
    email: user2.email,
    nameFirst: user2.nameFirst,
    nameLast: user2.nameLast,
    handleStr: user2.handleStr
  };

  return {
    user: user2Info
  };
}

/*
Given an authUserId, firstname and lastname, the function userSetnameV2
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
function userSetnameV2(token: string, nameFirst: string, nameLast: string) {
  if (!checkValidToken(token)) throw HTTPError(FORBIDDEN, 'invalid token.');

  const data = getData();

  // does all the error checking
  if (nameFirst.length > 50 || nameFirst.length < 1 ||
    nameLast.length > 50 || nameLast.length < 1) {
    throw HTTPError(BAD_REQUEST, 'bad first or last name.');
  }

  // finds person from the data.
  const authUserId: number = data.users.find(user => user.tokens.find(tok => tok === token)).authUserId;
  // const user = data.users.find(i => i.authUserId === authUserId);
  const userIndex = data.users.findIndex(i => i.authUserId === authUserId);

  // seems unnecessary
  /* if (user === undefined) {
    return { error: 'error' };
  } */

  // changes users first and last names.
  data.users[userIndex].nameFirst = nameFirst;
  data.users[userIndex].nameLast = nameLast;

  setData(data);
  return {};
}

/*
Given an authUserId, and email, the function userSetnameV2
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
function userSetemailV2(token: string, email: string) {
  if (!checkValidToken(token)) throw HTTPError(FORBIDDEN, 'invalid token.');

  const data = getData();

  // does all the error checking
  if (!isEmail(email)) {
    throw HTTPError(BAD_REQUEST, 'is not an email address.');
  }

  // finds person from the data.
  const authUserId: number = data.users.find(user => user.tokens.find(tok => tok === token)).authUserId;
  // const user = data.users.find(i => i.authUserId === authUserId);
  const userIndex = data.users.findIndex(i => i.authUserId === authUserId);

  // seems unnecessary
  /* if (user === undefined) {
    return { error: 'error' };
  } */

  // if given name is current name, do nothing.
  if (data.users[userIndex].email === email) {
    return {};
  }
  // if given email is somebody else's email, return error.
  if (data.users.find(i => i.email === email) !== undefined) {
    throw HTTPError(BAD_REQUEST, 'this is somebody elses email.');
  }

  // changes users email.
  data.users[userIndex].email = email;

  setData(data);
  return {};
}

/*
Given an authUserId, and handle, the function userSetnameV2
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
function userSethandleV2(token: string, handleStr: string) {
  if (!checkValidToken(token)) throw HTTPError(FORBIDDEN, 'invalid token.');
  const data = getData();

  // finds the user.
  const authUserId: number = data.users.find(user => user.tokens.find(tok => tok === token)).authUserId;
  // const user = data.users.find(i => i.authUserId === authUserId);
  const userIndex = data.users.findIndex(i => i.authUserId === authUserId);

  // if given name is current name, do nothing.
  if (data.users[userIndex].handleStr === handleStr) {
    return {};
  }
  // checks that the handle isn't already used by another user.
  if (data.users.find(i => i.handleStr === handleStr) !== undefined) {
    throw HTTPError(BAD_REQUEST, 'handle being used by another user.');
  }
  // does error checking
  if (handleStr.length > 20 || handleStr.length < 3 || !(handleStr.match(/^[0-9a-zA-Z]+$/))) {
    throw HTTPError(BAD_REQUEST, 'invalid handle name to change to.');
  }
  // seems unnecessary
  /* if (user === undefined) {
    return { error: 'error' };
  } */

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
  for (const user of data.users) {
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

export { userProfileV3, userSetnameV2, userSetemailV2, userSethandleV2, usersAllV2, user };
