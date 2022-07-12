import { getUId } from './other';
import { getData } from './dataStore';
import { getChannel } from './channel';
import request from 'sync-request';
import { PORT, HOST } from './server';
import { dataStoreType } from './dataStore';

const url = 'http://' + HOST + ':' + PORT;

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
  
  // goes through server to call channelJoinV2
  const channelJoin = (tokens: string, channelIds: number) => {
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
  
  // goes through server to call channelInviteV2
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
    return JSON.parse(String(res.getBody()));
  };
  
  // goes through server to call addOwnerV1
  const addOwner = (tokens: string, channelIds: number, uIds: number) => {
    const res = request(
      'POST', url + '/channel/addowner/v1',
      {
        body: JSON.stringify({ token: tokens, channelId: channelIds, uId: uIds }),
        headers: { 'Content-type': 'application/json' }
      }
    );
    return JSON.parse(String(res.getBody()));
  };
  
  // goes through server to call removeOwnerV1
  const removeOwner = (tokens: string, channelIds: number, uIds: number) => {
    const res = request(
      'POST', url + '/channel/removeowner/v1',
      {
        body: JSON.stringify({ token: tokens, channelId: channelIds, uId: uIds }),
        headers: { 'Content-type': 'application/json' }
      }
    );
    return JSON.parse(String(res.getBody()));
  };
  
/*
// Testing for channelDetailsV1
describe('Testing channelDetailsV1', () => {
    let authUserId;
    let channelId;

    beforeEach(() => {
        authUserId = authRegisterV1('example123@email.com', 'password', 'John', 'Smith').authUserId;
        channelId = channelsCreateV1(authUserId, 'Channel 1', true).channelId;
    });

    afterEach(() => {
        clearV1();
    });

    test('Case 1: channelId does not refer to valid channel', () => {
        // Finding an invalid channelId to pass in
        const allChannels = channelsListallV1(authUserId).channels;
        let invalidId = 199;
        for (const i in allChannels) {
            if (invalidId === allChannels[i].channelId) {
                invalidId = invalidId + 100;
            }
        }

        const details = channelDetailsV1(authUserId, invalidId);
        expect(details).toStrictEqual({ error: 'error' });
    });

    test('Case 2: authorised user is not a member of channel', () => {
        const memberOf = channelsListV1(authUserId).channels;
        let notMemberId = 199;
        for (const i in memberOf) {
            if (notMemberId === memberOf[i].channelId) {
                notMemberId = notMemberId + 100;
            }
        }

        const details = channelDetailsV1(authUserId, notMemberId);
        expect(details).toStrictEqual({ error: 'error' });
    });

    test('Case 3: Deals with all valid arguments', () => {
        const details = channelDetailsV1(authUserId, channelId);
        expect(details).toStrictEqual({
            name: 'Channel 1',
            isPublic: true,
            ownerMembers: expect.any(Object),
            allMembers: expect.any(Object),
        })
    });

    test('Case 4: Deals with invalid/undefined inputs', () => {
        const details = channelDetailsV1('', '');
        expect(details).toStrictEqual({ error: 'error' });
    });
});

// Tests for channelMessagesV1
describe('Testing channelMessagesV1', () => {
    let authUserId;
    let channelId;

    beforeEach(() => {
        authUserId = authRegisterV1('example123@gmail.com', 'password', 'John', 'Smith').authUserId;
        channelId = channelsCreateV1(authUserId, 'Channel 1', true).channelId;
    });

    afterEach(() => {
        clearV1();
    });

    test('Case 1: channelId does not refer to valid channel', () => {
        // Finding an invalid channelId to pass in
        const allChannels = channelsListallV1(authUserId).channels;
        let invalidId = 199;
        for (const i in allChannels) {
            if (invalidId === allChannels[i].channelId) {
                invalidId = invalidId + 100;
            }
        }

        const start = 0;
        const messages = channelMessagesV1(authUserId, invalidId, start);
        expect(messages).toStrictEqual({ error: 'error' });
    });

    test('Case 2: authorised user is not a member of channel', () => {
        const memberOf = channelsListV1(authUserId).channels;
        let notMemberId = 199;
        for (const i in memberOf) {
            if (notMemberId === memberOf[i].channelId) {
                notMemberId = notMemberId + 100;
            }
        }

        const start = 0;
        const messages = channelMessagesV1(authUserId, notMemberId, start);
        expect(messages).toStrictEqual({ error: 'error' });
    });

    test('Case 3: start is greater than total messages in channel', () => {
        const start = 1;
        const messages = channelMessagesV1(authUserId, channelId, start);
        expect(messages).toStrictEqual({ error: 'error' });
    });

    test('Case 4: All valid arguments', () => {
        const start = 0;
        const messages = channelMessagesV1(authUserId, channelId, start);
        expect(messages).toStrictEqual({
            messages: [],
            start: 0,
            end: -1,
        })
    })

    test('Case 5: Deals with invalid/undefined inputs', () => {
        const messages = channelMessagesV1('', '', '');
        expect(messages).toStrictEqual({ error: 'error' });
    });
});
*/

