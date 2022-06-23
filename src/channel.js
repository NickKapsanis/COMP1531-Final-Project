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
    if (! channel.channelId === channelId) {return {error:'error'}};

    // error when userId does not refer to a valid user
    if (! user.authUserId === authUserId) {return {error:'error'}};

    // error when the authorized user is already a member of the channel
    for (let joinedChannels of user.channels) {
        if (channel === joinedChannels) {return {error:'error'}};
    }

    // error when the channel is private, and the user is not already a member or a global owner
    if (!channel.isPublic) {
        if (!user.isGlobalOwner) {
            return {error:'error'};
        }
    }

    data.users.authUserId.channels.push(channel);
    data.channels.channelId.allMembers.push(user);
    setData(data);
    return {};
}


function channelInviteV1(authUserId, channelId, uId) {
    let data = getData();
    // setup to find the correct user and channel object
    let usersArray = data.users;
    let channelsArray = data.channels;
    let userInviting, channel, userJoining;
    for (let users of usersArray) {
        if (authUserId === users.authUserId) {
            userInviting = users;}}
    for (let channels of channelsArray) {
        if (channelId === channels.channelId) {
            user = users;}}


    //Invites a user with ID uId to join a channel with ID channelId. 
    //Once invited, the user is added to the channel immediately. 
    //In both public and private channels, all members are able to invite users.
    
}
