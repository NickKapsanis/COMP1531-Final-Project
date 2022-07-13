import request from 'sync-request';
import { getData } from './dataStore';
import { PORT, HOST } from './server';

const url = 'http://' + HOST + ':' + PORT;

describe('Testing dm/details/v1', () => {
    beforeEach(() => {
        request('DELETE', url + '/clear/v1');
    })
    // dmID is not valid
    test('dmId is not valid', () => {
        ///////////////////////////////set up the datastore/////////////////////////////////////////
        const user1 = registerUser('testingUser1@gmail.com', '1234567', 'FirstName1', 'LastName1');
        const badDmId = -100 // will work regardless as dm has not been created
        ////////////////////////////////////////////////////////////////////////////////////////////
        const res = request(
            'GET',
            url + '/dm/details/v1',
            {
            qs: {
              token: user1.token,
              dmId: badDmId
                }
            }
        );
        const bodyObj = JSON.parse(res.body as string);
        expect(res.statusCode).toBe(200);
        expect(bodyObj).toEqual({error: 'error'});
    })
    // dmID is valid but authUserId is not a member of the DM
    test('dmId is valid but authUserId is not a member', () => {
        ///////////////////////////////set up the datastore/////////////////////////////////////////
        const user1 = registerUser('testingUser1@gmail.com', '1234567', 'FirstName1', 'LastName1');
        const user2 = registerUser('testingUser2@gmail.com', '1234567', 'FirstName2', 'LastName2');
        const user3 = registerUser('testingUser3@gmail.com', '1234567', 'FirstName3', 'LastName3');
        const dm1_2 = startDm(user1.token, [giveUid(user2.authUserId)]);
        ////////////////////////////////////////////////////////////////////////////////////////////
        const res = request(
            'GET',
            url + '/dm/details/v1',
            {
            qs: {
              token: user3.token,
              dmId: dm1_2.dmId,
                }
            }
        );
        const bodyObj = JSON.parse(res.body as string);
        expect(res.statusCode).toBe(200);
        expect(bodyObj).toEqual({error: 'error'});
    })
    // token is not valid
    test('token is not valid', () => {
        ///////////////////////////////set up the datastore/////////////////////////////////////////
        const user1 = registerUser('testingUser1@gmail.com', '1234567', 'FirstName1', 'LastName1');
        const user2 = registerUser('testingUser2@gmail.com', '1234567', 'FirstName2', 'LastName2');
        const dm1_2 = startDm(user1.token, [giveUid(user2.authUserId)]);
        const badtoken = 'thisisalmostcertainlynotatoken';
        ////////////////////////////////////////////////////////////////////////////////////////////
        const res = request(
            'GET',
            url + '/dm/details/v1',
            {
            qs: {
              token: badtoken,
              dmId: dm1_2.dmId,
                }
            }
        );
        const bodyObj = JSON.parse(res.body as string);
        expect(res.statusCode).toBe(200);
        expect(bodyObj).toEqual({error: 'error'});
    })
     // all is correct
     test('testing sucessful call of non owner', () => {
        ///////////////////////////////set up the datastore/////////////////////////////////////////
        const user1 = registerUser('testingUser1@gmail.com', '1234567', 'FirstName1', 'LastName1');
        const user2 = registerUser('testingUser2@gmail.com', '1234567', 'FirstName2', 'LastName2');
        const dm1_2 = startDm(user1.token, [giveUid(user2.authUserId)]);
        ////////////////////////////////////////////////////////////////////////////////////////////
        const res = request(
            'GET',
            url + '/dm/details/v1',
            {
            qs: {
              token: user2.token,
              dmId: dm1_2.dmId,
                }
            }
        );
        const bodyObj = JSON.parse(res.body as string);
        expect(res.statusCode).toBe(200);
        expect(bodyObj).toEqual(
            expect.objectContaining({
                name: expect.any(String),
                members : expect.any(Array),
            })
        );
    })
     // all is correct
     test('testing sucessful call of owner', () => {
        ///////////////////////////////set up the datastore/////////////////////////////////////////
        const user1 = registerUser('testingUser1@gmail.com', '1234567', 'FirstName1', 'LastName1');
        const user2 = registerUser('testingUser2@gmail.com', '1234567', 'FirstName2', 'LastName2');
        const dm1_2 = startDm(user1.token, [giveUid(user2.authUserId)]);
        ////////////////////////////////////////////////////////////////////////////////////////////
        const res = request(
            'GET',
            url + '/dm/details/v1',
            {
            qs: {
              token: user1.token,
              dmId: dm1_2.dmId,
                }
            }
        );
        const bodyObj = JSON.parse(res.body as string);
        expect(res.statusCode).toBe(200);
        expect(bodyObj).toEqual(
            expect.objectContaining({
                name: expect.any(String),
                members : expect.any(Array),
            })
        );
    })
});

// testing helper function, registers a user by making an http call. returns the body object of the response
function registerUser(email: string, password: string, nameFirst: string, nameLast: string) {
    const res = request(
        'POST',
        url + '/auth/register/v2',
        {
            body: JSON.stringify({
                email: email,
                password: password,
                nameFirst: nameFirst,
                nameLast: nameLast,
            }),
            headers: {
                'Content-type' : 'application/json',
            },
        }
    );
    return JSON.parse(String(res.getBody())); 
};

// testing helper function, creates a dm  by making an http call. retunrs the body object of the response
function startDm(token: string, uIds: number[]) {
    const res = request(
        'POST',
        url + '/dm/create/v1',
        {
            body: JSON.stringify({
                token: token,
                uIds: uIds,
            }),
            headers: {
                'Content-type' : 'application/json',
            },
        }
    );
    return JSON.parse(String(res.getBody()));
};

//helper function returns userId of authUserId returns -1 if the authUserId is not in the datastore.

function giveUid(authUserId: number) {
    const userId = getData().users?.find(user => user.authUserId === authUserId)?.uId
    if (userId === undefined) return -1;
    else return userId;
};