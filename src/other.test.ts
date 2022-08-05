import request from 'sync-request';
import config from './config.json';
import { getUId } from './other'
import { createUser, createChannel, userType } from './channel.test';
import { messageSendV1, messageSendDmV1 } from './message';
import { dmCreateV2 } from './dm';
import { getUID } from './channel.test';
import { message } from './dataStore';

const OK = 200;
const FORBIDDEN = 403

const port = config.port;
const hosturl = config.url;
const url = hosturl + ':' + port;

/*
/////////////////////////////////////////////
///          Tests for clearV1()        /////
/////////////////////////////////////////////
*/

describe('Testing clearV1()', () => {
  test('', () => {
    request(
      'POST',
      url + '/auth/register/v3',
      {
        body: JSON.stringify({
          email: 'testemail@email.com',
          password: 'testPassword123',
          nameFirst: 'testFirstName',
          nameLast: 'testLastName'
        }),
        headers: {
          'Content-type': 'application/json',
        }
      }
    );

    const res2 = request(
      'DELETE',
      url + '/clear/v1',
      {
        qs: {},
      }
    );

    const body = JSON.parse(String(res2.getBody()));
    expect(body).toStrictEqual({});
    expect(res2.statusCode).toBe(OK);
    const res3 = request(
      'POST',
      url + '/auth/login/v3',
      {
        body: JSON.stringify({
          email: 'testemail@email.com',
          password: 'testPassword123',
        }),
        headers: {
          'Content-type': 'application/json',
        }
      }
    );
    expect(res3.statusCode).toBe(400);
  });
});

/*
/////////////////////////////////////////////
///         Tests for searchV1()        /////
/////////////////////////////////////////////
*/

function searchV1(token: string, queryStr: string) {
  const res = request(
    'GET',
        `${hosturl}:${port}/search/v1`,
        {
          qs: {
            queryStr: queryStr,
          },
          headers: {
            token: token,
          }
        }
  );
  if (res.statusCode !== 200) {
    return res.statusCode;
  }
  return JSON.parse(String(res.getBody()));
}

describe('testing for SearchV1', () => {
  let homer: userType, bart: userType, bartuId: number;

  beforeEach(() => {
    request('DELETE', url + '/clear/v1');
    homer = createUser('homer@gmail.com', 'testPassword123', 'homer', 'Brown');
    bart = createUser('bart@gmail.com', 'testPassword123', 'bart', 'Hayes');
    bartuId = getUID(bart.authUserId);
  });

  test('bad token', () => {
    expect(searchV1('bad token', 'search')).toEqual(403);
  });
  test('query string too short', () => {
    expect(searchV1(homer.token, '')).toEqual(400);
  });
  test('query string too long', () => {
    expect(searchV1(homer.token, `bljUwrWuzjLodaeOV97GSZ23rlzLz6AyqSZm5V9EgJLxVv8ZIIyQI6HV
    83X78XZaB53wCUVSUeuZpzOr9jpBEPxs4UR1qMZsX2DGR0P1GoRdugJ4F2Ct803XNlNMTFnQ6D5wwaokuKs
    CQquJYLcdDkbFrWW9xZQCglXWzvpJgD3ITaNIddcnpusRhbhv1MsxLpNmUl5yTSAQaGuYDV2IJypWHu3H1XD
    e6jqHnOsbXNskzMduAsNfpjl1aJTHsLjQnO77WIs0P9vjpho1ViZHqEC99wlRKdAbZjkxnD1Qdl2YVs1aoaAz
    GEpkXF04whQe1fPg3iVrqU8QQXzi9awrt15bh5zb9osrgfmIhpMkMRaZwOOQRqTXLaXeEwCRrSvSrV8Ck5zw
    HMg0qCRnMrpsytPw9j8i3JLHU8coVlANMSzjUw2qHh57gFRoxBci4fOmaS8OoLYXkl1Aa2hxMEB7rh22qrNy
    UrldCcRjDrJxsahsRLFRsc0aijDFT0tiDMFgFfuHwTvuw4Notdpozf9lQHVjuHIEjbB6t9eqP2Q6EBBxBr8bm
    7QzzKaLHbWsETyrRfQmjerJgTVcLpi9SxwQCHd1nqYjFchcBuVkwAiewsNFyAkSgSsOLbxxlf2SVV2XnCGPRL
    ICkJotjrzoD6uqZ6E4kwBKcpaUDJ4vEMRvaDgcuxMRzVrWibbzvrPJDSoKLiCXiKPSNla2FW0Lh5NP1smOuSxp
    p3we6nMpOjgu9PpevwCKfmRANMFa0lhOeKwOQTnAFsPOzPvZX3Jg07aZE0TkW4nD9Fkq0Jd0RrCelZS3OfEz
    xbQkJ0qQ0iu2BAdvuRKpwOFhjldgLgDytciqT4s7xVl4lwVRWvrdiZqBdyMf3aqJx1KfNgOzBPTpLVOu7bZ6
    tKP405NmY3lFhZrag6cXkdSAmEUibz4xNgJmPymwt5EF3geATfdYA8yHzz6K42wx`)).toEqual(400);
  });
  test('successful search', () => {
    const channelID = createChannel(homer.token, 'channel1', true);
    const dmID = dmCreateV2(homer.token, [bartuId]);
    messageSendV1(homer.token, channelID.channelId, 'I want to search for something!');
    messageSendDmV1(homer.token, dmID.dmId, 'I also want to search something!');
    messageSendDmV1(homer.token, dmID.dmId, 'This one shouldn\'t show up');
    const searchData: message[] = searchV1(homer.token, 'search');
    expect(searchData.length).toEqual(2);
  });
});

