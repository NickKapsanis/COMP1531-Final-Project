import { 
    channelDetailsV1, 
    channelJoinV1, 
    channelInviteV1, 
    channelMessagesV1 
} from './channel';

import { authRegisterV1 } from './auth'; 
import { channelsCreateV1, channelsListV1, channelsListallV1 } from './channels'
import { clearV1 } from './other'; 

describe('Testing channelMessagesV1', () => {
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