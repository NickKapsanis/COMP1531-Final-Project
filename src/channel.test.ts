import { channelDetailsV1, channelJoinV1, channelInviteV1, channelMessagesV1, addChannelOwnerV1, removeChannelOwnerV1 } from './channel';
import { authRegisterV1 } from './auth'; 
import { channelsCreateV1, channelsListV1, channelsListallV1 } from './channels'; 
import { clearV1, getUId } from './other';
import express from 'express';
import request from 'sync-request';

//TODO figure out whats happening with ports
// const PORT = ___


// Testing for channelDetailsV1
describe('Testing channelDetailsV1', () => {
    let authUserId;
    let channelId;

    beforeEach(() => {
        authUserId = authRegisterV1('example123@email.com', 'password', 'John', 'Smith').authUserId; 
        channelId = channelsCreateV1(authUserId, 'Channel 1', true).channelId;  
    });
    
    afterEach(() => {
        clearV1(); 
    }); 

    test('Case 1: channelId does not refer to valid channel', () => { 
        // Finding an invalid channelId to pass in 
        const allChannels = channelsListallV1(authUserId).channels;
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
        const memberOf = channelsListV1(authUserId).channels; 
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
        authUserId = authRegisterV1('example123@gmail.com', 'password', 'John', 'Smith').authUserId; 
        channelId = channelsCreateV1(authUserId, 'Channel 1', true).channelId; 
    });
    
    afterEach(() => {
        clearV1();
    });

    test('Case 1: channelId does not refer to valid channel', () => {
        // Finding an invalid channelId to pass in 
        const allChannels = channelsListallV1(authUserId).channels;
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
        const memberOf = channelsListV1(authUserId).channels; 
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


describe('Testing channelJoinV1 HTTP', () => {
    let jamesAuthId, rufusAuthId, testChannel;

    beforeEach(() => {
        jamesAuthId = authRegisterV1('james@gmail.com', 'testPassword123', 'James', 'Brown').authUserId;
        rufusAuthId = authRegisterV1('rufus@gmail.com', 'testPassword123', 'Rufus', 'Green').authUserId;
        testChannel = channelsCreateV1(jamesAuthId, 'testChannel1', true).channelId;
        const res = request(
            'POST',
            'http:/localhost:${PORT}/channel/join/v2',
//TODO Confused as to how to test what changes on the server if there is only a change to the backend?
        )
    });

    afterEach(() => {
        clearV1();
    });

    test('tests the case that authUserId is invalid', () => {
        let testChannel = channelsCreateV1(jamesAuthId, 'testChannel1', true).channelId;
        expect(channelJoinV1(-100, testChannel)).toStrictEqual({ error : 'error' });
    });

    test('tests the case that channelId is invalid', () => {
        expect(channelJoinV1(rufusAuthId, -100)).toStrictEqual({ error : 'error' });
    });

    test('tests the case that the user is already a member of the channel', () => {
        expect(channelJoinV1(jamesAuthId, testChannel)).toStrictEqual({ error : 'error' });
    });

    test('tests the case that the channel is private and the user is not a global owner', () => {
        let newChannel = channelsCreateV1(jamesAuthId, 'testChannel1', false).channelId;
        expect(channelJoinV1(rufusAuthId, newChannel)).toStrictEqual({ error : 'error' });
    });

    test('tests the case that the channel is private and the user is a global owner', () => {
        let newChannel = channelsCreateV1(rufusAuthId, 'testChannel1', false).channelId;
        expect(channelJoinV1(jamesAuthId, testChannel)).toStrictEqual({});
    });

    test('tests the case of a success', () => {
        expect(channelJoinV1(rufusAuthId, testChannel)).toStrictEqual({});
    });
});


////////////////////////////////////////////////
/////      Tests for channelInviteV1() 	   /////
////////////////////////////////////////////////

describe('Testing channelInviteV1', () => {
    let jamesAuthId, rufusAuthId, testChannel;

    beforeEach(() => {
        jamesAuthId = authRegisterV1('james@gmail.com', 'testPassword123', 'James', 'Brown').authUserId;
        rufusAuthId = authRegisterV1('rufus@gmail.com', 'testPassword123', 'Rufus', 'Green').authUserId;
        testChannel = channelsCreateV1(jamesAuthId, 'testChannel1', true).channelId;
        const res = request(
            'POST',
            'http:/localhost:${PORT}/channel/invite/v2',
//TODO Confused as to how to test what changes on the server if there is only a change to the backend?
        )
    });

    afterEach(() => {
        clearV1();
    });

    test('tests the case that user inviting does not exist', () => {
        expect(channelInviteV1('fakeUser', testChannel, getUId(rufusAuthId))).toStrictEqual({ error : 'error' });
    });

    test('tests the case user joining does not exist', () => {
        expect(channelInviteV1(jamesAuthId, testChannel, -100)).toStrictEqual({ error : 'error' });
    });

    test('tests the case channel does not exist', () => {
        expect(channelInviteV1(jamesAuthId, 'fakeChannel', getUId(rufusAuthId))).toStrictEqual({ error : 'error' });
    });

    test('tests the case channel uId refers to an existing channel member', () => {
        const alexAuthId = authRegisterV1('alex@gmail.com', 'bigBrainPassword', 'Alex', 'John').authUserId;
        let joinAlex = channelJoinV1(alexAuthId, testChannel);
        expect(channelInviteV1(jamesAuthId, testChannel, getUId(alexAuthId))).toStrictEqual({ error : 'error' });
    });

    test('tests the case that the user inviting is not a member of the channel', () => {
        const alexAuthId = authRegisterV1('alex@gmail.com', 'bigBrainPassword', 'Alex', 'Alex').authUserId;
        expect(channelInviteV1(alexAuthId, testChannel, getUId(rufusAuthId))).toStrictEqual({ error : 'error' });
    });

    test('tests the case that the user invites themself', () => {
        expect(channelInviteV1(rufusAuthId, testChannel, getUId(rufusAuthId))).toStrictEqual({ error : 'error' });
    });

    test('tests the successful case', () => {
        expect(channelInviteV1(jamesAuthId, testChannel, getUId(rufusAuthId))).toStrictEqual({});
    });
});

////////////////////////////////////////////////
/////     Tests for addChannelOwnerV1()    /////
////////////////////////////////////////////////

describe('Testing addChannelOwnerV1', () => {
    let jamesAuthId, rufusAuthId, testChannel;

    beforeEach(() => {
        jamesAuthId = authRegisterV1('james@gmail.com', 'testPassword123', 'James', 'Brown').authUserId;
        rufusAuthId = authRegisterV1('rufus@gmail.com', 'testPassword123', 'Rufus', 'Green').authUserId;
        testChannel = channelsCreateV1(jamesAuthId, 'testChannel1', true).channelId;
        const res = request(
            'POST',
            'http:/localhost:${PORT}/channel/addowner/v1',
//TODO Confused as to how to test what changes on the server if there is only a change to the backend?
        )
    });

    afterEach(() => {
        clearV1();
    });

    test('tests the case that user becoming owner refers to an invalid user', () => {
        expect(addChannelOwnerV1(jamesAuthId, testChannel, -100)).toStrictEqual({ error : 'error' });
    });

    test('tests the case channel does not exist', () => {
        expect(addChannelOwnerV1(jamesAuthId, -100, getUId(rufusAuthId))).toStrictEqual({ error : 'error' });
    });

    test('tests the user adding the new owner does not exist', () => {
        expect(addChannelOwnerV1(-100, testChannel, getUId(rufusAuthId))).toStrictEqual({ error : 'error' });
    });

    test('tests the case channel user becoming owner is not a member of the channel', () => {
        addChannelOwnerV1(jamesAuthId, testChannel, getUId(rufusAuthId));
        expect(addChannelOwnerV1(jamesAuthId, testChannel, getUId(rufusAuthId))).toStrictEqual({ error : 'error' });
    });

    test('tests the case that the user becoming owner is already an owner', () => {
        expect(addChannelOwnerV1(jamesAuthId, testChannel, getUId(rufusAuthId))).toStrictEqual({ error : 'error' });
    });

    test('the user adding the new owner is not a global owner or channel owner, but is in the channel', () => {
        const alexAuthId = authRegisterV1('alex@gmail.com', 'bigBrainPassword', 'Alex', 'Alex').authUserId;
        channelJoinV1(alexAuthId, testChannel);
        expect(addChannelOwnerV1(alexAuthId, testChannel, getUId(rufusAuthId))).toStrictEqual({ error : 'error' });
    });

    test('tests the successful case', () => {
        expect(addChannelOwnerV1(jamesAuthId, testChannel, getUId(rufusAuthId))).toStrictEqual({});
    });
});

////////////////////////////////////////////////
/////   Tests for removeChannelOwnerV1()   /////
////////////////////////////////////////////////

describe('Testing removeChannelOwnerV1', () => {
    let jamesAuthId, rufusAuthId, alexAuthId, testChannel;

    beforeEach(() => {
        jamesAuthId = authRegisterV1('james@gmail.com', 'testPassword123', 'James', 'Brown').authUserId;
        rufusAuthId = authRegisterV1('rufus@gmail.com', 'testPassword123', 'Rufus', 'Green').authUserId;
        alexAuthId = authRegisterV1('alex@gmail.com', 'bigBrainPassword', 'Alex', 'Alex').authUserId;
        testChannel = channelsCreateV1(jamesAuthId, 'testChannel1', true).channelId;
        channelJoinV1(alexAuthId, testChannel);
        addChannelOwnerV1(jamesAuthId, testChannel, alexAuthId);
        const res = request(
            'POST',
            'http:/localhost:${PORT}/channel/addowner/v1',
//TODO Confused as to how to test what changes on the server if there is only a change to the backend?
        )
    });

    afterEach(() => {
        clearV1();
    });

    test('tests the case that user being removed as owner refers to an invalid user', () => {
        expect(removeChannelOwnerV1(jamesAuthId, testChannel, -100)).toStrictEqual({ error : 'error' });
    });

    test('tests the case channel does not exist', () => {
        expect(removeChannelOwnerV1(jamesAuthId, -100, getUId(alexAuthId))).toStrictEqual({ error : 'error' });
    });

    test('tests the user removing the existing owner does not exist', () => {
        expect(removeChannelOwnerV1(-100, testChannel, getUId(alexAuthId))).toStrictEqual({ error : 'error' });
    });

    test('tests the case trying to remove user who is not an owner of the channel as owner', () => {
        channelJoinV1(rufusAuthId, testChannel);
        expect(removeChannelOwnerV1(jamesAuthId, testChannel, getUId(rufusAuthId))).toStrictEqual({ error : 'error' });
    });

    test('tests the case attempting to remove user who is the only channel owner', () => {
        removeChannelOwnerV1(jamesAuthId, testChannel, getUId(jamesAuthId));
        expect(removeChannelOwnerV1(jamesAuthId, testChannel, getUId(alexAuthId))).toStrictEqual({ error : 'error' });
    });

    test('the user attempting to remove the user as a channel owner lacks permissions (is not global owner)', () => {
        expect(removeChannelOwnerV1(alexAuthId, testChannel, getUId(jamesAuthId))).toStrictEqual({ error : 'error' });
    });

    test('tests the successful case', () => {
        expect(removeChannelOwnerV1(jamesAuthId, testChannel, getUId(alexAuthId))).toStrictEqual({});
    });
});

// assumption - global owners can add and remove themselves as channel owners