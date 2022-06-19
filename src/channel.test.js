import { channelDetailsV1, channelJoinV1, channelInviteV1, channelMessagesV1 } from './channel';
import { clearV1 } from './other';

beforeEach(() => {
    const authUserId = authLogin('example123@email.com', 'password'); 
    const channelId = channelsCreateV1(authUserId, 'John', true); 
});

afterEach(() => {
    clearV1();
}); 

describe('Testing channelDetailsV1', () => {
    test('channelId does not refer to valid channel', () => {
        const invalidId = Math.floor(Math.random() * 100);
        const details = channelDetailsV1(authUserId, invalidId); 
        expect(details).toStrictEqual({ error: 'error' });  
    });  

    test('authorised user is not a member of channel', () => {
        const invalidId = Math.floor(Math.random() * 100);
        const details = channelDetailsV1(invalidId, channelId); 
        expect(details).toStrictEqual({ error: 'error' });  
    }); 

    test('Deals with all valid arguments', () => {
        const details = channelDetailsV1(authUserId, channelId);
        expect(details).toStrictEqual({
            name: 'John', 
            isPublic: true, 
            ownerMembers: [
                
            ], 
            allMembers: [

            ], 
        })
    })
}); 