/// /////////////////////////////////////////////
/// //     Tests for channelJoinV2()        /////
/// /////////////////////////////////////////////

describe('Testing channelJoinV2', () => {
    let james, rufus, publicChannel, privateChannel, rufusPrivateChannel;

  beforeEach(() => {
    request('DELETE', url + '/clear/v1');

    james = createUser('james@gmail.com', 'testPassword123', 'James', 'Brown');
    rufus = createUser('rufus@gmail.com', 'testPassword123', 'Rufus', 'Hayes');
    publicChannel = createChannel(james.token, 'testChannel1', true);
    privateChannel = createChannel(james.token, 'testChannel2', false);
    rufusPrivateChannel = createChannel(rufus.token, 'testChannel3', false);
  });

  test('channelId does not refer to a valid channel', () => {
    expect(channelJoin(rufus.token, -100)).toEqual({ error: 'error' });
  });
  test('the user is already a channel member', () => {
    expect(channelJoin(james.token, publicChannel.channelId)).toEqual({ error: 'error' });
  });
  test('the channel is private and user is not global owner', () => {
    expect(channelJoin(rufus.token, privateChannel.channelId)).toEqual({ error: 'error' });
  });
  test('the channel is private and the user is a global owner', () => {
    expect(channelJoin(james.token, rufusPrivateChannel.channelId)).toEqual({});
  });
  test('successful add', () => {
    expect(channelJoin(rufus.token, publicChannel.channelId)).toEqual({});
  });
});

/// /////////////////////////////////////////////
/// //     Tests for channelInviteV2()      /////
/// /////////////////////////////////////////////

describe('Testing channelInviteV2', () => {
    let tom, ralph, alex, general, ralphChannel, ralphuId;
  beforeEach(() => {
    request('DELETE', url + '/clear/v1');

    tom = createUser('tom@gmail.com', 'testPassword123', 'tom', 'Brown');
    ralph = createUser('ralph@gmail.com', 'testPassword123', 'ralph', 'Hayes');
    ralphuId = getUId(ralph.authUserId);
    alex = createUser('alex@gmail.com', 'testPassword123', 'Alex', 'King');
    general = createChannel(tom.token, 'testChannel1', true);
    ralphChannel = createChannel(ralph.token, 'testChannel2', true);
  });

  test('channelId does not refer to a valid channel', () => {
    expect(channelInvite(tom.token, -100, ralphuId)).toEqual({ error: 'error' });
  });
  test('user joining does not exist', () => {
    expect(channelInvite(tom.token, general.channelId, -100)).toEqual({ error: 'error' });
  });
  test('trying to invite existing channel member', () => {
    channelJoin(alex.token, ralphChannel);
    expect(channelInvite(alex.token, general.channelId, ralphuId)).toEqual({ error: 'error' });
  });
  test('user inviting is not a member of the channel', () => {
    expect(channelInvite(alex.token, general.channelId, ralphuId)).toEqual({ error: 'error' });
  });
  test('successful case', () => {
    expect(channelInvite(tom.token, general.channelId, ralphuId)).toEqual({});
  });
});

