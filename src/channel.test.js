import { 
    channelDetailsV1, 
    channelJoinV1, 
    channelInviteV1, 
    channelMessagesV1 
} from './channel';

import { authRegisterV1 } from './auth'; 
import { channelsCreateV1, channelsListV1, channelsListallV1 } from './channels'; 
import { clearV1 } from './other';

describe('Testing channelDetailsV1', () => {
    let authUserId;
    let channelId;

    beforeEach(() => {
        authUserId = authRegisterV1('example123@email.com', 'password', 'John', 'Smith'); 
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

