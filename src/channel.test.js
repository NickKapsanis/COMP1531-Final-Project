import { channelDetailsV1, channelJoinV1, channelInviteV1, channelMessagesV1 } from './channel';
import { authRegisterV1 } from './auth'; 
import { channelsCreateV1, channelsListV1, channelsListallV1 } from './channels'; 
import { clearV1, getUId } from './other';

// Testing for channelDetailsV1
describe('Testing channelDetailsV1', () => {
    let authUserId;
    let channelId;

    beforeEach(() => {
        authUserId = authRegisterV1('example123@gmail.com', 'password', 'John', 'Smith'); 
        channelId = channelsCreateV1(authUserId, 'Channel 1', true);  
    });
    
    afterEach(() => {
        clearV1(); 
    }); 

    test('Case 1: channelId does not refer to valid channel', () => { 
        // Finding an invalid channelId to pass in 
        const allChannels = channelsListallV1(authUserId);
        let invalidId = 199;  
        for (const i in allChannels) {
            if (invalidId === allChannels[i].channelId) {
                invalidId = invalidId + 100; 
            }
        }

        const details = channelDetailsV1(authUserId, invalidId); 
        expect(details).toStrictEqual({ error: 'error' });  
    });  

    test('Case 2: authorised user is not a member of channel', () => {
        const memberOf = channelsListV1(authUserId); 
        let notMemberId = 199; 
        for (const i in memberOf) {
            if (notMemberId === memberOf[i].channelId) {
                notMemberId = notMemberId + 100; 
            }
        }
        
        const details = channelDetailsV1(authUserId, notMemberId); 
        expect(details).toStrictEqual({ error: 'error' });  
    }); 

    test('Case 3: Deals with all valid arguments', () => {
        const details = channelDetailsV1(authUserId, channelId);
        expect(details).toStrictEqual({
            name: 'Channel 1', 
            isPublic: true, 
            ownerMembers: expect.any(Object), 
            allMembers: expect.any(Object),  
        })
    });

    test('Case 4: Deals with invalid/undefined inputs', () => {
        const details = channelDetailsV1('', '');
        expect(details).toStrictEqual({ error: 'error' });
    }); 
}); 


// Tests for channelMessagesV1 
describe('Testing channelMessagesV1', () => {
    let authUserId; 
    let channelId; 

    beforeEach(() => {
        authUserId = authRegisterV1('example123@gmail.com', 'password', 'John', 'Smith'); 
        channelId = channelsCreateV1(authUserId, 'Channel 1', true); 
    });
    
    afterEach(() => {
        clearV1();
    });

    test('Case 1: channelId does not refer to valid channel', () => {
        // Finding an invalid channelId to pass in 
        const allChannels = channelsListallV1(authUserId);
        let invalidId = 199;  
        for (const i in allChannels) {
            if (invalidId === allChannels[i].channelId) {
                invalidId = invalidId + 100; 
            }
        }

        const start = 0; 
        const messages = channelMessagesV1(authUserId, invalidId, start); 
        expect(messages).toStrictEqual({ error: 'error' });  
    });  

    test('Case 2: authorised user is not a member of channel', () => {
        const memberOf = channelsListV1(authUserId); 
        let notMemberId = 199; 
        for (const i in memberOf) {
            if (notMemberId === memberOf[i].channelId) {
                notMemberId = notMemberId + 100; 
            }
        }

        const start = 0; 
        const messages = channelMessagesV1(authUserId, notMemberId, start); 
        expect(messages).toStrictEqual({ error: 'error' });  
    }); 

    test('Case 3: start is greater than total messages in channel', () => {
        const start = 1; 
        const messages = channelMessagesV1(authUserId, channelId, start); 
        expect(messages).toStrictEqual({ error: 'error' });  
    }); 

    test('Case 4: All valid arguments', () => {
        const start = 0; 
        const messages = channelMessagesV1(authUserId, channelId, start);
        expect(messages).toStrictEqual({
            messages: [], 
            start: 0, 
            end: -1,
        })
    })

    test('Case 5: Deals with invalid/undefined inputs', () => {
        const messages = channelMessagesV1('', '', '');
        expect(messages).toStrictEqual({ error: 'error' });
    }); 
});

