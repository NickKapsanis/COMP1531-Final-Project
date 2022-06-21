import { getData, setData } from './dataStore'; 
import { userProfileV1 } from './users'
  

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
    
    const individual = store.users.find(user => user.authUserId === authUserId); 
    const channelsMemberOf = individual.channels; 

    // Checking if valid channelIds were given 
    if (store.channels.find(channel => channel.channelId === channelId) === undefined) {
        return { error: 'error' }; 
    } else if (channelsMemberOf.find(channel => channel === channelId) === undefined) {
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



