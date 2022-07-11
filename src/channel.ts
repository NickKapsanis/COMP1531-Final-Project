import { getData, setData } from './dataStore'; 
import { userProfileV1 } from './users'; 
import { channelsListV1 } from './channels'; 
import express from 'express';
import request from 'sync-request';
  
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
function channelJoinV1(token: string, channelId: number) {
    let data = getData();
    const authUserId = data.users.find(user => user.tokens.find(tok => tok === token));
    // setup to find the correct user and channel object
    let usersArray = data.users;
    let channelsArray = data.channels;
    let user: any, userIndex: number, channel: any, channelIndex: number;
    for (let i = 0; i < usersArray.length; i++) {
        //console.log("USER AUTHID in arr:\n", usersArray[i].authUserId)
        if (authUserId === usersArray[i].authUserId) {
            user = usersArray[i];
            userIndex = i;
        }
    }
    channel = getChannel(channelId, channelsArray)[0];
    channelIndex = getChannel(channelId, channelsArray)[1];

    // error when we can't find a valid user or channel
    if (user === undefined || channel === undefined) {
        return { error : 'error' };
    }

    // error when the authorized user is already a member of the channel
    if (user.channels.includes(channelId)) {
        return { error : 'error' }
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
function channelInviteV1(token: string, channelId: number, uId: number) {
    let data = getData();
    const authUserId = data.users.find(user => user.tokens.find(tok => tok === token));
    let userInviting = getUsers(uId, authUserId, data.users)[0];
    let userJoining = getUsers(uId, authUserId, data.users)[1];
    let userJoiningIndex = getUsers(uId, authUserId, data.users)[3];
    let channel = getChannel(channelId, data.channels)[0];
    let channelIndex = getChannel(channelId, data.channels)[1];

    // error when we can't find a valid user or channel ID
    if (userJoining === undefined || channel === undefined || userInviting === undefined) {
        return { error : 'error' };
    }
    
    // error when uId refers to user already in channel
    if (userJoining.channels.includes(channelId)) {
        return { error : 'error' };
    }

    // error when authUserId is not a member of the channel
    if (! userInviting.channels.includes(channelId)) {
        return { error : 'error' };
    }
    
    // updating dataStore.js
    data.users[userJoiningIndex].channels.push(channelId);
    data.channels[channelIndex].allMembers.push(userJoining.uId);
    setData(data);
    return {};
}


/**
* addChannelOwnerV1
* this function adds a user as a channel owner
* 
* Arguments:
*   channelId - the channel in question
*   uId - the user to be added as an owner
*  
* Return Value:
*   {error: 'error'}     object         Error message when given invalid input
*   {}                   empty object   Successful run
*/
function addChannelOwnerV1(token: string, channelId: number, uId: number) {
    let data = getData();
    let channel = getChannel(channelId, data.channels)[0];
    const authUserId = data.users.find(user => user.tokens.find(tok => tok === token));
    let userBecomingOwner = getUsers(uId, authUserId, data.users)[1];
    let userGivingOwner = getUsers(uId, authUserId, data.users)[0];

    // error when channelId fails to find a valid channel
    if (channel === undefined) {
        return { error : 'error' };
    }

    // error when uId doesn't find a valid user
    if (userBecomingOwner === undefined) {
        return { error : 'error' };
    }

    // error when authUserId doesn't find a valid user
    if (userGivingOwner === undefined) {
        return { error : 'error' };
    }

    // error when the user becoming owner is not a member of the channel
    if (! userBecomingOwner.channels.includes(channelId)) {
        return { error : 'error' };
    }

    // error when the user is already a channel owner
    if (channel.ownerMembers.includes(uId)) {
        return { error : 'error' };
    }

    // error when the user adding is not an existing channel owner or global owner
    if (!channel.ownerMembers.includes(userGivingOwner.uId) || ! (userGivingOwner.isGlobalOwner === 1)) {
        return { error : 'error' };
    }

    channel.ownerMembers.push(uId);
    return {};
}


/**
* removeChannelOwnerV1
* this function remove a user as a channel owner
* 
* Arguments:
*   channelId - the channel in question
*   uId - the user to be removed as an owner
*  
* Return Value:
*   {error: 'error'}     object         Error message when given invalid input
*   {}                   empty object   Successful run
*/
function removeChannelOwnerV1(token: string, channelId: number, uId: number) {
    const data = getData();
    const authUserId = data.users.find(user => user.tokens.find(tok => tok === token));
    let channel = getChannel(channelId, data.channels)[0];
    let userBeingRemoved = getUsers(uId, authUserId, data.users)[1];
    let userRemovingOwner = getUsers(uId, authUserId, data.users)[0];

    // error when channelId fails to find a valid channel
    if (channel === undefined) {
        return { error : 'error' };
    }

    // error when uId doesn't find a valid user
    if (userBeingRemoved === undefined) {
        return { error : 'error' };
    }

    // error when authUserId doesn't find a valid user
    if (userRemovingOwner === undefined) {
        return { error : 'error' };
    }

    // error when uId is not an owner of the channel
    if (!channel.ownerMembers.includes(uId)) {
        return { error : 'error' };
    }

    // error when uId refers to a user who is currently the only owner of the channel
    if (channel.ownerMembers.length === 1) {
        return { error : 'error' };
    }

    // error when the user removing the channel owner is not a global owner
    if (! (userRemovingOwner.isGlobalOwner === 1)) {
        return { error : 'error' };
    }

    channel.ownerMembers.remove(uId);
    return {};
}


// helper function to reduce reptition
function getChannel(channelId: number, channelsArray: any) {
    let channel, channelIndex;
    for (let i = 0; i < channelsArray.length; i++) {
        if (channelId === channelsArray[i].channelId) {
            channel = channelsArray[i];
            channelIndex = i;
        }
    }
    return [channel, channelIndex];
}

// helper function to reduce reptition
function getUsers(uId: number, authUserId: number, usersArray: any) {
    let authUserIdIndex, uIdIndex, newuId, newauthUserId;
    for (let i = 0; i < usersArray.length; i++) {
        if (uId === usersArray[i].uId) {
            newuId = usersArray[i];
            uIdIndex = i;
        }
        if (authUserId === usersArray[i].authUserID) {
            newauthUserId = usersArray[i];
            authUserIdIndex = i;
        }
    }
    return [newauthUserId, newuId, authUserIdIndex, uIdIndex];
}

export { channelDetailsV1, channelJoinV1, channelInviteV1, channelMessagesV1, addChannelOwnerV1, removeChannelOwnerV1 };
