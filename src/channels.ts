import {getData, setData} from './dataStore';
import {getUId} from './other';

/*
this function gives an array of all channels the user is in

Arguments:
    authUserId: integer    - the users unique identification number

Return Value:
    channelsArray: array    - an array of all channels user is in.
*/
function channelsListV1(authUserId) {
    const data = getData();

    let user = data.users.find(i => i.authUserId === authUserId);
    if (user === undefined) { return { error : 'error' } };

    let uId = getUId(authUserId);
    let numChannels = 0;
    let channelsArray = [];


    //this loop searches for given user id within every channel.   
    for (let i = 0; i < data.channels.length; i++) {
        for (let n = 0; n < data.channels[i].allMembers.length; n++) {
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
        return { channels: [] };
    }

    return { channels: channelsArray };
}



/*
this function gives an array of all channels

Arguments:
    authUserId: integer    - the users unique identification number

Return Value:
    allChannelsArray: array    - an array of all channels.
*/
function channelsListallV1(authUserId) {
    const data = getData();
    let allChannelsArray = [];

    let user = data.users.find(i => i.authUserId === authUserId);
    if (user === undefined) { return { error : 'error' } };

    //case with no channels
    if (data.channels.length === 0) {
        return { channels: [] };
    }

    //this loop finds all arrays, adds them to channelsArray  
    for (let j = 0; j < data.channels.length; j++) {

        let channel = {
            channelId: data.channels[j].channelId,
            name: data.channels[j].name
        }
        allChannelsArray.push(channel);
    }

    return { channels: allChannelsArray };
}

/*
The function channelsCreateV1() creates a channel and adds it to 
the dataStore. the user is added as the owner and member of the channel.
Returns the unique channelId for the created channel.

* Parameters -
    authUserId - (integer) 
    name       - (string)
    isPublic   - (boolean)

* Returns - 
    (1) error if authUserId does not exist
    {error : 'error'}

    (2)
    channelId - (integer)
*/
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
    data.users = data.users.filter(i => i.authUserId !== authUserId);
    creator.channels.push(newChannelId);
    data.users.push(creator);

    setData(data);

    return { channelId: newChannelId };
}

export {channelsListV1, channelsListallV1, channelsCreateV1}