/// /////////////////////////////////////////////
/// //     Tests for addChannelOwnerV1()    /////
/// /////////////////////////////////////////////

describe('Testing addChannelOwnerV1', () => {
    let steven, richard, lily, richarduId, lilyuId, richardChannel, publicChannel;

   beforeEach(() => {
    request('DELETE', url + '/clear/v1');

    steven = createUser('steven@gmail.com', 'testPassword123', 'steven', 'Brown');
    richard = createUser('richard@gmail.com', 'testPassword123', 'richard', 'Hayes');
    lily = createUser('lily@gmail.com', 'testPassword123', 'lily', 'King');
    richarduId = getUId(richard.authUserId);
    lilyuId = getUId(lily.authUserId);

    publicChannel = createChannel(steven.token, 'testChannel1', true);
    richardChannel = createChannel(richard.token, 'testChannel2', true);

    channelJoin(lily.token, publicChannel.channelId);
    channelJoin(richard.token, publicChannel.channelId);
  });

  test('channelId does not refer to a valid channel', () => {
    expect(addOwner(richard.token, -100, lilyuId)).toEqual({ error: 'error' });
  });
  test('user becoming owner is an invalid user', () => {
    expect(addOwner(richard.token, richardChannel.channelId, -100)).toEqual({ error: 'error' });
  });
  test('user becoming owner is not a member of the channel', () => {
    expect(addOwner(richard.token, richardChannel.channelId, lilyuId)).toEqual({ error: 'error' });
  });
  test('the user adding the new owner is not a global owner or channel owner, but is in the channel', () => {
    expect(addOwner(richard.token, publicChannel.channelId, lilyuId)).toEqual({ error: 'error' });
  });
  test('successful case', () => {
    expect(addOwner(steven.token, publicChannel.channelId, lilyuId)).toEqual({});
  });
});

/// /////////////////////////////////////////////
/// //   Tests for removeChannelOwnerV1()   /////
/// /////////////////////////////////////////////

describe('Testing removeChannelOwnerV1', () => {
    let homer, bart, marge, bartuId, margeuId, bartChannel;

  beforeEach(() => {
    request('DELETE', url + '/clear/v1');

    homer = createUser('homer@gmail.com', 'testPassword123', 'homer', 'Brown');
    bart = createUser('bart@gmail.com', 'testPassword123', 'bart', 'Hayes');
    marge = createUser('marge@gmail.com', 'testPassword123', 'marge', 'King');
    bartuId = getUId(bart.authUserId);
    margeuId = getUId(marge.authUserId);

    bartChannel = createChannel(bart.token, 'testChannel2', true);
    channelJoin(marge.token, bartChannel.channelId);
    channelJoin(homer.token, bartChannel.channelId);
  });

  test('channelId does not refer to a valid channel', () => {
    expect(removeOwner(homer.token, -100, bartuId)).toEqual({ error: 'error' });
  });
  test('user being removed as owner does not exist', () => {
    expect(removeOwner(homer.token, bartChannel.channelId, -100)).toEqual({ error: 'error' });
  });
  test('trying to remove an owner who is the only channel owner', () => {
    expect(removeOwner(homer.token, bartChannel.channelId, bartuId)).toEqual({ error: 'error' });
  });
  test('user being removed as owner is not currently owner', () => {
    expect(removeOwner(bart.token, bartChannel.channelId, margeuId)).toEqual({ error: 'error' });
  });
  test('user attempting to remove owner lacks permissions', () => {
    expect(removeOwner(marge.token, bartChannel.channelId, bartuId)).toEqual({ error: 'error' });
  });
  test('successful case', () => {
    addOwner(bart.token, bartChannel.channelId, margeuId);
    let data: dataStoreType = getData();
    const channel = getChannel(bartChannel.channelId, data.channels);
    console.log(channel.ownerMembers)
    expect(removeOwner(bart.token, bartChannel.channelId, margeuId)).toEqual({});
  });
});

// assumption - both global and channel owners can add and remove themselves as channel owners


export { createChannel, createUser, channelJoin };