/*
/////////////////////////////////////////////
///     Tests for Notifications/get     /////
/////////////////////////////////////////////
*/

describe('Testing Notifications/get', () => {
  test('Testing if error is returned for invalid token', () => {
    except(requestGetNotifications('invalid-token')).toStrictEqual(FORBIDDEN);
  });

  test('Testing successful case', () => {
    // Creating user1
    const user1 = createUser('user1@email.com', 'Password123', 'Taylor', 'Armstrong');
    const token1 = user1.token;
    const uId1 = getUId(user1.authUserId);
    const handle1 = requestUserProfile(token1, uId1).handleStr;

    // creating user2
    const user2 = createUser('user2@email.com', 'Password123', 'Brandi', 'Glanville');
    const token2 = user2.token;
    const uId2 = getUId(user2.authUserId);
    const handle2 = requestUserProfile(token2, uId2).handleStr;

    // creating user3
    const user3 = createUser('user3@email.com', 'Password133', 'Andy', 'Cohen');
    const token3 = user3.token;
    const uId3 = getUId(user3.authUserId);
    const handle3 = requestUserProfile(token3, uId3).handleStr;

    // creating channel 1
    const channel1 = createChannel(token1, 'RHOBH S3', true);
    channelInvite(token1, channel1, uId3);

    // creating channel 2
    const channel2 = createChannel(token1, 'REUNION', true);
    channelInvite(token1, channel2, uId3);

    // Triggering notification 1 - creating dm1 
    const dm1 = requestDmCreate(token1, [uId2]); 
    const dm1Name = requestDmDetails(token1, dm1);

    // Triggering notification 2 -creating dm2 
    const dm2 = requestDmCreate(token3, [uId2]); //19
    const dm2Name = requestDmDetails(token3, dm2); 

    // Triggering Notification 3 - Inviting user2 to channel 1 
    channelInvite(token1, channel1, uId2); //18

    // Triggering Notification 4 - Inviting user2 to channel 2
    channelInvite(token1, channel2, uId2); //17

    // Triggering Notification 5 - Sending message tagging user2 in channel 1
    requestMessageSend(token1, channel1, `@${handle2} when does the book come out anyway?`); 

    // Triggering Notification 6 - Sending message tagging user2 in channel 1
    const message0 = requestMessageSend(token1, channel1, `it's been a hot minute!`);
    requestMessageEdit(token1, message0, `@${handle2} it's been a hot minute!`)

    // Triggering Notification 7 - Sending message tagging user2 in channel 2
    requestMessageSend(token3, channel2, `@${handle2} How are you doing and how is kennedy doing?`); 

    // Triggering Notification 8 - Sending message tagging user2 in channel 2
    requestMessageSend(token3, channel2, `@${handle2} He is a doctor of osteopathy that's how he is identified on the show, is he a therapist?`);
  
    // Triggering Notification 9 - Sending message tagging user2 in dm1
    requestMessageSendDm(token1, dm1, `@${handle2} When I get to my breaking point I fight back`);

    // Triggering Notification 10 - Sending message tagging user2 in dm1
    requestMessageSendDm(token1, dm1, `@${handle2} Kyle is a see you next tuesday`);

    // Triggering Notification 11 - Sending message tagging user2 in dm1
    requestMessageSendDm(token3, dm2, `@${handle2} Great job on RHUGT 2!`); 

    // Triggering Notification 12 - Sending message tagging user2 in dm1
    requestMessageSendDm(token3, dm2, `@${handle2} Do you want to move to OC?`); 

    // Sending messages from user2
    // Sending message in channel 1
    const message1 = requestMessageSend(token2, channel1, "It's none of your business");

    // Sending message in channel 2
    const message2 = requestMessageSend(token2, channel2, "It's difficult");
    const message3 = requestMessageSend(token2, channel2, "Yes he is not an MD");

    // Sending message in dm1
    const message4 = requestMessageSendDm(token2, dm1, "You are angry spice");

    // Sending message in dm2
    const message5 = requestMessageSendDm(token2, dm2, "Thanks andy");
    const message6 = requestMessageSendDm(token2, dm2, "Yes but as a friend of HW");

    // Triggering Notification 13, 14 - Reacting to user 2's message in channel 1
    requestMessageReact(token1, message1, 1);
    requestMessageReact(token3, message1, 1);

    // Triggering Notification 15, 16, 17, 18 - Reacting to user 2's message in channel 2
    requestMessageReact(token1, message2, 1);
    requestMessageReact(token3, message2, 1);

    requestMessageReact(token1, message3, 1);
    requestMessageReact(token3, message3, 1);

    // Triggering Notification 19 - Reacting to user 2's message in dm1
    requestMessageReact(token1, message4, 1);

    // Triggering Notification 20, 21 - Reacting to user 2's message in dm2
    requestMessageReact(token3, message5, 1);
    requestMessageReact(token3, message6, 1);

    // Testing if notifications returned match with triggering actions
    const notifications = requestGetNotifications(token2).notifications;
    
    // Testing notification 1
    expect(notifications[0].channelId).toStrictEqual(-1);
    expect(notifications[0].dmId).toStrictEqual(dm2);
    expect(notifications[0].notificationMessage).toStrictEqual(`${handle3} reacted to your message in ${dm2Name}`);

    // Testing notification 2
    expect(notifications[1].channelId).toStrictEqual(-1);
    expect(notifications[1].dmId).toStrictEqual(dm2);
    expect(notifications[1].notificationMessage).toStrictEqual(`${handle3} reacted to your message in ${dm2Name}`);

    // Testing notification 3
    expect(notifications[2].channelId).toStrictEqual(-1);
    expect(notifications[2].dmId).toStrictEqual(dm1);
    expect(notifications[2].notificationMessage).toStrictEqual(`${handle1} reacted to your message in ${dm1Name}`);

    // Testing notification 4
    expect(notifications[3].channelId).toStrictEqual(channel2);
    expect(notifications[3].dmId).toStrictEqual(-1);
    expect(notifications[3].notificationMessage).toStrictEqual(`${handle3} reacted to your message in REUNION`);

    // Testing notification 7
    expect(notifications[8].channelId).toStrictEqual(channel1);
    expect(notifications[8].dmId).toStrictEqual(-1);
    expect(notifications[8].notificationMessage).toStrictEqual(`${handle1} reacted to your message in RHOBH S3`);

    // Testing notification 10 
    expect(notifications[9].channelId).toStrictEqual(-1);
    expect(notifications[9].dmId).toStrictEqual(dm2);
    const expectedMessage1 = `${handle3} tagged you in ${dm2Name}: @${handle2} Do`
    expect((notifications[9].notificationMessage).search(expectedMessage1)).toStrictEqual(0);

    // Testing notification 12
    expect(notifications[11].channelId).toStrictEqual(-1);
    expect(notifications[11].dmId).toStrictEqual(dm1);
    const expectedMessage2 = `${handle1} tagged you in ${dm1Name}: @${handle2} Kyle`
    expect((notifications[11].notificationMessage).search(expectedMessage2)).toStrictEqual(0);

    // Testing notification 15
    expect(notifications[14].channelId).toStrictEqual(channel2);
    expect(notifications[14].dmId).toStrictEqual(-1);
    const expectedMessage2 = `${handle3} tagged you in REUNION: @${handle2} How`
    expect((notifications[14].notificationMessage).search(expectedMessage2)).toStrictEqual(0);

    // Testing notification 16
    expect(notifications[15].channelId).toStrictEqual(channel1);
    expect(notifications[15].dmId).toStrictEqual(-1);
    const expectedMessage2 = `${handle1} tagged you in RHOBH S3: @${handle2} it's`
    expect((notifications[15].notificationMessage).search(expectedMessage2)).toStrictEqual(0);

    // Testing notification 18
    expect(notifications[17].channelId).toStrictEqual(channel2);
    expect(notifications[17].dmId).toStrictEqual(-1);
    expect(notifications[17].notificationMessage).toStrictEqual(`${handle1} added you to REUNION`);

    // Testing notification 19
    expect(notifications[18].channelId).toStrictEqual(channel1);
    expect(notifications[18].dmId).toStrictEqual(-1);
    expect(notifications[18].notificationMessage).toStrictEqual(`${handle1} added you to RHOBH S3`);

    // Testing notification 20
    expect(notifications[19].channelId).toStrictEqual(-1);
    expect(notifications[19].dmId).toStrictEqual(dm2);
    expect(notifications[19].notificationMessage).toStrictEqual(`${handle3} added you to ${dm2Name}`);
  }); 



});

