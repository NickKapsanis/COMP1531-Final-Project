import request from 'sync-request';
import config from './config.json';

type userType = {
  token? : string;
  authUserId? : number;
}

const port = config.port;
const hosturl = config.url;
const url = hosturl + ':' + port;

const OK = 200;
const BAD_REQ = 400;
const FORBID = 403;

// Testing for channelDetailsV3
describe('Testing channelDetailsV3', () => {
  let token1: string;
  let token2: string;
  let channelId1: number;
  let channelId2: number;

  beforeEach(() => {
    token1 = createUser('example123@email.com', 'password1', 'John', 'Smith').token;
    channelId1 = createChannel(token1, 'Channel 1', true).channelId;
    token2 = createUser('example456@email.com', 'password2', 'Jane', 'Citizen').token;
    channelId2 = createChannel(token2, 'Channel 2', true).channelId;
  });

  afterEach(() => {
    requestClearV1();
  });

  test('Case 1: channelId does not refer to valid channel', () => {
    // Finding an invalid channelId to pass in
    const allChannels = requestChannelsListallV3(token1).channels;
    let invalidId = 199;
    for (const i in allChannels) {
      if (invalidId === allChannels[i].channelId) {
        invalidId = invalidId + 100;
      }
    }

    const res = requestChannelDetailsV3(token1, invalidId);
    expect(res.statusCode).toBe(BAD_REQ);
  });

  test('Case 2: user is not a member of channel', () => {
    const res = requestChannelDetailsV3(token1, channelId2);
    expect(res.statusCode).toBe(FORBID);
  });

  test('Case 3: Deals with all valid arguments', () => {
    const res = requestChannelDetailsV3(token1, channelId1);
    const bodyObj = JSON.parse(String(res.getBody()));

    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({
      name: 'Channel 1',
      isPublic: true,
      ownerMembers: expect.any(Object),
      allMembers: expect.any(Object),
    });
  });

  test('Case 4: Deals with invalid token', () => {
    const res = requestChannelDetailsV3('invalid-token', channelId1);
    expect(res.statusCode).toBe(FORBID);
  });
});

// Helper function for HTTP calls for channelDetailsV2
function requestChannelDetailsV3(token: string, channelId: number) {
  return request(
    'GET',
    `${hosturl}:${port}/channel/details/v3`,
    {
      qs: {
        channelId: channelId,
      },
      headers: {
        token: token,
      },
    }
  );
}

// Tests for channelMessagesV3
describe('Testing channelMessagesV3', () => {
  let token1: string;
  let token2: string;
  let channelId1: number;
  let channelId2: number;

  beforeEach(() => {
    token1 = createUser('example123@email.com', 'password1', 'John', 'Smith').token;
    channelId1 = createChannel(token1, 'Channel 1', true).channelId;
    token2 = createUser('example456@email.com', 'password2', 'Jane', 'Citizen').token;
    channelId2 = createChannel(token2, 'Channel 2', true).channelId;
  });

  afterEach(() => {
    requestClearV1();
  });

  test('Case 1: channelId does not refer to valid channel', () => {
    // Finding an invalid channelId to pass in
    const allChannels = requestChannelsListallV3(token1).channels;
    let invalidId = 199;
    for (const i in allChannels) {
      if (invalidId === allChannels[i].channelId) {
        invalidId = invalidId + 100;
      }
    }

    const start = 0;
    const res = requestChannelMessagesV3(token1, invalidId, start);
    expect(res.statusCode).toBe(BAD_REQ);
  });

  test('Case 2: authorised user is not a member of channel', () => {
    const start = 0;
    const res = requestChannelMessagesV3(token1, channelId2, start);
    expect(res.statusCode).toBe(FORBID);
  });

  test('Case 3: start is greater than total messages in channel', () => {
    const start = 1;
    const res = requestChannelMessagesV3(token1, channelId1, start);
    expect(res.statusCode).toBe(BAD_REQ);
  });

  test('Case 4: All valid arguments', () => {
    const start = 0;
    const res = requestChannelMessagesV3(token1, channelId1, start);
    const bodyObj = JSON.parse(String(res.getBody()));

    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({
      messages: [],
      start: 0,
      end: -1,
    });
  });

  test('Case 5: Deals with 50+ messages', () => {
    for (let i = 0; i < 55; i++) {
      requestMessageSendV2(token1, channelId1, `${i}`);
    }
    const start = 0;
    const res = requestChannelMessagesV3(token1, channelId1, start);
    const bodyObj = JSON.parse(String(res.getBody()));

    expect(res.statusCode).toBe(OK);
    expect(bodyObj.messages.length).toStrictEqual(50);
    expect(bodyObj.messages[0].message).toStrictEqual('54');
    expect(bodyObj.start).toStrictEqual(0);
    expect(bodyObj.end).toStrictEqual(50);
  });

  test('Case 6: Deals with invalid token', () => {
    const start = 0;
    const res = requestChannelMessagesV3('invalid-token', channelId1, start);
    expect(res.statusCode).toBe(FORBID);
  });
});

