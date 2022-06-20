import {getData, setData} from './dataStore.js';


//this function gives an array of all public channels the given user is in
export function channelsListV1(authUserId) {
    const data = getData();

    var numPublicChannels = 0;

    //this finds the required array size.
    for (var i = 0; i !== -1; i++) {
        if (data.channels[i].isPublic === true) {
            for (var j = 0; j !== -1; j++) {
                if (data.channels[j].ownerMembers === authUserId) {
                    numPublicChannels++;
                }
            }
        }
    }
    
    const channelsArray = array(numPublicChannels);
    var k = 0;

    //this loop finds a public channel,
    //then searches for given user id within that channel.   
    for (var i = 0; i !== -1; i++) {
        if (data.channels[i].isPublic === true) {
            for (var j = 0; j !== -1; j++) {
                if (data.channels[j].ownerMembers === authUserId) {
                    array[k] = data.channels[j];
                    k++;
                }
            }
        }
    }

    return channelsArray;
}

//this function gives an array of all channels the given user is in
export function channelsListallV1(authUserId) {

    return channelsArray;
}

// Stub for channelsCreateV1 function
function channelsCreateV1(authUserId, name, isPublic) {
    return 'authUserId' + 'name' + 'isPublic';
}