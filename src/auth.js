//authLogin V1
import {getData, setData} from './dataStore';
import isEmail from "validator/lib/isEmail";


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
        isEmail(email) || 
        password.length < 6 || 
        1 < nameFirst.length < 50 || 
        1 < nameLast.length < 50 ||
        !containsEmail(email)
        ) 
    {
        return {error : 'error'};
    }


    return 'email' + 'password' + 'nameFirst' + 'nameLast';
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