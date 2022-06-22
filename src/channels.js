import {getData, setData} from './dataStore';
import {getUId} from './other';


//this function gives an array of all public channels the given user is in
export function channelsListV1(authUserId) {
    const data = getData();
    let uId = getUId(authUserId);

    var numPublicChannels = 0;

    //this finds the required array size.
    for (var i = 0; i !== -1; i++) {
        if (data.channels[i].isPublic === true) {
            for (var j = 0; j !== -1; j++) {
                for (var n = 0; n !== -1; n++) {
                    if (data.channels[j].ownerMembers[n] === uId ||
                        data.channels[j].allMembers[n] === uId) {
                        numPublicChannels++;
                    }
                }
            }
        }
    }

    //case with no channels
    if (numPublicChannels === 0) {
        return null;
    }
    
    const channelsArray = array(numPublicChannels);
    var k = 0;

    //this loop finds a public channel,
    //then searches for given user id within that channel.   
    for (var i = 0; i !== -1; i++) {
        if (data.channels[i].isPublic === true) {
            for (var j = 0; j !== -1; j++) {
                for (var n = 0; n !== -1; n++) {
                    if (data.channels[j].ownerMembers[n] === uId ||
                        data.channels[j].allMembers[n] === uId) {
                        array[k] = data.channels[j];
                        k++;
                    }
                }
            }
        }
    }

    return channelsArray;
}

//this function gives an array of all channels the given user is in
export function channelsListallV1(authUserId) {
    const data = getData();
    let uId = getUId(authUserId);

    var numChannels = 0;

    //this finds the required array size.
    for (var i = 0; i !== -1; i++) {
        for (var j = 0; j !== -1; j++) {
            for (var n = 0; n !== -1; n++) {
                if (data.channels[j].ownerMembers[n] === uId ||
                    data.channels[j].allMembers[n] === uId) {
                    numChannels++;
                }
            }
        }
    }
    
    //case with no channels
    if (numChannels === 0) {
        return null;
    }

    const channelsArray = array(numChannels);
    var k = 0;

    //this loop finds a public channel,
    //then searches for given user id within that channel.   
    for (var i = 0; i !== -1; i++) {
        for (var j = 0; j !== -1; j++) {
            for (var n = 0; n !== -1; n++) {
                if (data.channels[j].ownerMembers[n] === uId ||
                    data.channels[j].allMembers[n] === uId) {
                    array[k] = data.channels[j];
                    k++;
                }
            }
        }
    }

    return channelsArray;
}

// Stub for channelsCreateV1 function
function channelsCreateV1(authUserId, name, isPublic) {
    return 'authUserId' + 'name' + 'isPublic';
}