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
    
    const channelsMemberOf = channelsListV1(authUserId).channels; 

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

    const channelsMemberOf = channelsListV1(authUserId).channels;  

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


/**
* channelJoinV1
* this function allows a user to join public channels 
* (or private channels if they are a global owner)
*
* Arguments:
*   authUserId: integer - the users unique identification number
*   channelId - the channel to be joined
* 
* Return Value:
*   {error: 'error'}     object         Error message when given invalid input
*   {}                   empty object   Successful run
*/
function channelJoinV1(authUserId, channelId) {
    let data = getData();
    
    // setup to find the correct user and channel object
    let usersArray = data.users;
    let channelsArray = data.channels;
    let user, userIndex, channel, channelIndex;
    //console.log("USER AUTHID:\n", authUserId)
    for (let i = 0; i < usersArray.length; i++) {
        //console.log("USER AUTHID in arr:\n", usersArray[i].authUserId)
        if (authUserId === usersArray[i].authUserId) {
            user = usersArray[i];
            userIndex = i;
        }
    }
    for (let i = 0; i < channelsArray.length; i++) {
        if (channelId === channelsArray[i].channelId) {
            channel = channelsArray[i];
            channelIndex = i;
        } 
    }

    // error when we can't find a valid user or channel
    if (user === undefined || channel === undefined) {
        return { error : 'error' };
    }

    // error when the authorized user is already a member of the channel
    for (let joinedChannels of user.channels) {
        if (channel.channelId === joinedChannels) {
            return { error : 'error' }
        }
    }

    // error when the channel is private, and the user is not already a member or a global owner
    if (!channel.isPublic) {
        if (user.isGlobalOwner !== 1) {
            return { error : 'error' };
        }
    }

    // update dataStore.js
    data.users[userIndex].channels.push(channelId);
    data.channels[channelIndex].allMembers.push(user.uId);
    setData(data);
    return {};
}


/**
* channelInviteV1
* this function allows a user to join a channel 
* (public or private) by being invited by an existing member
* 
* Arguments:
*   authUserId: integer - the authUserID for the member inviting a new member
*   channelId - The channel to be joined
*   uId - the Id for the joining member
*  
* Return Value:
*   {error: 'error'}     object         Error message when given invalid input
*   {}                   empty object   Successful run
*/
function channelInviteV1(authUserId, channelId, uId) {
    let data = getData();
    // setup to find the correct user and channel object
    let usersArray = data.users;
    let channelsArray = data.channels;
    let userInviting, channel, userJoining, userInvitingIndex, channelIndex, userJoiningIndex;
    for (let i = 0; i < usersArray.length; i++) {
        if (authUserId === usersArray[i].authUserId) {
            userInviting = usersArray[i]
            userInvitingIndex = i;
        }
        if (uId === usersArray[i].uId) {
            userJoining = usersArray[i];
            userJoiningIndex = i;
        }
    }
    for (let i = 0; i < channelsArray.length; i++) {
        if (channelId === channelsArray[i].channelId) {
            channel = channelsArray[i];
            channelIndex = i;
        }
    }

    // error when we can't find a valid user or channel ID
    if (userJoining === undefined || channel === undefined || userInviting === undefined) {
        return { error : 'error' };
    }
    
    // error when uId refers to user already in channel
    for (let joinedChannels of userJoining.channels) {
        if (channelId === joinedChannels) {
            return { error : 'error' };
        }
    }

    // error when authUserId is not a member of the channel
    let seen = false;
    for (let joinedChannels of userInviting.channels) {
        if (joinedChannels === channelId) {
            seen = true;
        }
    } if (!seen) {
        return { error : 'error' };
    }
    
    // updating dataStore.js
    data.users[userJoiningIndex].channels.push(channelId);
    data.channels[channelIndex].allMembers.push(userJoining.uId);
    setData(data);
    return {};
}

/**
* channelLeaveV1
* this function makes a user leave a channel. 
* (public or private) given their token and the channelId of leaving channel.
* 
* Arguments:
*   token: integer - the authUserID for the member inviting a new member
*   channelId - The channel to be joined
*  
* Return Value:
*   {error: 'error'}     object         Error message when given invalid channelId
*                                       or valid channelId given member is not a part of.
*   {}                   empty object   Successful run
*/
function channelsLeaveV1(authUserId, channelId) {
    const data = getData();

    let user = data.users.find(i => i.authUserId === authUserId);
    if (user === undefined) { return { error : 'error' } };

    //the channelsListV1, which uses getUId function already does error checking within.
    let channelsArray = channelsListV1(authUserId);
    let uId = getUId(authUserId);

    if (channelsArray === undefined) {
        return {error: 'error'};
    }

    //loops through all channels given member is a part of, removes member.
    for (let i = 0; i < channelsArray[i].length; i++) {
        if (channelsArray[i].channelId === channelId) {
            for (let n = 0; n < channelsArray[i].allMembers.length; n++) {
                if (channelsArray[i].allMembers[n] === uId) {
                    channelsArray[i] = channelsArray[i].filter(item => item !== uId);   
                    return {};                  
                }
            }
        }

    }

    //case given user wawsn't a part of channel. 
    return {error: 'error'};

}

export { channelDetailsV1, channelJoinV1, channelInviteV1, channelMessagesV1, channelsLeaveV1};