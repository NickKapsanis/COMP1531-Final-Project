import request from 'sync-request';
import config from './config.json';
import { getUId } from './other';

const OK = 200;
const port = config.port;
const hosturl = config.url;
const url = hosturl + ':' + port;

describe('Testing /user/stats/v1', () => {
    beforeEach(() => {
      requestClear();
    });
  
    test ('Testing if error is returned when token is invalid', () => {
        requestUserStats('invalid-token').toStrictEqual(403);
    });

    test('Testing if user stats are returned correctly', () => {

      // Creating user1
      const user1 = createUser('testemail@email.com', 'testPassword123', 'testFirstName', 'testLastName');
      const token1 = user1.token;

      // Creating user2
      const user2 = createUser('testemail2@email.com', 'testPassword123', 'testFirstName', 'testLastName');
      const token2 = user2.token;

      // Creating user3
      const user3 = createUser('testemail3@email.com', 'testPassword123', 'testFirstName', 'testLastName');
      const token3 = user3.token;
      
      // -------------------------------------
      // Creating 2 channels with user1

      // Creating channel1 
      const channelId1 = createChannel(token1, "channel1", true).channelId;

      // Sending 3 messages in channel1 from user 1
      requestMessageSendV1(token1, channelId1, "Message");
      requestMessageSendV1(token1, channelId1, "Message");
      requestMessageSendV1(token1, channelId1, "Message");

      // Creating channel2 
      const channelId2 = createChannel(token1, "channel2", true).channelId;

      // Sending 3 messages in channel2 from user 1
      requestMessageSendV1(token1, channelId2, "Message");
      requestMessageSendV1(token1, channelId2, "Message");
      requestMessageSendV1(token1, channelId2, "Message");
    
      // -------------------------------------
      // Adding user2 in channel1
      
      requestChannelJoin(token2, channelId1);

      // Sending 2 messages in channel1 from user 2

      requestMessageSendV1(token2, channelId1, "Message");
      requestMessageSendV1(token2, channelId1, "Message");

      // -------------------------------------

      // RequestUserStats
      let output1 = requestUserStats(token1); // user1
      let output2 = requestUserStats(token2); // user2
      let output3 = requestUserStats(token3); // user3
      
      // -------------------------------------

      // checking user/stats for stats of user 1
      // Expect Numchannels == 2
      expect(output1.Numchannels).toStrictEqual(2);

      // Expect dmsJoined == 0
      expect(output1.dmsJoined).toStrictEqual(0);

      // Expect messagesSent == 6
      expect(output1.messagesSent).toStrictEqual(6);

      // Expect involvementRate == Some Number
      expect(output1.involvementRate).toStrictEqual(-1);
                
      // -------------------------------------

      // checking user/stats for stats of user 2
      // Expect Numchannels == 1
      expect(output2.Numchannels).toStrictEqual(1);

      // Expect dmsJoined == 0
      expect(output2.dmsJoined).toStrictEqual(0);

      // Expect messagesSent == 2
      expect(output2.messagesSent).toStrictEqual(2);

      // Expect involvementRate == Some Number
      expect(output2.involvementRate).toStrictEqual(-1);

      // -------------------------------------
      // checking user/stats for stats of user 3

      // Expect Numchannels == 0
      expect(output3.Numchannels).toStrictEqual(0);

      // Expect dmsJoined == 0
      expect(output3.dmsJoined).toStrictEqual(0);

      // Expect messagesSent == 0
      expect(output3.messagesSent).toStrictEqual(0);

      // Expect involvementRate == Some Number
      expect(output3.involvementRate).toStrictEqual(-1);

      // -------------------------------------
      // Create 2 Dms 

      // Getting uIds 
      const uId1 = getUId(user1.authUserId);
      const uId2 = getUId(user2.authUserId);
      const uId3 = getUId(user3.authUserId);

      // Creating dm1 - with user1, user2
      const dm1 = requestDmCreate(token1, [uId2]);
      const dmId1 = dm1.dmId;

      // -------------------------------------          
      // Sending 3 messages in dm1 from user 1
    
      requestMessageSendDmV1(token1, dmId1, "message");
      requestMessageSendDmV1(token1, dmId1, "message");
      requestMessageSendDmV1(token1, dmId1, "message");

      // Sending 3 messages in dm1 from user 2

      requestMessageSendDmV1(token2, dmId1, "message");
      requestMessageSendDmV1(token2, dmId1, "message");
      requestMessageSendDmV1(token2, dmId1, "message");
      
      // -------------------------------------
      // Creating dm2 - with user1, user2, user3
                
      const dm2 = requestDmCreate(token1, [uId2, uId3]);
      const dmId2 = dm2.dmId;

      // Sending 3 messages in dm2 from user 1
      requestMessageSendDmV1(token1, dmId2, "message");
      requestMessageSendDmV1(token1, dmId2, "message");
      requestMessageSendDmV1(token1, dmId2, "message");

      // Sending 3 messages in dm2 from user 2
      requestMessageSendDmV1(token2, dmId2, "message");
      requestMessageSendDmV1(token2, dmId2, "message");
      requestMessageSendDmV1(token2, dmId2, "message");

      // Sending 3 messages in dm2 from user 3
      requestMessageSendDmV1(token3, dmId2, "message");
      requestMessageSendDmV1(token3, dmId2, "message");
      requestMessageSendDmV1(token3, dmId2, "message");

      // -------------------------------------

      // Checking user/stats
      output1 = requestUserStats(token1); // user1
      output2 = requestUserStats(token2); // user2
      output3 = requestUserStats(token3); // user3

      // -------------------------------------

      // checking user/stats for stats of user 1
      // Expect Numchannels == 2
      expect(output1.Numchannels).toStrictEqual(2);

      // Expect dmsJoined == 2
      expect(output1.dmsJoined).toStrictEqual(2);

      // Expect messagesSent == 12
      expect(output1.messagesSent).toStrictEqual(12);

      // Expect involvementRate == Some Number
      expect(output1.involvementRate).toStrictEqual(-1);

      // -------------------------------------
    
      // checking user/stats for stats of user 2
      // Expect Numchannels == 1
      expect(output2.Numchannels).toStrictEqual(1);

      // Expect dmsJoined == 2
      expect(output2.dmsJoined).toStrictEqual(2);

      // Expect messagesSent == 8
      expect(output2.messagesSent).toStrictEqual(8);

      // Expect involvementRate == Some Number
      expect(output2.involvementRate).toStrictEqual(-1);

      // -------------------------------------

      // checking user/stats for stats of user 3

      // Expect Numchannels == 0
      expect(output3.Numchannels).toStrictEqual(0);

      // Expect dmsJoined == 1
      expect(output3.dmsJoined).toStrictEqual(1);

      // Expect messagesSent == 3
      expect(output3.messagesSent).toStrictEqual(3);

      // Expect involvementRate == Some Number
      expect(output3.involvementRate).toStrictEqual(-1);

      // -------------------------------------

      // Removing dm1
      requestDmRemove(token1, dmId1);
      // Removing dm2
      requestDmRemove(token1, dmId2);
      // Removing user2 from channel1
      requestChannelLeaveV1(token2, channelId1);

      // -------------------------------------

      // Checking user/stats
      output1 = requestUserStats(token1); // user1
      output2 = requestUserStats(token2); // user2
      output3 = requestUserStats(token3); // user3

      // -------------------------------------

      // checking user/stats for stats of user 1
      // Expect Numchannels == 2
      expect(output1.Numchannels).toStrictEqual(2);

      // Expect dmsJoined == 0
      expect(output1.dmsJoined).toStrictEqual(0);

      // Expect messagesSent == 12
      expect(output1.messagesSent).toStrictEqual(12);

      // Expect involvementRate == Some Number
      expect(output1.involvementRate).toStrictEqual(-1);

      // -------------------------------------

      // checking user/stats for stats of user 2
      // Expect Numchannels == 0
      expect(output2.Numchannels).toStrictEqual(0);

      // Expect dmsJoined == 0
      expect(output2.dmsJoined).toStrictEqual(0);

      // Expect messagesSent == 8
      expect(output2.messagesSent).toStrictEqual(8);

      // Expect involvementRate == Some Number
      expect(output2.involvementRate).toStrictEqual(-1);

      // -------------------------------------

      // checking user/stats for stats of user 3

      // Expect Numchannels == 0
      expect(output3.Numchannels).toStrictEqual(0);

      // Expect dmsJoined == 0
      expect(output3.dmsJoined).toStrictEqual(0);

      // Expect messagesSent == 3
      expect(output3.messagesSent).toStrictEqual(3);

      // Expect involvementRate == Some Number
      expect(output3.involvementRate).toStrictEqual(-1);
      
    });
  
});

