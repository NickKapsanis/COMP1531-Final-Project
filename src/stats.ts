import HTTPError from 'http-errors'

// Assign empty userStatus object to user at authRegister

// Standup Message bank - Send 

const FORBIDDEN = 403;

export function userStatsV1(token: string) {

    const data = getData();
    const user = data.users.find(i => i.tokens.find(t => t === token));

    if (user === undefined) { throw HTTPError(FORBIDDEN, "token passed in is invalid") }

    const uId = user.uId;
    const userStats = data.userStats.find(i => i.uId === uId);

    // Calculating the involvement rate
    const numchannels = userStats.channelsJoined[userStats.channelsJoined.length - 1].numChannelsJoined;
    const numDms = userStats.dmsJoined[userStats.dmsJoined.length - 1].numDmsJoined;
    const numMessages = userStats.messagesSent[userStats.messagesSent.length - 1].numMessagesSent;
    const numerator = numChannels + numDms + numMessages;

    const workspaceStats = data.workspaceStats;
    const ttlChannels = workspaceStats.channelsExist[workspaceStats.channelsExist.length - 1].numChannelsExist;
    const ttlDms = workspaceStats.dmsExist[workspaceStats.dmsExist.length - 1].numDmsExist;
    const ttlMessages = workspaceStats.messagesExist[workspaceStats.messagesExist.length - 1].numMessagesExist;
    const denominator = ttlChannels + ttlDms + ttlMessages;

    const involvementRate;
    if (denominator === 0) {
        involvementRate = 0;
    } else {
        involvementRate = numerator / denominator;
    }

    if (involvementRate > 1) {
        involvementRate = 1;
    }

    userStats.involvementRate = involvementRate;
    return {userStats: userStats};

}

export function usersStatsV1(token: string) {

    const data = getData();
    const user = data.users.find(i => i.tokens.find(t => t === token));

    if (user === undefined) { throw HTTPError(FORBIDDEN, "token passed in is invalid") }

    let workspaceStats = data.workspaceStats;

    let count = 0;
    for (let i of data.users) {
        if (i.dms.length > 0 || i.channels.length > 0) {
            count++;
        }
    }
    
    workspace.utilizationRate = count / data.users.length;

    return { workspaceStats: workspaceStats};

}