// Helper function for HTTP calls for channelMessagesV2
export function requestChannelMessagesV3(token: string, channelId: number, start: number) {
  return request(
    'GET',
    `${hosturl}:${port}/channel/messages/v3`,
    {
      qs: {
        channelId: channelId,
        start: start,
      },
      headers: {
        token: token,
      },
    }
  );
}

/// /////////////////////////////////////////////
/// //     Tests for channelJoinV3()        /////
/// /////////////////////////////////////////////

describe('Testing channelJoinV3', () => {
  let james: userType, rufus: userType;
  let publicChannel: { channelId: number }, privateChannel: { channelId: number }, rufusPrivateChannel: { channelId: number };

  beforeEach(() => {
    request('DELETE', url + '/clear/v1');

    james = createUser('james@gmail.com', 'testPassword123', 'James', 'Brown');
    rufus = createUser('rufus@gmail.com', 'testPassword123', 'Rufus', 'Hayes');
    publicChannel = createChannel(james.token, 'testChannel1', true);
    privateChannel = createChannel(james.token, 'testChannel2', false);
    rufusPrivateChannel = createChannel(rufus.token, 'testChannel3', false);
  });

  test('channelId does not refer to a valid channel', () => {
    expect(channelJoin(rufus.token, -100)).toEqual(400);
  });
  test('bad token', () => {
    expect(channelJoin('yippee', publicChannel.channelId)).toEqual(403);
  });
  test('the user is already a channel member', () => {
    expect(channelJoin(james.token, publicChannel.channelId)).toEqual(400);
  });
  test('the channel is private and user is not global owner', () => {
    expect(channelJoin(rufus.token, privateChannel.channelId)).toEqual(403);
  });
  test('the channel is private and the user is a global owner', () => {
    expect(channelJoin(james.token, rufusPrivateChannel.channelId)).toEqual({});
  });
  test('successful add', () => {
    expect(channelJoin(rufus.token, publicChannel.channelId)).toEqual({});
  });
});

/// /////////////////////////////////////////////
/// //     Tests for channelInviteV3()      /////
/// /////////////////////////////////////////////

describe('Testing channelInviteV3', () => {
  let tom: userType, ralph: userType, alex: userType, general: { channelId: number }, ralphChannel: { channelId: number }, ralphuId: number;
  beforeEach(() => {
    request('DELETE', url + '/clear/v1');

    tom = createUser('tom@gmail.com', 'testPassword123', 'tom', 'Brown');
    ralph = createUser('ralph@gmail.com', 'testPassword123', 'ralph', 'Hayes');
    ralphuId = getUID(ralph.authUserId);
    alex = createUser('alex@gmail.com', 'testPassword123', 'Alex', 'King');
    general = createChannel(tom.token, 'testChannel1', true);
    ralphChannel = createChannel(ralph.token, 'testChannel2', true);
  });

  test('channelId does not refer to a valid channel', () => {
    expect(channelInvite(tom.token, -100, ralphuId)).toEqual(400);
  });
  test('bad uId', () => {
    expect(channelInvite(tom.token, general.channelId, -100)).toEqual(400);
  });
  test('bad token', () => {
    expect(channelInvite('arghh', general.channelId, -100)).toEqual(403);
  });
  test('trying to invite existing channel member', () => {
    channelJoin(alex.token, ralphChannel.channelId);
    expect(channelInvite(alex.token, ralphChannel.channelId, ralphuId)).toEqual(400);
  });
  test('user inviting is not a member of the channel', () => {
    expect(channelInvite(alex.token, general.channelId, ralphuId)).toEqual(403);
  });
  test('successful case', () => {
    expect(channelInvite(tom.token, general.channelId, ralphuId)).toEqual({});
  });
});

