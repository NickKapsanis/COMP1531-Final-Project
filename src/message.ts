import { getData, setData } from './dataStore'; 
import { channelsListV1 } from './channels';

type messageId = {
    messageId: number; 
}

type errorMessage = {
    error: 'error'
}

function messageSendV1(token: string, channelId: number, message: string): messageId | errorMessage {
    const data = getData(); 

    // Token validation
    if (data.users.find(user => user.tokens.find(tok => tok === token)) === undefined) {
        return { error: 'error' }; 
    }
        
    const userId = data.users.find(user => user.token === token).uId;
    const channelsMemberOf = channelsListV1(token).channels; 

    // Checking if valid channelIds were given 
    // Validating if authorised user is a member of the channel
    if (data.channels.find(channel => channel.channelId === channelId) === undefined) {
        return { error: 'error' }; 
    } else if (channelsMemberOf.find(channel => channel.channelId === channelId) === undefined) {
        return { error: 'error' }; 
    } 

    const channelGiven = data.channels.find(channel => channel.channelId === channelId);
    const channelGivenIndex = data.channels.findIndex(channel => channel.channelId === channelId);

    // Message validation 
    if (message.length < 1 || message.length > 1000) {
        return { error: 'error' };
    }

    // Finding number of messages in channel 
    const numMessages = channelGiven.messages.length
    let newMessageId; 

    // PROBLEM: eg. You have messages 10001, 10002, 10003, 10004. numMessages = 4 
    // When you delete 10002, the array is 10001, 10003, 10004 numMessages = 3. 
    // Then when new message is created the id will be 10004. Thus duplicate arises. 

    // Creating a unique messageId:  
    if (numMessages < 10000) {
        newMessageId = channelId * 10000 + numMessages + 1; 
    } else {
        newMessageId = channelId * 1000000 + numMessages + 1; 
    }

    const newMessage = {
        messageId: newMessageId, 
        uId: userId, 
        message: message, 
        timeSent: Math.floor(Date.now() / 1000), 
    }

    data.channels[channelGivenIndex].messages.unshift(newMessage); 
    setData(data); 

    return { messageId: newMessageId }
}