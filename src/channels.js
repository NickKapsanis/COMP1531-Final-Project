import {getData, setData} from './dataStore';
import {getUId} from './other';


//this function gives an array of all public channels the given user is in
export function channelsListV1(authUserId) {
    const data = getData();
    let uId = getUId(authUserId);

    var numPublicChannels = 0;

    //this finds the required array size.
    for (var i = 0; data.channels[i] !== -1; i++) {
        if (data.channels[i].isPublic === true) {
            for (var m = 0; data.channels[i].allMembers[m] !== -1; m++) {
                if (data.channels[i].allMembers[m] === uId) {
                    numPublicChannels++;
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
    for (var i = 0; data.channels[i] !== -1; i++) {
        if (data.channels[i].isPublic === true) {
            for (var n = 0; data.channels[i].allMembers[n] !== -1; n++) {
                if (data.channels[i].allMembers[n] === uId) {
                    array[k] = data.channels[i];
                    k++;
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
    for (var j = 0; data.channels[j] !== -1; j++) {
        if (data.channels[j].isPublic === true) {
            numChannels++;
        }
        if (data.channels[j].isPublic === false) {
            numChannels++;
        }
    }
    
    //case with no channels
    if (numChannels === 0) {
        return null;
    }

    const channelsArray = array(numChannels);
    j = 0;
    var k = 0;

    //this loop finds all arrays, adds them to channelsArray  
    for (var j = 0; data.channels[j] !== -1; j++) {
        if (data.channels[j].isPublic === true) {
            array[k] = data.channels[j];
            k++;
        }
        if (data.channels[j].isPublic === false) {
            array[k] = data.channels[j];
            k++;
        }
    }

    return channelsArray;
}

// Stub for channelsCreateV1 function
function channelsCreateV1(authUserId, name, isPublic) {
    return 'authUserId' + 'name' + 'isPublic';
}