// Helper Functions 

/* Function to get Notifications from server
 PARAMETERS - 
  token : string 

  RETURN - 
  Error code:        Number (Incase of error)
  {notifications}:   An object containing an array of 
                     20 of the user's latest notifications

*/
function requestGetNotifications(token: string) {
  const res = request(
    'GET',
    url + '/notifications/get/v1',
    {
      headers: {
        token: token,
      }
    }
  )

  if (res.statusCode !== OK) {
    return (res.statusCode);
  }

  return (JSON.parse(String(res.getBody())));
}

// Helper Function - React to message
function requestMessageReact(token: string, messageId: number, reactId: number) {
  const res = request(
    'POST',
    url + '/message/react/v1',
    {
      body : JSON.stringify({
        messageId: messageId,
        reactId: reactId,
      }),
      headers: {
        token: token,
      }
    }
  )

  if (res.statusCode !== OK) {
    return (res.statusCode);
  }

  return (JSON.parse(String(res.getBody())));
}

// Helper function - creates a new user
const createUser = (emails: string, passwords: string, name: string, surname: string) => {
  const res = request(
    'POST', url + '/auth/register/v3',
    {
      body: JSON.stringify({ email: emails, password: passwords, nameFirst: name, nameLast: surname }),
      headers: {
        'Content-type': 'application/json',
      },
    }
  );

  if (res.statusCode !== OK) {
    return (res.statusCode);
  }

  return JSON.parse(String(res.getBody()));
};