/// /////////////////////////////////////////////
/// //     Tests for addChannelOwnerV2()    /////
/// /////////////////////////////////////////////

describe('Testing addChannelOwnerV2', () => {
  let steven: userType, stevenuId:number, richard: userType, lily: userType, lilyuId: number, richardChannel: { channelId: number }, publicChannel: { channelId: number };

  beforeEach(() => {
    request('DELETE', url + '/clear/v1');

    steven = createUser('steven@gmail.com', 'testPassword123', 'steven', 'Brown');
    richard = createUser('richard@gmail.com', 'testPassword123', 'richard', 'Hayes');
    lily = createUser('lily@gmail.com', 'testPassword123', 'lily', 'King');
    lilyuId = getUID(lily.authUserId);
    stevenuId = getUID(steven.authUserId);

    publicChannel = createChannel(steven.token, 'testChannel1', true);
    richardChannel = createChannel(richard.token, 'testChannel2', true);

    channelJoin(lily.token, publicChannel.channelId);
    channelJoin(richard.token, publicChannel.channelId);
  });

  test('bad ChannelID', () => {
    expect(addOwner(richard.token, -100, lilyuId)).toEqual(400);
  });
  test('bad UID', () => {
    expect(addOwner(richard.token, richardChannel.channelId, -100)).toEqual(400);
  });
  test('user becoming owner is not a member of the channel', () => {
    expect(addOwner(richard.token, richardChannel.channelId, lilyuId)).toEqual(400);
  });
  test('user is already a channel owner', () => {
    channelJoin(lily.token, richardChannel.channelId);
    addOwner(richard.token, richardChannel.channelId, lilyuId);
    expect(addOwner(richard.token, richardChannel.channelId, lilyuId)).toEqual(400);
  });
  test('the user adding the new owner is not a global owner or channel owner, but is in the channel', () => {
    channelJoin(lily.token, richardChannel.channelId);
    channelJoin(steven.token, richardChannel.channelId);
    expect(addOwner(lily.token, richardChannel.channelId, stevenuId)).toEqual(403);
  });
  test('the user adding the new owner is a global owner but is not in the channel', () => {
    expect(addOwner(richard.token, publicChannel.channelId, lilyuId)).toEqual(403);
  });
  test('bad token', () => {
    expect(addOwner('gabagoo', publicChannel.channelId, lilyuId)).toEqual(403);
  });
  test('successful case', () => {
    expect(addOwner(steven.token, publicChannel.channelId, lilyuId)).toEqual({});
  });
});

/// /////////////////////////////////////////////
/// //   Tests for removeChannelOwnerV2()   /////
/// /////////////////////////////////////////////

describe('Testing removeChannelOwnerV2', () => {
  let homer: userType, homeruId: number, bart: userType, marge: userType, bartuId: number, margeuId: number, bartChannel: { channelId: number };

  beforeEach(() => {
    request('DELETE', url + '/clear/v1');

    homer = createUser('homer@gmail.com', 'testPassword123', 'homer', 'Brown');
    bart = createUser('bart@gmail.com', 'testPassword123', 'bart', 'Hayes');
    marge = createUser('marge@gmail.com', 'testPassword123', 'marge', 'King');
    bartuId = getUID(bart.authUserId);
    margeuId = getUID(marge.authUserId);
    homeruId = getUID(homer.authUserId);

    bartChannel = createChannel(bart.token, 'testChannel2', true);
    channelJoin(marge.token, bartChannel.channelId);
    channelJoin(homer.token, bartChannel.channelId);
  });

  test('bad ChannelID', () => {
    expect(removeOwner(homer.token, -100, bartuId)).toEqual(400);
  });
  test('bad UID', () => {
    expect(removeOwner(homer.token, bartChannel.channelId, -100)).toEqual(400);
  });
  test('trying to remove an owner who is the only channel owner', () => {
    expect(removeOwner(homer.token, bartChannel.channelId, bartuId)).toEqual(400);
  });
  test('user being removed as owner is not currently owner', () => {
    expect(removeOwner(bart.token, bartChannel.channelId, margeuId)).toEqual(400);
  });
  // doesn't work
  test('user attempting to remove owner lacks permissions', () => {
    addOwner(bart.token, bartChannel.channelId, homeruId);
    expect(removeOwner(marge.token, bartChannel.channelId, bartuId)).toEqual(403);
  });
  test('user attempting to remove owner is not a member of the channel', () => {
    const margeChannel: { channelId: number } = createChannel(marge.token, 'testChannel2', true);
    channelJoin(homer.token, margeChannel.channelId);
    addOwner(marge.token, margeChannel.channelId, homeruId);
    expect(removeOwner(bart.token, margeChannel.channelId, margeuId)).toEqual(403);
  });
  test('bad token', () => {
    expect(removeOwner('ruh roh', bartChannel.channelId, margeuId)).toEqual(403);
  });
  test('successful case', () => {
    addOwner(bart.token, bartChannel.channelId, margeuId);
    expect(removeOwner(bart.token, bartChannel.channelId, margeuId)).toEqual({});
  });
});