////////////////////////////////////////////////
/////      Tests for channelJoinV1() 	   /////
////////////////////////////////////////////////

test('tests the case that authUserId is invalid', () => {
    clearV1();
    const jamesAuthId = authRegisterV1('james@gmail.com', 'testPassword123', 'James', 'Brown');
    const rufusAuthId = authRegisterV1('rufus@gmail.com', 'testPassword123', 'Rufus', 'Greem');
    let testCreatedChannel = channelsCreateV1(jamesAuthId, 'testChannel1', true);
    let output = channelJoinV1('wrongUId', testCreatedChannel);
    expect(output).toStrictEqual({ error : 'error' });
});

test('tests the case that channelId is invalid', () => {
    clearV1();
    const jamesAuthId = authRegisterV1('james@gmail.com', 'testPassword123', 'James', 'Brown');
    const rufusAuthId = authRegisterV1('rufus@gmail.com', 'testPassword123', 'Rufus', 'Green');
    let testCreatedChannel = channelsCreateV1(jamesAuthId, 'testChannel1', true);
    let output = channelJoinV1(rufusAuthId, 'wrongChannel');
    expect(output).toStrictEqual({ error : 'error' });
});

test('tests the case that the user is already a member of the channel', () => {
    clearV1();
    const jamesAuthId = authRegisterV1('james@gmail.com', 'testPassword123', 'James', 'Brown');
    let testCreatedChannel = channelsCreateV1(jamesAuthId, 'testChannel1', true);
    let output = channelJoinV1(jamesAuthId, testCreatedChannel);
    expect(output).toStrictEqual({ error : 'error' });
});

test('tests the case that the channel is private and the user is not a global owner', () => {
    clearV1();
    const jamesAuthId = authRegisterV1('james@gmail.com', 'testPassword123', 'James', 'Brown');
    const rufusAuthId = authRegisterV1('rufus@gmail.com', 'testPassword123', 'Rufus', 'Green');
    let testCreatedChannel = channelsCreateV1(jamesAuthId, 'testChannel1', false);
    let output = channelJoinV1(rufusAuthId, testCreatedChannel);
    expect(output).toStrictEqual({ error : 'error' });
});

test('tests the case that the channel is private and the user is a global owner', () => {
    clearV1();
    const jamesAuthId = authRegisterV1('james@gmail.com', 'testPassword123', 'James', 'Brown');
    const rufusAuthId = authRegisterV1('rufus@gmail.com', 'testPassword123', 'Rufus', 'Green');
    let testCreatedChannel = channelsCreateV1(rufusAuthId, 'testChannel1', false);
    let output = channelJoinV1(jamesAuthId, testCreatedChannel);
    expect(output).toStrictEqual({});
});

test('tests the case of a success', () => {
    clearV1();
    const jamesAuthId = authRegisterV1('james@gmail.com', 'testPassword123', 'James', 'Brown');
    const rufusAuthId = authRegisterV1('rufus@gmail.com', 'testPassword123', 'Rufus', 'Green');
    const alexAuthId = authRegisterV1('alex@gmail.com', 'bigBrainPassword', 'Alex', 'John');
    let testCreatedChannel = channelsCreateV1(jamesAuthId, 'testChannel1', true);
    let output1 = channelJoinV1(rufusAuthId, testCreatedChannel);
    let output2 = channelJoinV1(alexAuthId, testCreatedChannel);
    expect(output1).toStrictEqual({});
    expect(output2).toStrictEqual({});
});

////////////////////////////////////////////////
/////      Tests for channelInviteV1() 	   /////
////////////////////////////////////////////////

