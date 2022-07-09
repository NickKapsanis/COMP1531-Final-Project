import { getData, setData } from './dataStore';
import isEmail from "validator/lib/isEmail";
import { user, message, channel, dataStoreType} from './dataStore'
import { uuidv4 } from 'uuid'



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
export function authLoginV1(email: string, password: string) {
    const data: dataStoreType = getData();
    if (!containsEmail(email, data)) {return {error: 'error'}};
    let user: user = data.users.find(u => u.email === email);
    if (user.password !== password) {return {error: 'error'}};
    return { authUserId: user.authUserId };
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
export function authRegisterV1(email: string, password: string, nameFirst: string, nameLast: string) {
    let data: dataStoreType = getData();
    if (
        !isEmail(email) || 
        password.length < 6 ||  
        nameFirst.length < 1 ||
        nameFirst.length > 50 ||
        nameLast.length < 1 ||
        nameLast.length > 50 ||
        containsEmail(email, data)
        ) 
    {
        return { error: 'error'

           // Testing code block
           /*
            '1st min' : nameFirst.length < 1 ,
            '1st max' : nameFirst.length > 50,
            '2nd min': nameLast.length < 1,
            '2nd max': nameLast.length > 50,
            'emailnotvalid': !isEmail(email),
            'hasemail': containsEmail(email, data),
            'passwordinvalid' : password.length < 6,
            'condition' : 'if any true error should return',
            'userCount' : data.users.length,
            'prevUserCount' : userCount,
            'newUserCount' : newUserCount,
            */
        }
        };
    
    // This block creates a user handle according to specs in Interface V1
    let handle = nameFirst + nameLast
    handle = handle.replace(/\W/g, '');
    handle = handle.toLowerCase();
    if (handle.length > 20) {
        handle = handle.substring(0,20);
    }
    //if (containsHandle(handle, data)) {
        let i = 0
        let incrementHandle = handle;
        while (containsHandle(handle, data)) {
           handle = incrementHandle + i;
           i++;
        }
    //checks if the user is the first user and sets global permissions
    let isGlobalOwner: user["isGlobalOwner"];
    if(data.users.length <= 0) {isGlobalOwner = 1}
    else{isGlobalOwner = 2};
   // }
    // This block pushes all the above info into the datastore
    // It also generates a userId and authUserId one greater than the current length of the datastore
    let newUser: user = {
        'uId': data.users.length + 1,
        'authUserId' : data.users.length + 1,
        'nameFirst': nameFirst,
        'nameLast': nameLast,
        'email': email,
        'password' : password,
        'handleStr': handle,
        'channels': [],
        'isGlobalOwner': isGlobalOwner,
    }
    data.users.push(newUser);
    setData(data);
    return { authUserId: newUser.authUserId };
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
countHandles counts the number of occurances of a particular handle in data

Arguments:
    handleToCheck (string)    - the handle to check for in data
    data (object)    - the dataStore imported with getData

Return Value:
    Returns count
*/
function countHandles(handleToCheck: string, data: dataStoreType) {
    const users = data.users;
    let count = 0;
    for (let i of users) {
        if (i.handleStr === handleToCheck) {
            count = count + 1;
        }
    }
    return count;
}
/*
assignToken assignes a new random token to a user storing it in data

Arguments:
    authUserId (number)    - the user to assign a token to

Return Value:
    Returns the new token
*/
function assignToken(authUserId: number) {
    const newToken = uuidv4();
    let data = getData();
    let userIndex = data.users.findIndex(user => user.authUserId === authUserId);
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
    let data = getData();
    let userIndex = data.users.findIndex(user => user.authUserId === authUserId);
    let tokenIndex = data.users[userIndex].tokens.findIndex(tok => tok === token);
    data.users[userIndex].tokens.splice(tokenIndex, 1);
    setData(data);
}