import { channelDetailsV1, channelJoinV1, channelInviteV1, channelMessagesV1 } from './channel';
import { clearV1 } from './other';

beforeEach(() => {
    const authUserId = authLogin('example123@email.com', 'password'); 
    const channelId = channelsCreateV1(authUserId, 'John', true); 
});

afterEach(() => {
    clearV1();
}); 

describe('Testing channelMessagesV1', () => {
    test('channelId does not refer to valid channel', () => {
        const invalidId = Math.floor(Math.random() * 100);
        const start = 0; 
        const messages = channelMessagesV1(authUserId, invalidId, start); 
        expect(messages).toStrictEqual({ error: 'error' });  
    });  

    test('authorised user is not a member of channel', () => {
        const start = 0; 
        const messages = channelMessagesV1(authUserId, channelId, start); 
        expect(messages).toStrictEqual({ error: 'error' });  
    }); 

    test('start is greater than total messages in channel', () => {

        const messages = channelMessagesV1(authUserId, channelId, start); 
        expect(messages).toStrictEqual({ error: 'error' });  
    }); 

    test('Deals with all valid arguments', () => {
        const details = channelMessagesV1(authUserId, channelId);
        expect(messages).toStrictEqual({
            messages: [], 
            start: 0, 
            end: -1,
        })
    })
});