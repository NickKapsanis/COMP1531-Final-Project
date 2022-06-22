import {getData, setData} from './dataStore'

// Stub for channelsListV1 function
function channelsListV1(authUserId) {
    return 'authUserId';
}

// Stub for channelsListAllV1 function
function channelsListallV1(authUserId) {
    return 'authUserId';
}

// Stub for channelsCreateV1 function
function channelsCreateV1(authUserId, name, isPublic) {
    let data = getData();
    let creator = data.users.find(i => i.authUserId === authUserId);
    
    // Error cases
    if (creator === undefined) { return { error : 'error' } };
    if (name.length > 20 || name.length < 1) { return { error : 'error' } };

    const newChannelId = data.channels.length + 1;

    let newChannel = {
        
        'channelId': newChannelId,
        'name': name,
        'isPublic' : isPublic,
        'allMembers' : [creator.uId],
        'ownerMembers' : [creator.uId], 
        'messages': []
    }

    data.channels.push(newChannel);
    data.users = data.users.filter(i => i.authUserId != authUserId);
    creator.channels.push(newChannelId);
    data.users.push(creator);

    setData(data);

    return newChannelId;
    
}

export {channelsListV1, channelsListallV1, channelsCreateV1}