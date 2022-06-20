import {getData, setData} from './dataStore.js'; 
import {channelsListV1, channelsListallV1 } from './channels.js'

// Stub for channelDetailsV1 function 
function channelDetailsV1(authUserId, channelId) { 
    return 'authUserId' + 'channelId'; 
}

/**
 * Returns up to 50 of user's most recent messages in given channel 
 * and a specified range. 
 * 
 * Arguments: 
 *      authUserId: integer     The user's unique identifier
 *      channelId:  integer     The channel's unique identifier 
 *      start:      integer     The left-bound of range 
 *
 * Returns:
 *      {error: 'error'}     object     Error message when given invalid input
 *      messageDetails       object     Object containing {messages, start, end}, 
 *                                      where messages is an array of objects, 
 *                                      start and end are integers. 
 */ 
function channelMessagesV1(authUserId, channelId, start) {
    const store = getData(); 
    const channelsMemberOf = channelsListV1(authUserId);  

    // Checking validity of 'channelId' input 
    if (store.channels.find(channel => channel.channelId === channelId) === undefined) {
        return { error: 'error' }; 
    } else if (channelsMemberOf.find(channel => channel.channelId === channelId) === undefined) {
        return { error: 'error' }; 
    } 

    const channelGiven = store.channels.find(channel => channel.channelId === channelId);

    // Checking validity of 'start' input 
    let maxRecentIndex = false; 
    if (start > channelGiven.messages.length) {
        return { error: 'error' };
    } else if (start + 50 > channelGiven.messages.length) {
        maxRecentIndex = true; 
    }
    
    // Creating object to contain messages and the specified range 
    const messageDetails = {};     
    messageDetails.messages = channelGiven.messages.slice(start, start + 50); 
    messageDetails.start = start; 
    if (maxRecentIndex === true) {
        messageDetails.end = -1;
    } else {
        messageDetails.end = start + 50;
    }

    return messageDetails;
}

// Stub for channelJoinV1 function
function channelJoinV1(authUserId, channelId) {
    return ('authUserId' + 'channelId');
}

// Stub for channelInviteV1 function
function channelInviteV1(authUserId, channelId, uId) {
    return ('authUserId' + 'channelId' + 'uId');
}
