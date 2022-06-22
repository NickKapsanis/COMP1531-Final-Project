import {getData, setData} from './dataStore';
import {getUId} from './other';

//this function gives an array of all public channels the given user is in
export function channelsListV1(authUserId) {
    const data = getData();
    let uId = getUId(authUserId);
    var numChannels = 0;
    let channelsArray = [];

    //this loop searches for given user id within every channel.   
    for (var i = 0; data.channels[i] !== -1; i++) {
        for (var n = 0; data.channels[i].allMembers[n] !== -1; n++) {
            if (data.channels[i].allMembers[n] === uId) {
                numChannels++;

                let channel = {
                    channelId: data.channels[i].channelId,
                    name: data.channels[i].name
                }
                channelsArray.push(channel);
            }
        }
    }

    //case with no channels
    if (numChannels === 0) {
        return null;
    }

    return channelsArray;
}

//this function gives an array of all channels the given user is in
export function channelsListallV1(authUserId) {
    const data = getData();
    let uId = getUId(authUserId);
    var numChannels = 0;
    var allChannelsArray = [];

    //this loop finds all arrays, adds them to channelsArray  
    for (var j = 0; data.channels[j] !== -1; j++) {
        numChannels++;

        let channel = {
            channelId: data.channels[i].channelId,
            name: data.channels[i].name
        }
        allChannelsArray.push(channel);
    }

    //case with no channels
    if (numChannels === 0) {
        return null;
    }

    return channelsArray;
}

// Stub for channelsCreateV1 function
function channelsCreateV1(authUserId, name, isPublic) {
    return 'authUserId' + 'name' + 'isPublic';
}