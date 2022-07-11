import { getUId } from './other';
import request from 'sync-request';
import { PORT, HOST } from './server';

const url = 'http://' + HOST + ':' + PORT;

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
    rufus = createUser('rufus@gmail.com', 'testPassword123', 'Alex', 'Hayes');

    publicChannel = createChannel(james.authUserId, 'testChannel1', true);
    privateChannel = createChannel(james.authUserId, 'testChannel2', false);
    rufusPrivateChannel = createChannel(rufus.authUserId, 'testChannel3', false);
  });

  test('channelId does not refer to a valid channel', () => {
    expect(channelJoin(rufus.token, -100)).toEqual({ error: 'error' });
  });
  test('the user is already a channel member', () => {
    expect(channelJoin(james.token, publicChannel)).toEqual({ error: 'error' });
  });
  test('the channel is private and user is not global owner', () => {
    expect(channelJoin(rufus.token, privateChannel)).toEqual({ error: 'error' });
  });
  test('the channel is private and the user is a global owner', () => {
    expect(channelJoin(james.token, rufusPrivateChannel)).toEqual({});
  });
  test('successful add', () => {
    expect(channelJoin(rufus.token, publicChannel)).toEqual({});
  });
});

/// /////////////////////////////////////////////
/// //     Tests for channelInviteV2()      /////
/// /////////////////////////////////////////////

describe('Testing channelInviteV2', () => {
  let james, rufus, alex, publicChannel, rufusChannel, rufusuId;

  beforeEach(() => {
    request('DELETE', url + '/clear/v1');

    james = createUser('james@gmail.com', 'testPassword123', 'James', 'Brown');
    rufus = createUser('rufus@gmail.com', 'testPassword123', 'Rufus', 'Hayes');
    alex = createUser('alex@gmail.com', 'testPassword123', 'Alex', 'King');
    rufusuId = getUId(rufus.authUserId);

    publicChannel = createChannel(james.authUserId, 'testChannel1', true);
    rufusChannel = createChannel(rufus.authUserId, 'testChannel2', true);
  });

  test('channelId does not refer to a valid channel', () => {
    expect(channelInvite(james.token, -100, rufusuId)).toEqual({ error: 'error' });
  });
  test('user inviting does not exist', () => {
    expect(channelInvite('fakeUser', publicChannel, rufusuId)).toEqual({ error: 'error' });
  });
  test('user joining does not exist', () => {
    expect(channelInvite(james.token, publicChannel, -100)).toEqual({ error: 'error' });
  });
  test('trying to invite existing channel member', () => {
    channelJoin(alex.token, rufusChannel);
    expect(channelInvite(alex.token, publicChannel, rufusuId)).toEqual({ error: 'error' });
  });
  test('user inviting is not a member of the channel', () => {
    expect(channelInvite(alex.token, publicChannel, rufusuId)).toEqual({ error: 'error' });
  });
  test('successful case', () => {
    expect(channelInvite(james.token, publicChannel, rufusuId)).toEqual({});
  });
});

/// /////////////////////////////////////////////
/// //     Tests for addChannelOwnerV1()    /////
/// /////////////////////////////////////////////

describe('Testing addChannelOwnerV1', () => {
  let james, rufus, alex, publicChannel, rufusChannel, alexUId;

  beforeEach(() => {
    request('DELETE', url + '/clear/v1');

    james = createUser('james@gmail.com', 'testPassword123', 'James', 'Brown');
    rufus = createUser('rufus@gmail.com', 'testPassword123', 'Rufus', 'Hayes');
    alex = createUser('alex@gmail.com', 'testPassword123', 'Alex', 'King');
    alexUId = getUId(alex.authUserId);

    publicChannel = createChannel(james.authUserId, 'testChannel1', true);
    rufusChannel = createChannel(rufus.authUserId, 'testChannel2', true);

    channelJoin(alex.token, publicChannel);
    channelJoin(rufus.token, publicChannel);
  });

  test('channelId does not refer to a valid channel', () => {
    expect(addOwner(rufus.token, -100, alexUId)).toEqual({ error: 'error' });
  });
  test('user becoming owner is an invalid user', () => {
    expect(addOwner(rufus.token, rufusChannel, -100)).toEqual({ error: 'error' });
  });
  test('user becoming owner is not a member of the channel', () => {
    expect(addOwner(james.token, publicChannel, alexUId)).toEqual({ error: 'error' });
  });
  test('user becoming owner is not a member of the channel', () => {
    expect(addOwner(rufus.token, rufusChannel, alexUId)).toEqual({ error: 'error' });
  });
  test('the user adding the new owner is not a global owner or channel owner, but is in the channel', () => {
    expect(addOwner(rufus.token, publicChannel, alexUId)).toEqual({ error: 'error' });
  });
  test('successful case', () => {
    expect(addOwner(james.token, publicChannel, alexUId)).toEqual({});
  });
});

/// /////////////////////////////////////////////
/// //   Tests for removeChannelOwnerV1()   /////
/// /////////////////////////////////////////////

describe('Testing removeChannelOwnerV1', () => {
  let james, rufus, alex, rufusChannel, alexUId, rufusUId;

  beforeEach(() => {
    request('DELETE', url + '/clear/v1');

    james = createUser('james@gmail.com', 'testPassword123', 'James', 'Brown');
    rufus = createUser('rufus@gmail.com', 'testPassword123', 'Rufus', 'Hayes');
    alex = createUser('alex@gmail.com', 'testPassword123', 'Alex', 'King');

    alexUId = getUId(alex.authUserId);
    rufusUId = getUId(rufus.authUserId);

    rufusChannel = createChannel(rufus.authUserId, 'testChannel2', true);

    channelJoin(alex.token, rufusChannel);
    channelJoin(james.token, rufusChannel);
  });

  test('channelId does not refer to a valid channel', () => {
    expect(removeOwner(james.token, -100, rufusUId)).toEqual({ error: 'error' });
  });
  test('user being rmeoved as owner does not exist', () => {
    expect(removeOwner(james.token, rufusChannel, -100)).toEqual({ error: 'error' });
  });
  test('user being removed as owner is not currently owner', () => {
    expect(removeOwner(rufus.token, rufusChannel, alexUId)).toEqual({ error: 'error' });
  });
  test('user being removed as owner is not currently owner', () => {
    expect(removeOwner(rufus.token, rufusChannel, alexUId)).toEqual({ error: 'error' });
  });
  test('trying to remove an owner who is the only channel owner', () => {
    expect(removeOwner(james.token, rufusChannel, rufusUId)).toEqual({ error: 'error' });
  });
  test('user being removed as owner is not currently owner', () => {
    expect(removeOwner(rufus.token, rufusChannel, alexUId)).toEqual({ error: 'error' });
  });
  test('user attempting to remove owner lacks permissions', () => {
    expect(removeOwner(alex.token, rufusChannel, rufusUId)).toEqual({ error: 'error' });
  });
  test('successful case', () => {
    addOwner(rufus.token, rufusChannel, alexUId);
    expect(removeOwner(rufus.token, rufusChannel, alexUId)).toEqual({});
  });
});

// assumption - both global and channel owners can add and remove themselves as channel owners

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
    'POST', url + '/channels/create/v2',
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
      headers: { 'Content-type': 'application/json' },
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
      headers: { 'Content-type': 'application/json' }
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

export { createChannel, createUser, channelJoin };
