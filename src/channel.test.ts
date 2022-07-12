import { getUId } from './other';
import request from 'sync-request';
import { PORT, HOST } from './server';

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
let james, rufus, publicChannel, privateChannel, rufusPrivateChannel, rufusChannel;
let tom, ralph, alex, general, ralphChannel;

describe('Testing channelJoinV2', () => {
    james = createUser('james@gmail.com', 'testPassword123', 'James', 'Brown');
    rufus = createUser('rufus@gmail.com', 'testPassword123', 'Rufus', 'Hayes');
    publicChannel = createChannel(james.token, 'testChannel1', true);
    privateChannel = createChannel(james.token, 'testChannel2', false);
    rufusPrivateChannel = createChannel(rufus.token, 'testChannel3', false);

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
    let ralphuId;
  beforeEach(() => {
    request('DELETE', url + '/clear/v1');

    tom = createUser('tom@gmail.com', 'testPassword123', 'tom', 'Brown');
    ralph = createUser('ralph@gmail.com', 'testPassword123', 'ralph', 'Hayes');
    ralphuId = getUId(ralph.authUserId);
    alex = createUser('alex@gmail.com', 'testPassword123', 'Alex', 'King');
    general = createChannel(tom.token, 'testChannel1', true);
    ralphChannel = createChannel(ralph.token, 'testChannel2', true);

    console.log(ralphuId);
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
/*
/// /////////////////////////////////////////////
/// //     Tests for addChannelOwnerV1()    /////
/// /////////////////////////////////////////////

describe('Testing addChannelOwnerV1', () => {

  afterEach(() => {
    request('DELETE', url + '/clear/v1');

    james = createUser('james@gmail.com', 'testPassword123', 'James', 'Brown');
    rufus = createUser('rufus@gmail.com', 'testPassword123', 'Rufus', 'Hayes');
    alex = createUser('alex@gmail.com', 'testPassword123', 'Alex', 'King');

    publicChannel = createChannel(james.token, 'testChannel1', true);
    rufusChannel = createChannel(rufus.token, 'testChannel2', true);

    channelJoin(alex.token, publicChannel.channelId);
    channelJoin(rufus.token, publicChannel.channelId);
  });

  test('channelId does not refer to a valid channel', () => {
    expect(addOwner(rufus.token, -100, alex.uId)).toEqual({ error: 'error' });
  });
  test('user becoming owner is an invalid user', () => {
    expect(addOwner(rufus.token, rufusChannel.channelId, -100)).toEqual({ error: 'error' });
  });
  test('user becoming owner is not a member of the channel', () => {
    expect(addOwner(james.token, publicChannel.channelId, alex.uId)).toEqual({ error: 'error' });
  });
  test('user becoming owner is not a member of the channel', () => {
    expect(addOwner(rufus.token, rufusChannel.channelId, alex.uId)).toEqual({ error: 'error' });
  });
  test('the user adding the new owner is not a global owner or channel owner, but is in the channel', () => {
    expect(addOwner(rufus.token, publicChannel.channelId, alex.uId)).toEqual({ error: 'error' });
  });
  test('successful case', () => {
    expect(addOwner(james.token, publicChannel.channelId, alex.uId)).toEqual({});
  });
});

/// /////////////////////////////////////////////
/// //   Tests for removeChannelOwnerV1()   /////
/// /////////////////////////////////////////////

describe('Testing removeChannelOwnerV1', () => {

  afterEach(() => {
    request('DELETE', url + '/clear/v1');

    james = createUser('james@gmail.com', 'testPassword123', 'James', 'Brown');
    rufus = createUser('rufus@gmail.com', 'testPassword123', 'Rufus', 'Hayes');
    alex = createUser('alex@gmail.com', 'testPassword123', 'Alex', 'King');

    alex.uId = getUId(alex.authUserId);
    rufus.uId = getUId(rufus.authUserId);

    rufusChannel = createChannel(rufus.token, 'testChannel2', true);

    channelJoin(alex.token, rufusChannel.channelId);
    channelJoin(james.token, rufusChannel.channelId);
  });

  test('channelId does not refer to a valid channel', () => {
    expect(removeOwner(james.token, -100, rufus.uId)).toEqual({ error: 'error' });
  });
  test('user being rmeoved as owner does not exist', () => {
    expect(removeOwner(james.token, rufusChannel.channelId, -100)).toEqual({ error: 'error' });
  });
  test('user being removed as owner is not currently owner', () => {
    expect(removeOwner(rufus.token, rufusChannel.channelId, alex.uId)).toEqual({ error: 'error' });
  });
  test('user being removed as owner is not currently owner', () => {
    expect(removeOwner(rufus.token, rufusChannel.channelId, alex.uId)).toEqual({ error: 'error' });
  });
  test('trying to remove an owner who is the only channel owner', () => {
    expect(removeOwner(james.token, rufusChannel.channelId, rufus.uId)).toEqual({ error: 'error' });
  });
  test('user being removed as owner is not currently owner', () => {
    expect(removeOwner(rufus.token, rufusChannel.channelId, alex.uId)).toEqual({ error: 'error' });
  });
  test('user attempting to remove owner lacks permissions', () => {
    expect(removeOwner(alex.token, rufusChannel.channelId, rufus.uId)).toEqual({ error: 'error' });
  });
  test('successful case', () => {
    addOwner(rufus.token, rufusChannel.channelId, alex.uId);
    expect(removeOwner(rufus.token, rufusChannel.channelId, alex.uId)).toEqual({});
  });
});

// assumption - both global and channel owners can add and remove themselves as channel owners

*/
export { createChannel, createUser, channelJoin };
