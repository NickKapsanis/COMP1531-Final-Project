import {getData, setData} from './dataStore'; 
import {channelsListV1, channelsListallV1 } from './channels.js'

// Stub for channelDetailsV1 function 
function channelDetailsV1(authUserId, channelId) {
    const store = getData(); 
    const channelsMemberOf = channelsListV1(authUserId); 

    if (store.channels.find(channel => channel.channelId === channelId) === undefined) {
        return { error: 'error' }; 
        
    } else if (channelsMemberOf.find(channel => channel.channelId === channelId) === undefined) {
        return { error: 'error' }; 
    } 
    
    const channelDetails = store.channels.find(channel => channel.channelId === channelId); 

    return {
        name: channelDetails.name, 
        isPublic: channelDetails.isPublic,
        ownerMembers: [],
        allMembers: channelDetails.users,
    };
}

console.log(channelDetailsV1(72, 30));

// Stub for channelMessagesV1 function 
function channelMessagesV1(authUserId, channelId, start) { 
    return 'authUserId' + 'channelId' + 'start'; 
}

// Stub for channelJoinV1 function
function channelJoinV1(authUserId, channelId) {
    return ('authUserId' + 'channelId');
}

// Stub for channelInviteV1 function
function channelInviteV1(authUserId, channelId, uId) {
    return ('authUserId' + 'channelId' + 'uId');
}

export { channelDetailsV1, channelJoinV1, channelInviteV1, channelMessagesV1 };