/// /////////////////////////////////////////////
/// /////////Tests for channelLeaveV1()//////////
/// /////////////////////////////////////////////

test('tests invalid token case', () => {
  request('DELETE', url + '/clear/v1');

  const james = createUser('james@gmail.com', 'testPassword123', 'James', 'Brown');

  const testCreatedChannel = createChannel(james.token, 'testChannel1', true).channelId;

  const res = request(
    'POST',
    url + '/channel/leave/v2',
    {
      body: JSON.stringify({
        channelId: testCreatedChannel,
      }),
      headers: {
        'Content-type': 'application/json',
        token: 'someInvalidToken',
      },
    }
  );
  expect(res.statusCode).toBe(FORBID);
});

test('tests the case that user isnt in the given channel', () => {
  request('DELETE', url + '/clear/v1');

  const james = createUser('james@gmail.com', 'testPassword123', 'James', 'Brown');
  const rufus = createUser('rufus@gmail.com', 'testPassword123', 'Rufus', 'Green');

  const testCreatedChannel = createChannel(james.token, 'testChannel1', true).channelId;

  const res = request(
    'POST',
    url + '/channel/leave/v2',
    {
      body: JSON.stringify({
        channelId: testCreatedChannel,
      }),
      headers: {
        'Content-type': 'application/json',
        token: rufus.token,
      },
    }
  );
  expect(res.statusCode).toBe(FORBID);
});

test('tests the case with only given user in channel', () => {
  request('DELETE', url + '/clear/v1');

  const james = createUser('james@gmail.com', 'testPassword123', 'James', 'Brown');
  const testCreatedChannel = createChannel(james.token, 'testChannel1', true).channelId;

  const res = request(
    'POST',
    url + '/channel/leave/v2',
    {
      body: JSON.stringify({
        channelId: testCreatedChannel,
      }),
      headers: {
        'Content-type': 'application/json',
        token: james.token,
      },
    }
  );
  expect(res.statusCode).toBe(OK);
});

test('tests the general case, channel with multiple people.', () => {
  request('DELETE', url + '/clear/v1');

  const james = createUser('james@gmail.com', 'testPassword123', 'James', 'Brown');
  const rufus = createUser('rufus@gmail.com', 'testPassword123', 'Rufus', 'Green');
  const testCreatedChannel = createChannel(james.token, 'testChannel1', true).channelId;
  channelJoin(rufus.token, testCreatedChannel);

  // james and rufus are both in the channel at this point.

  const res = request(
    'POST',
    url + '/channel/leave/v2',
    {
      body: JSON.stringify({
        channelId: testCreatedChannel,
      }),
      headers: {
        token: rufus.token,
        'Content-type': 'application/json',
      },
    }
  );
  expect(res.statusCode).toBe(OK);
});

test('tests the multiple channels and multiple people.', () => {
  request('DELETE', url + '/clear/v1');

  const james = createUser('james@gmail.com', 'testPassword123', 'James', 'Brown');
  const rufus = createUser('rufus@gmail.com', 'testPassword123', 'Rufus', 'Green');
  const alex = createUser('alex@gmail.com', 'testPassword123', 'Alex', 'John');
  const testCreatedChannel = createChannel(james.token, 'testChannel1', true).channelId;
  const secondTestCreatedChannel = createChannel(james.token, 'testChannel1', true).channelId;
  channelJoin(rufus.token, testCreatedChannel);
  channelJoin(alex.token, secondTestCreatedChannel);

  // james, rufus in testCreatedChannel
  // james, alex in secondTestCreatedChannel

  const res = request(
    'POST',
    url + '/channel/leave/v2',
    {
      body: JSON.stringify({
        channelId: testCreatedChannel,
      }),
      headers: {
        token: james.token,
        'Content-type': 'application/json',
      },
    }
  );
  expect(res.statusCode).toBe(OK);
});

