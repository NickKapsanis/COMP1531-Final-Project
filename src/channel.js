import {getData, setData} from './dataStore';

// Stub for channelDetailsV1 function 
function channelDetailsV1(authUserId, channelId) { 
    return 'authUserId' + 'channelId'; 
}

// Stub for channelMessagesV1 function 
function channelMessagesV1(authUserId, channelId, start) { 
    return 'authUserId' + 'channelId' + 'start'; 
}

// Stub for channelJoinV1 function
function channelJoinV1(authUserId, channelId) {
    let data = getData;


    if (! channelID in data.channels) return {error:'error'};
    if (! authUserId in data.users) return {error:'error'};
    

    //setData(data);
    return {};
}

// Stub for channelInviteV1 function
function channelInviteV1(authUserId, channelId, uId) {
    return ('authUserId' + 'channelId' + 'uId');
}
