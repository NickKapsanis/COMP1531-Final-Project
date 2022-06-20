import { 
    channelDetailsV1, 
    channelJoinV1, 
    channelInviteV1, 
    channelMessagesV1 
} from './channel';

import { authRegisterV1 } from './auth'; 
import { clearV1 } from './other';

beforeEach(() => {
    const authUserId = authRegisterV1('example123@email.com', 'password', 'John', 'Smith'); 
    const channelId = channelsCreateV1(authUserId, 'Channel 1', true); 
});

afterEach(() => {
    clearV1();
}); 

describe('Testing channelMessagesV1', () => {
    test('Case 1: channelId does not refer to valid channel', () => {
        const invalidId = Math.floor(Math.random() * 100);
        const start = 0; 
        const messages = channelMessagesV1(authUserId, invalidId, start); 
        expect(messages).toStrictEqual({ error: 'error' });  
    });  

    test('Case 2: authorised user is not a member of channel', () => {
        const start = 0; 
        const messages = channelMessagesV1(authUserId, channelId, start); 
        expect(messages).toStrictEqual({ error: 'error' });  
    }); 

    test('Case 3: start is greater than total messages in channel', () => {
        const start = 1; 
        const messages = channelMessagesV1(authUserId, channelId, start); 
        expect(messages).toStrictEqual({ error: 'error' });  
    }); 

    test('Case 4: All valid arguments', () => {
        const messages = channelMessagesV1(authUserId, channelId);
        expect(messages).toStrictEqual({
            messages: [], 
            start: 0, 
            end: -1,
        })
    })
});