import { getData, setData } from './dataStore';
import isEmail from 'validator/lib/isEmail';
import { user, dataStoreType } from './dataStore';
import { v4 as uuidv4 } from 'uuid';
import HTTPError from 'http-errors';

export { checkValidToken };

// const FORBID = 403;
const BAD_REQ = 400;
// const OKAY = 200;

/*
authLoginV1
Given a registered users email and password, return their authUserId.

Arguments:
    email (string)      - email of the user to check for
    password (string)       - password of the user to check for

Return Value:
    Returns { error : 'error' } on
        -email is not registered to any user in data
        -password does not match that of the user with 'email'

    Returns {authUserId: authUserId} on sucessfull login, email and password both exist and are values of the same "User"
*/
export function authLoginV3(email: string, password: string) {
  const data: dataStoreType = getData();
  if (!containsEmail(email, data)) { // email does not belong to a user
    throw HTTPError(BAD_REQ, 'Incorrect Email');
  }
  const user: user = data.users.find(u => u.email === email);
  if (user.password !== password) {
    throw HTTPError(BAD_REQ, 'Incorrect Password');
  }
  const newtoken = assignToken(user.authUserId);
  return {
    token: newtoken,
    authUserId: user.authUserId
  };
}

/*
authLogoutV1
Given an active token, log out the user, removing their token

Arguments:
    token (string)      - token of the session to logout

Return Value:
    Returns {} on sucsess
    does not have an error return,
    interface specifies only active tokens will be input.
*/
export function authLogoutV2(token: string) {
  const data = getData();
  const authUserId = data.users.find(user => user.tokens.find(tok => tok === token)).authUserId;
  removeToken(authUserId, token);
  return {};
}