describe('Testing /users/stats/v1', () => {
    beforeEach(() => {
      requestClear();
    });

    test ('Testing if error is returned when token is invalid', () => {
        requestUsersStats('invalid-token').toStrictEqual(403);
    });
  
    test('Testing if user stats are returned correctly', () => {

      // Creating user1
      const user1 = createUser('testemail@email.com', 'testPassword123', 'testFirstName', 'testLastName');
      const token1 = user1.token;

      // Creating user2
      const user2 = createUser('testemail2@email.com', 'testPassword123', 'testFirstName', 'testLastName');
      const token2 = user2.token;

      // Creating user3
      const user3 = createUser('testemail3@email.com', 'testPassword123', 'testFirstName', 'testLastName');
      const token3 = user3.token;
      
      // -------------------------------------
      // Creating 2 channels with user1

      // Creating channel1 
      const channelId1 = createChannel(token1, "channel1", true).channelId;

      // Sending 3 messages in channel1 from user 1
      requestMessageSendV1(token1, channelId1, "Message");
      requestMessageSendV1(token1, channelId1, "Message");
      requestMessageSendV1(token1, channelId1, "Message");

      // Creating channel2 
      const channelId2 = createChannel(token1, "channel2", true).channelId;

      // Sending 3 messages in channel2 from user 1
      requestMessageSendV1(token1, channelId2, "Message");
      requestMessageSendV1(token1, channelId2, "Message");
      requestMessageSendV1(token1, channelId2, "Message");
    
      // -------------------------------------
      // Adding user2 in channel1
      
      requestChannelJoin(token2, channelId1);

      // Sending 2 messages in channel1 from user 2

      requestMessageSendV1(token2, channelId1, "Message");
      requestMessageSendV1(token2, channelId1, "Message");

      // -------------------------------------

      // RequestUserStats
      let output1 = requestUsersStats(token1); // workspace Stats
      
      // -------------------------------------

      // checking users/stats 
      // Expect channelsExist == 2
      expect(output1.channelsExist).toStrictEqual(2);

      // Expect dmsExist == 0
      expect(output1.dmsExist).toStrictEqual(0);

      // Expect messagesExist == 8
      expect(output1.messagesExist).toStrictEqual(8);

      // Expect utilizationRate == Some Number
      expect(output1.involvementRate).toStrictEqual(-1);
                
      // -------------------------------------
      // Create 2 Dms 

      // Getting uIds 
      const uId1 = getUId(user1.authUserId);
      const uId2 = getUId(user2.authUserId);
      const uId3 = getUId(user3.authUserId);

      // Creating dm1 - with user1, user2
      const dm1 = requestDmCreate(token1, [uId2]);
      const dmId1 = dm1.dmId;

      // -------------------------------------          
      // Sending 3 messages in dm1 from user 1
    
      requestMessageSendDmV1(token1, dmId1, "message");
      requestMessageSendDmV1(token1, dmId1, "message");
      requestMessageSendDmV1(token1, dmId1, "message");

      // Sending 3 messages in dm1 from user 2

      requestMessageSendDmV1(token2, dmId1, "message");
      requestMessageSendDmV1(token2, dmId1, "message");
      requestMessageSendDmV1(token2, dmId1, "message");
      
      // -------------------------------------
      // Creating dm2 - with user1, user2, user3
                
      const dm2 = requestDmCreate(token1, [uId2, uId3]);
      const dmId2 = dm2.dmId;

      // Sending 3 messages in dm2 from user 1
      requestMessageSendDmV1(token1, dmId2, "message");
      requestMessageSendDmV1(token1, dmId2, "message");
      requestMessageSendDmV1(token1, dmId2, "message");

      // Sending 3 messages in dm2 from user 2
      requestMessageSendDmV1(token2, dmId2, "message");
      requestMessageSendDmV1(token2, dmId2, "message");
      requestMessageSendDmV1(token2, dmId2, "message");

      // Sending 3 messages in dm2 from user 3
      requestMessageSendDmV1(token3, dmId2, "message");
      requestMessageSendDmV1(token3, dmId2, "message");
      requestMessageSendDmV1(token3, dmId2, "message");

      // -------------------------------------

      // Checking user/stats
      output1 = requestUsersStats(token1); // user1

      // -------------------------------------

      // checking users/stats 
      // Expect channelsExist == 2
      expect(output1.channelsExist).toStrictEqual(2);

      // Expect dmsExist == 2
      expect(output1.dmsExist).toStrictEqual(0);

      // Expect messagesExist == 23
      expect(output1.messagesExist).toStrictEqual(23);

      // Expect utilizationRate == Some Number
      expect(output1.involvementRate).toStrictEqual(-1);

      // -------------------------------------

      // Removing dm1
      requestDmRemove(token1, dmId1);
      // Removing dm2
      requestDmRemove(token1, dmId2);
      // Removing user2 from channel1
      requestChannelLeaveV1(token2, channelId1);

      // -------------------------------------

      // Checking user/stats
      output1 = requestUsersStats(token1); // user1

      // -------------------------------------

      // checking users/stats 
      // Expect channelsExist == 2
      expect(output1.channelsExist).toStrictEqual(2);

      // Expect dmsExist == 0
      expect(output1.dmsExist).toStrictEqual(0);

      // Expect messagesExist == 8
      expect(output1.messagesExist).toStrictEqual(8);

      // Expect utilizationRate == Some Number
      expect(output1.involvementRate).toStrictEqual(-1);

     
    });
  
}); 

