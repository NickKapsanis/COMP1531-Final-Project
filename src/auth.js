//authLogin V1
import {getData, setData} from './dataStore';
import isEmail from "validator/lib/isEmail";
import v4 from "uuid";

//given a registered users email and password, return their authUserId.
export function authLoginV1(email, password) {
    return 'email' + 'password';
}

//authRegisterV1
//given users first annd last name, email and password, create a new account and return new authUserId
//generate a handle for the user according to specifictions in interface.
export function authRegisterV1(email, password, nameFirst, nameLast) {
    const data = getData();
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
        return  {error : 'error'};
    }
    // This block creates a user handle according to specs in Interface V1
    let handle = nameFirst + nameLast
    handle = handle.replace(/\W/g, '');
    handle = handle.toLowerCase();
    if (handle.length > 20) {
        handle = handle.substring(0,20);
    }
    if (containsHandle(handle, data)) {
        let n = countHandles(handle, data);
        handle = handle + '$n'
    }
    // This block pushes all the above info into the datastore
    // It also assignes a uID and authUserId using UUID v4 to generate 
    // random Id's for both.
    let newUser = {
        'uId': v4(),
        'authUserId' : v4(),
        'nameFirst': nameFirst,
        'nameLast': nameLast,
        'email': email,
        'password' : password,
        'handleStr': handle,
        'channels': [],    
    }
    data.users.push(newUser);
    return handle;
}
// helper function that reads datastore
// takes in a string (not nessessarily a valid email)
// returns boolean true or false if that string matches with an 'email' : 
// key in datastore
export function containsEmail(emailToCheck, data) {
    const users = data.users;
    // checks if an element is equal to the emailToCheck
    const contains = (element) => element.email === emailToCheck;
    return users.some(contains);
}

function containsHandle(handleToCheck, data) {
    const users = data.users;
    // checks if an element is equal to the emailToCheck
    const contains = (element) => element.handleStr === handleToCheck;
    return users.some(contains);
}

function countHandles(handleToCheck, data) {
    const users = data.users;
    count = 0;
    for (let i of users) {
        if (i.handleStr === handleToCheck) {
            count = count + 1;
        }
    }
    return count;
}