/*
authRegisterV1
Given a new user's first and last name, email and a new password, create a unique uId and authId.
Create a 'handle/username' by concantenating first and last name, forcing lowercase-alphanumeric and length <= 20 characters
if the handle exists, add a number to the end starting at 0.

Arguments:
    nameFirst (string)    - first name of the user to register
    nameLast (string)    - last name of the user to register
    email (string)      - email of the user to register
    password (string)       - password of the user to register

Return Value:
    Returns { error : 'error' } on
        -length of nameFirst is >50 or <1
        -length of nameLast is >50 or <1
        -email is not a valid email
        -length of password is < 6
        -the email is already registered

    Returns {authUserId: authUserId} on otherwise
*/
export function authRegisterV3(email: string, password: string, nameFirst: string, nameLast: string) {
  const data: dataStoreType = getData();
  /*
  if (
    !isEmail(email) ||
        password.length < 6 ||
        nameFirst.length < 1 ||
        nameFirst.length > 50 ||
        nameLast.length < 1 ||
        nameLast.length > 50 ||
        containsEmail(email, data)
  ) {
    return { error: 'error' };
  }
  */
  if (!isEmail(email)) { // email entered is not validated as an email by 'validator'
    throw HTTPError(BAD_REQ, 'email entered is not a valid email');
  }
  if (password.length < 6) { // password is too short
    throw HTTPError(BAD_REQ, 'password is too short - less than 6 characters');
  }
  if (nameFirst.length < 1 || nameFirst.length > 50) { // first name must be >1 and < 50 characters
    throw HTTPError(BAD_REQ, 'first name is not within range');
  }
  if (nameLast.length < 1 || nameLast.length > 50) { // last name must be >1 and <50 characters
    throw HTTPError(BAD_REQ, 'last name is not within range');
  }
  if (containsEmail(email, data)) { // email is already contained in the dataStore registred to another user
    throw HTTPError(BAD_REQ, 'email is already in use');
  }

  // This block creates a user handle according to specs in Interface V1
  let handle = nameFirst + nameLast;
  handle = handle.replace(/\W/g, '');
  handle = handle.toLowerCase();
  if (handle.length > 20) {
    handle = handle.substring(0, 20);
  }
  let i = 0;
  const incrementHandle = handle;
  while (containsHandle(handle, data)) {
    handle = incrementHandle + i;
    i++;
  }
  // checks if the user is the first user and sets global permissions
  let isGlobalOwner: user['isGlobalOwner'];
  if (data.users.length <= 0) { isGlobalOwner = 1; } else { isGlobalOwner = 2; }
  // }
  // This block pushes all the above info into the datastore
  // It also generates a userId and authUserId one greater than the current length of the datastore
  const newUid = data.users.length + 1;
  const newAuthUserId = data.users.length + 1;
  const newUser: user = {
    uId: newUid,
    authUserId: newAuthUserId,
    tokens: [],
    nameFirst: nameFirst,
    nameLast: nameLast,
    email: email,
    password: password,
    handleStr: handle,
    channels: [],
    dms: [],
    isGlobalOwner: isGlobalOwner,
  };
  // put the new user into data and set the data.
  data.users.push(newUser);
  setData(data);

  // Analytics
  const time = Date.now();
  // userStats
  const userStats = {
    uId: newUid,
    channelsJoined: [{numChannelsJoined: 0, timeStamp: time}],
    dmsJoined: [{numDmsJoined: 0, timeStamp: time}], 
    messagesSent: [{numMessagesSent: 0, timeStamp: time}], 
    involvementRate: 0
  }
  data.userStats.push(userStats);

  // Workspace Stats
  if (isGlobalOwner == 1) {
    const workspaceStats = {
      channelsExist: [{numChannelsExist: 0, timeStamp: time}], 
      dmsExist: [{numDmsExist: 0, timeStamp: time}],
      messagesExist: [{numMessagesExist: 0, timeStamp: time}],
      utilizationRate: 0
    }
    data.workspaceStats.push(workspaceStats);
  }

  setData(data);
  // now log in the new user, and return token and authuserId as per authLogin
  return authLoginV3(newUser.email, newUser.password);
}
/*
containsEmail takes the datastore object and an email to check if the email is already registred to a user.

Arguments:
    emailToCheck (string)    - the email to check the datastore for
    data (object)    - the datastore imported with getData

Return Value:
    Returns True if emailToCheck exists with a registred user
    Returns False if emailToCheck does not exist with a registred user
*/
export function containsEmail(emailToCheck: string, data: dataStoreType) {
  const users: user[] = data.users;
  // checks if an element is equal to the emailToCheck
  const contains = (element: user) => element.email === emailToCheck;
  return users.some(contains);
}
/*
containsHandle takes the datastore object and a handle to check if the handle is already registred to a user.

Arguments:
    handle (string)    - the handle to check the datastore for
    data (object)    - the datastore imported with getData

Return Value:
    Returns True if handle exists with a registred user
    Returns False if handle does not exist with a registred user
*/
function containsHandle(handleToCheck: string, data: dataStoreType) {
  const users: user[] = data.users;
  // checks if an element is equal to the handleToCheck
  const contains = (element: user) => element.handleStr === handleToCheck;
  return users.some(contains);
}
/*
assignToken assignes a new random token to a user that must already
exist in dataStore, storing it in data.

Arguments:
    authUserId (number)    - the user to assign a token to

Return Value:
    Returns the new token
*/
function assignToken(authUserId: number) {
  const newToken = uuidv4();
  const data = getData();
  const userIndex = data.users.findIndex(user => user.authUserId === authUserId);
  data.users[userIndex].tokens.push(newToken);
  setData(data);
  return newToken;
}
/*
removeToken removes a given token from a user storing it in data

Arguments:
    authUserId (number)    - the user to remove a token from
    token (string) - the token to remove from the user

Return Value:
    null
*/
function removeToken(authUserId: number, token: string) {
  const data = getData();
  const userIndex = data.users.findIndex(user => user.authUserId === authUserId);
  const tokenIndex = data.users[userIndex].tokens.findIndex(tok => tok === token);
  data.users[userIndex].tokens.splice(tokenIndex, 1);
  setData(data);
}
/*
checkValidToken checks if a token exists and is valid

Arguments:
    token (string) - the token to check

Return Value:
    boolean
*/
function checkValidToken(token: string) {
  const data = getData();
  if (data.users.find(user => user.tokens.find(tok => tok === token)) !== undefined) {
    return true;
  } else {
    return false;
  }
}