/*
Helper Functions
*/

// Helper function - clear()
function requestClear() {
    request(
      'DELETE',
      `${hosturl}:${port}/clear/v1`
    );
}

// helper function - calls auth register through the server
const createUser = (emails: string, passwords: string, name: string, surname: string) => {
    const res = request(
      'POST', url + '/auth/register/v2',
      {
        body: JSON.stringify({ email: emails, password: passwords, nameFirst: name, nameLast: surname }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );

    

    return JSON.parse(String(res.getBody()));
};
  
// helper function - calls channelsCreate through the server
const createChannel = (tokens: string, names: string, publicity: boolean) => {
    const res = request(
      'POST',
      url + '/channels/create/v2',
      {
        body: JSON.stringify({ token: tokens, name: names, isPublic: publicity }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );
    return JSON.parse(String(res.getBody()));
};

// helper function - calls channel join and adds user to the channel
const requestChannelJoin = (tokens: string, channelIds: number) => {
    const res = request(
      'POST', url + '/channel/join/v2',
      {
        body: JSON.stringify({ token: tokens, channelId: channelIds }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );
    return JSON.parse(String(res.getBody()));
};

// helper function - requests dm create
function requestDmCreate(token: string, uIds: Array<number>) {
    const res = request(
      'POST',
      url + '/dm/create/v1',
      {
        body: JSON.stringify({
          token: token,
          uIds: uIds,
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );
    expect(res.statusCode).toStrictEqual(200);
    return JSON.parse(String(res.getBody()));
};

// helper function - DmRemove
function requestDmRemove(token: string, dmId: number) {
    const res = request(
      'DELETE',
      url + '/dm/remove/v1',
      {
        qs: {
          token: token,
          dmId: dmId
        }
      }
    );
    expect(res.statusCode).toStrictEqual(200);
    return JSON.parse(String(res.getBody()));
};

// helper function - MessageSend
function requestMessageSendV1(token: string, channelId: number, message: string) {
    const res = request(
      'POST',
      `${url}:${port}/message/send/v1`,
      {
        json: {
          token: token,
          channelId: channelId,
          message: message,
        }
      }
    );
  
    return JSON.parse(String(res.getBody())).messageId;
};

// helper function MessageSendDm
function requestMessageSendDmV1(token: string, dmId: number, message: string) {
    const res = request(
      'POST',
          `${url}:${port}/message/senddm/v1`,
          {
            json: {
              token: token,
              dmId: dmId,
              message: message,
            }
          }
    );
  
    return JSON.parse(String(res.getBody())).messageId;
};

// helper function - removeChannel
function requestChannelLeaveV1(token: string, channelId: number) {
    const res = request(
       'POST',
       url + '/channel/leave/v1',
    {
        body: JSON.stringify({
            token: token,
            channelId: channelId,
        }),
        headers: {
            'Content-type': 'application/json',
        },
    }
  );
  return JSON.parse(String(res.getBody()));
}

function requestUserStats(token: string) {
    const res = request(
        'GET',
        url + '/user/stats/v1',
      {
        headers: {
            token: token
        }
      }
   );

    if (res.statusCode !== 200) {
        return res.statusCode;
   
    }

    return JSON.parse(String(res.getBody()));
    
}

function requestUsersStats(token: string) {
    const res = request(
        'GET',
        url + '/users/stats/v1',
      {
        headers: {
            token: token
        }
      }
   );

    if (res.statusCode !== 200) {
        return res.statusCode;

    }
    
    return JSON.parse(String(res.getBody()));
    
}