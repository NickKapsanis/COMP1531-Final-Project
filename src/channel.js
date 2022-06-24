import {getData, setData} from './dataStore';

// Stub for channelDetailsV1 function 
function channelDetailsV1(authUserId, channelId) { 
    return 'authUserId' + 'channelId'; 
}

// Stub for channelMessagesV1 function 
function channelMessagesV1(authUserId, channelId, start) { 
    return 'authUserId' + 'channelId' + 'start'; 
}

function channelJoinV1(authUserId, channelId) {
    let data = getData();
    // setup to find the correct user and channel object
    let usersArray = data.users;
    let channelsArray = data.channels;
    let user, channel;
    for (let users of usersArray) {
        if (authUserId === users.authUserId) {
            user = users;}}
    for (let channels of channelsArray) {
        if (channelId === channels.channelId) {
            channel = channels;}}

    // error when any of channelId does not refer to a valid channel
    if (! channel.channelId === channelId) {return { error : 'error' }};

    // error when userId does not refer to a valid user
    if (! user.authUserId === authUserId) {return { error : 'error' }};

    // error when the authorized user is already a member of the channel
    for (let joinedChannels of user.channels) {
        if (channel === joinedChannels) {return { error : 'error' }};
    }

    // error when the channel is private, and the user is not already a member or a global owner
    if (!channel.isPublic) {
        if (!user.isGlobalOwner === 1) {
            return { error : 'error' };
        }
    }

    // update dataStore.js
    data.users.authUserId.channels.push(channel);
    data.channels.channelId.allMembers.push(user);
    setData(data);
    return {};
}


//Invites a user with ID uId to join a channel with ID channelId. 
//Once invited, the user is added to the channel immediately. 
//In both public and private channels, all members are able to invite users.
function channelInviteV1(authUserId, channelId, uId) {
    let data = getData();
    // setup to find the correct user and channel object
    let usersArray = data.users;
    let channelsArray = data.channels;
    let userInviting, channel, userJoining;
    for (let users of usersArray) {
        if (authUserId === users.authUserId) {
            userInviting = users;}
        if (uId === users.uId) {
            userJoining = users;}}
    for (let channels of channelsArray) {
        if (channelId === channels.channelId) {
            user = users;}}
    
    // error when any of channelId does not refer to a valid channel
    if (! channel.channelId === channelId) {return { error : 'error' }};

    // error when AuthuserId or uId does not refer to a valid user
    if (! userInviting.authUserId === authUserId) {return { error : 'error' }};
    if (! userJoining.uId === uId) {return { error : 'error' }};

    // error when uId refers to user already in channel
    for (let joinedChannels of userJoining.channels) {
        if (channel === joinedChannels) {return { error : 'error' }};
    }

    // error when authUserId is not a member of the channel
    let seen = false;
    for (let joinedChannels of userInviting.channels) {
        if (joinedChannels.channelId === channelId) {
            seen = true;
        }
    } if (!seen) {return { error : 'error' }};
    
    // updating dataStore.js
    data.users.uId.channels.push(channel);
    data.channels.channelId.allMembers.push(userJoining);
    setData(data);
    return {};
}

export {channelDetailsV1, channelInviteV1, channelJoinV1};
