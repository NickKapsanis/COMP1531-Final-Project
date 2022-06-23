import { getData, setData } from './dataStore'; 
import { userProfileV1 } from './users'; 
import { channelsListV1 } from './channels'; 
  

/**
 * Returns the basic details about the channel (such as its name, public status, 
 * owners and members) given a channelId and authUserId. 
 * 
 * Arguments: 
 *      authUserId: integer     The user's unique identifier
 *      channelId:  integer     The channel's unique identifier 
 *
 * Returns:
 *      { error: 'error' }     object     Error message when given invalid input
 *      { 
 *        name, isPublic,      object     Object containing specified keys that  
 *        ownerMembers,                   give detail about the channel 
 *        allMembers 
 *      } 
 */  
function channelDetailsV1(authUserId, channelId) {
    const store = getData(); 

    if (store.users.find(user => user.authUserId === authUserId) === undefined) {
        return { error: 'error' }; 
    }
    
    const channelsMemberOf = channelsListV1(authUserId); 

    // Checking if valid channelIds were given 
    if (store.channels.find(channel => channel.channelId === channelId) === undefined) {
        return { error: 'error' }; 
    } else if (channelsMemberOf.find(channel => channel.channelId === channelId) === undefined) {
        return { error: 'error' }; 
    } 
    
    // Finding the given channel
    const channelDetails = store.channels.find(channel => channel.channelId === channelId); 

    // Iterating through owners (which contains uIds) and finding their details
    // using userProfileV1 
    const owners = channelDetails.ownerMembers; 
    const ownerMembersDetails = []; 

    owners.forEach((uId) => {
        let user = userProfileV1(authUserId, uId); 
        ownerMembersDetails.push(user); 
    }); 

    // Iterating through members (which contains uIds) and finding their details
    // using userProfileV1 
    const members = channelDetails.allMembers; 
    const allMembersDetails = []; 

    members.forEach((uId) => {
        let user = userProfileV1(authUserId, uId); 
        allMembersDetails.push(user); 
    });

    return {
        name: channelDetails.name, 
        isPublic: channelDetails.isPublic,
        ownerMembers: ownerMembersDetails,
        allMembers: allMembersDetails,
    };
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
    
    // Checking if authUserId is valid
    if (store.users.find(user => user.authUserId === authUserId) === undefined) {
        return { error: 'error' }; 
    }

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

export { channelDetailsV1, channelJoinV1, channelInviteV1, channelMessagesV1 };