// Helper Function creates a new channel
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

  if (res.statusCode !== OK) {
    return (res.statusCode);
  }

  return JSON.parse(String(res.getBody())).channelId;
};

// Helper function - Requests user profile
function requestUserProfile(token: string, uId: number) {
  const res = request(
    'GET',
    `${hosturl}:${port}/user/profile/v2`,
    {
      qs: {
        token: token,
        uId: uId
      },
    }
  );

  if (res.statusCode !== OK) {
    return (res.statusCode);
  }

  expect(res.statusCode).toBe(OK);
  return JSON.parse(String(res.getBody()));
}

function requestDmDetails(token: string, dmId: number) {
  const res = request(
    'GET',
    url + '/dm/details/v1',
    {
      qs: {
        token: user2.token,
        dmId: dm12.dmId,
      }
    }
  );

  if (res.statusCode !== OK) {
    return (res.statusCode);
  }

  expect(res.statusCode).toBe(OK);
  return JSON.parse(String(res.getBody()));
}

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

  if (res.statusCode !== OK) {
    return (res.statusCode);
  }

  expect(res.statusCode).toStrictEqual(200);
  return JSON.parse(String(res.getBody())).dmId;
}

const channelInvite = (tokens: string, channelIds: number, uIds: number) => {
  const res = request(
    'POST', url + '/channel/invite/v2',
    {
      body: JSON.stringify({ token: tokens, channelId: channelIds, uId: uIds }),
      headers: {
        'Content-type': 'application/json',
      },
    }
  );

  if (res.statusCode !== OK) {
    return (res.statusCode);
  }

  return JSON.parse(String(res.getBody()));
};

function requestMessageSend(token: string, channelId: number, message: string) {
  const res = request(
    'POST',
    `${hosturl}:${port}/message/send/v1`,
    {
      json: {
        token: token,
        channelId: channelId,
        message: message,
      }
    }
  );

  return JSON.parse(String(res.getBody())).messageId;
}

function requestMessageSendDm(token: string, dmId: number, message: string) {
  const res = request(
    'POST',
        `${hosturl}:${port}/message/senddm/v1`,
        {
          json: {
            token: token,
            dmId: dmId,
            message: message,
          }
        }
  );

  return JSON.parse(String(res.getBody())).messageId;
}

function requestMessageEdit(token: string, messageId: number, message: string) {
  return request(
    'PUT',
    `${hosturl}:${port}/message/edit/v1`,
    {
      json: {
        token: token,
        messageId: messageId,
        message: message,
      }
    }
  );
}