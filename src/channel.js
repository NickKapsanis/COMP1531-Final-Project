// Stub for channelDetailsV1 function 
function channelDetailsV1(authUserId, channelId) { 
    return 'authUserId' + 'channelId'; 
}

// Stub for channelMessagesV1 function 
function channelMessagesV1(authUserId, channelId, start) {
    const store = getData(); 
    const channelsMemberOf = channelsListV1(authUserId); 

    if (store.channels.find(channel => channel.channelId === channelId) === undefined) {
        return { error: 'error' }; 
    } else if (channelsMemberOf.find(channel => channel.channelId === channelId) === undefined) {
        return { error: 'error' }; 
    } 

    const channelGiven = store.channels.find(channel => channel.channelId === channelId);

    let maxRecentIndex = false; 
    if (start > channelGiven.messages.length) {
        return { error: 'error' };
    } else if (start + 50 > channelGiven.messages.length) {
        maxRecentIndex = true; 
    }

    const messageDetails = {};     
    messageDetails.messages = channelGiven.messages.slice(start, start + 50); 

    if (maxRecentIndex === true) {
        messageDetails.end = -1;
    } else {
        messageDetails.end = start + 50;
    }
    
    return {
      messages: [],
      start: 0,
      end: -1,
    };
}

// Stub for channelJoinV1 function
function channelJoinV1(authUserId, channelId) {
    return ('authUserId' + 'channelId');
}

// Stub for channelInviteV1 function
function channelInviteV1(authUserId, channelId, uId) {
    return ('authUserId' + 'channelId' + 'uId');
}