// assumption - both global and channel owners can add and remove themselves as channel owners

/// /////////////////////////////////////////////////////////////////////////////
/// /////////////////////////////////////////////////////////////////////////////
/// /////////////////////        Helper Functions       /////////////////////////
/// /////////////////////////////////////////////////////////////////////////////
/// /////////////////////////////////////////////////////////////////////////////

function requestChannelsListallV3(token: string) {
  const res = request(
    'GET',
        `${hosturl}:${port}/channels/listall/v3`,
        {
          headers: {
            token: token,
          }
        }
  );

  return JSON.parse(String(res.getBody()));
}

function requestMessageSendV2(token: string, channelId: number, message: string) {
  const res = request(
    'POST',
    `${hosturl}:${port}/message/send/v2`,
    {
      json: {
        channelId: channelId,
        message: message,
      },
      headers: {
        token: token,
      }
    }
  );

  return JSON.parse(String(res.getBody())).messageId;
}

function requestClearV1() {
  const res = request(
    'DELETE',
        `${hosturl}:${port}/clear/v1`
  );

  return JSON.parse(String(res.getBody()));
}

const getUID = (authUserId: number) => {
  const res = request(
    'POST', url + '/other/getUID/v1',
    {
      body: JSON.stringify({ authUserId: authUserId }),
      headers: {
        'Content-type': 'application/json',
      },
    }
  );
  return JSON.parse(String(res.getBody()));
};

// helper function - calls auth register through the server
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
  return JSON.parse(String(res.getBody()));
};

// helper function - calls channelsCreate through the server
const createChannel = (tokens: string, names: string, publicity: boolean) => {
  const res = request(
    'POST',
    url + '/channels/create/v3',
    {
      body: JSON.stringify({ name: names, isPublic: publicity }),
      headers: {
        token: tokens,
        'Content-type': 'application/json',
      },
    }
  );
  return JSON.parse(String(res.getBody()));
};

// goes through server to call channelJoinV3
const channelJoin = (tokens: string, channelIds: number) => {
  const res = request(
    'POST', url + '/channel/join/v3',
    {
      body: JSON.stringify({ channelId: channelIds }),
      headers: {
        token: tokens,
        'Content-type': 'application/json',
      },
    }
  );
  if (res.statusCode !== 200) {
    return res.statusCode;
  }
  return JSON.parse(String(res.getBody()));
};

// goes through server to call channelInviteV3
const channelInvite = (tokens: string, channelIds: number, uIds: number) => {
  const res = request(
    'POST', url + '/channel/invite/v3',
    {
      body: JSON.stringify({ channelId: channelIds, uId: uIds }),
      headers: {
        token: tokens,
        'Content-type': 'application/json',
      },
    }
  );
  if (res.statusCode !== 200) {
    return res.statusCode;
  }
  return JSON.parse(String(res.getBody()));
};

// goes through server to call addOwnerV2
const addOwner = (tokens: string, channelIds: number, uIds: number) => {
  const res = request(
    'POST', url + '/channel/addowner/v2',
    {
      body: JSON.stringify({ channelId: channelIds, uId: uIds }),
      headers: {
        'Content-type': 'application/json',
        token: tokens,
      },
    }
  );
  if (res.statusCode !== 200) {
    return res.statusCode;
  }
  return JSON.parse(String(res.getBody()));
};

// goes through server to call removeOwnerV2
const removeOwner = (tokens: string, channelIds: number, uIds: number) => {
  const res = request(
    'POST', url + '/channel/removeowner/v2',
    {
      body: JSON.stringify({ channelId: channelIds, uId: uIds }),
      headers: {
        'Content-type': 'application/json',
        token: tokens,
      }
    }
  );
  if (res.statusCode !== 200) {
    return res.statusCode;
  }
  return JSON.parse(String(res.getBody()));
};

export { createChannel, createUser, channelJoin, getUID, userType };
