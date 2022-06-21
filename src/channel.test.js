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

describe('Testing channelDetailsV1', () => {
    test('Case 1: channelId does not refer to valid channel', () => {
        const invalidId = Math.floor(Math.random() * 100);
        const details = channelDetailsV1(authUserId, invalidId); 
        expect(details).toStrictEqual({ error: 'error' });  
    });  

    test('Case 2: authorised user is not a member of channel', () => {
        const invalidId = Math.floor(Math.random() * 100);
        const details = channelDetailsV1(invalidId, channelId); 
        expect(details).toStrictEqual({ error: 'error' });  
    }); 

    test('Case 3: Deals with all valid arguments', () => {
        const details = channelDetailsV1(authUserId, channelId);
        expect(details).toStrictEqual({
            name: 'Channel 1', 
            isPublic: true, 
            ownerMembers: [
                {
                    
                }
            ], 
            allMembers: [

            ], 
        })
    })
}); 