test('tests the case that user inviting does not exist', () => {
    clearV1();
    const jamesAuthId = authRegisterV1('james@gmail.com', 'testPassword123', 'James', 'Brown');
    const rufusAuthId = authRegisterV1('rufus@gmail.com', 'testPassword123', 'Rufus', 'Green');
    let testCreatedChannel = channelsCreateV1(jamesAuthId, 'testChannel1', true);
    let output = channelInviteV1('fakeUser', testCreatedChannel, getUId(rufusAuthId));
    expect(output).toStrictEqual({ error : 'error' });
});

test('tests the case user joining does not exist', () => {
    clearV1();
    const jamesAuthId = authRegisterV1('james@gmail.com', 'testPassword123', 'James', 'Brown');
    const rufusAuthId = authRegisterV1('rufus@gmail.com', 'testPassword123', 'Rufus', 'Green');
    let testCreatedChannel = channelsCreateV1(jamesAuthId, 'testChannel1', true);
    let output = channelInviteV1(jamesAuthId, testCreatedChannel, 'fakeUId');
    expect(output).toStrictEqual({ error : 'error' });
});

test('tests the case channel does not exist', () => {
    clearV1();
    const jamesAuthId = authRegisterV1('james@gmail.com', 'testPassword123', 'James', 'Brown');
    const rufusAuthId = authRegisterV1('rufus@gmail.com', 'testPassword123', 'Rufus', 'Green');
    let testCreatedChannel = channelsCreateV1(jamesAuthId, 'testChannel1', true);
    let output = channelInviteV1(jamesAuthId, 'fakeChannel', getUId(rufusAuthId));
    expect(output).toStrictEqual({ error : 'error' });
});

test('tests the case channel uId refers to an existing channel member', () => {
    clearV1();
    const jamesAuthId = authRegisterV1('james@gmail.com', 'testPassword123', 'James', 'Brown');
    const rufusAuthId = authRegisterV1('rufus@gmail.com', 'testPassword123', 'Rufus', 'Green');
    const alexAuthId = authRegisterV1('alex@gmail.com', 'bigBrainPassword', 'Alex', 'John');
    let testCreatedChannel = channelsCreateV1(jamesAuthId, 'testChannel1', true);
    let joinAlex = channelJoinV1(alexAuthId, testCreatedChannel);
    let output = channelInviteV1(jamesAuthId, testCreatedChannel, getUId(alexAuthId));
    expect(output).toStrictEqual({ error : 'error' });
});

test('tests the case that the user inviting is not a member of the channel', () => {
    clearV1();
    const jamesAuthId = authRegisterV1('james@gmail.com', 'testPassword123', 'James', 'Brown');
    const rufusAuthId = authRegisterV1('rufus@gmail.com', 'testPassword123', 'Rufus', 'Green');
    const alexAuthId = authRegisterV1('alex@gmail.com', 'bigBrainPassword', 'Alex', 'Alex');
    let testCreatedChannel = channelsCreateV1(jamesAuthId, 'testChannel1', true);
    let output = channelInviteV1(alexAuthId, testCreatedChannel, getUId(rufusAuthId));
    expect(output).toStrictEqual({ error : 'error' });
});

test('tests the case that the user invites themself', () => {
    clearV1();
    const jamesAuthId = authRegisterV1('james@gmail.com', 'testPassword123', 'James', 'Brown');
    const rufusAuthId = authRegisterV1('rufus@gmail.com', 'testPassword123', 'Rufus', 'Green');
    let testCreatedChannel = channelsCreateV1(jamesAuthId, 'testChannel1', true);
    let output = channelInviteV1(rufusAuthId, testCreatedChannel, getUId(rufusAuthId));
    expect(output).toStrictEqual({ error : 'error' });
});

test('tests the successful case', () => {
    clearV1();
    const jamesAuthId = authRegisterV1('james@gmail.com', 'testPassword123', 'James', 'Brown');
    const rufusAuthId = authRegisterV1('rufus@gmail.com', 'testPassword123', 'Rufus', 'Green');
    let testCreatedChannel = channelsCreateV1(jamesAuthId, 'testChannel1', true);
    let output = channelInviteV1(jamesAuthId, testCreatedChannel, getUId(rufusAuthId));
    expect(output).toStrictEqual({});
});
