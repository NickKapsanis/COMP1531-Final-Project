import { channelJoinV1, channelInviteV1} from './channel';
import { channelsListV1, channelsListallV1, channelsCreateV1 } from './channels.js';
import { authRegisterV1 } from './auth.js'
import { clearV1, getUId } from './other.js'

////////////////////////////////////////////////
/////      Tests for channelJoinV1() 	   /////
////////////////////////////////////////////////

test('tests the case that authUserId is invalid', () => {
    const jamesAuthId = authRegisterV1('james@email.com', 'testPassword123', 'James', 'James');
    const rufusAuthId = authRegisterV1('rufus@email.com', 'testPassword123', 'Rufus', 'Rufus');
    let testCreatedChannel = channelsCreateV1(jamesAuthId, 'testChannel1', true);
    let output = channelJoinV1('wrongUId', testCreatedChannel);
    expect(output).toStrictEqual({ error : 'error' });
});

test('tests the case that channelId is invalid', () => {
    const jamesAuthId = authRegisterV1('james@email.com', 'testPassword123', 'James', 'James');
    const rufusAuthId = authRegisterV1('rufus@email.com', 'testPassword123', 'Rufus', 'Rufus');
    let testCreatedChannel = channelsCreateV1(jamesAuthId, 'testChannel1', true);
    let output = channelJoinV1(rufusAuthId, 'wrongChannel');
    expect(output).toStrictEqual({ error : 'error' });
});

test('tests the case that the user is already a member of the channel', () => {
    const jamesAuthId = authRegisterV1('james@email.com', 'testPassword123', 'James', 'James');
    let testCreatedChannel = channelsCreateV1(jamesAuthId, 'testChannel1', true);
    let output = channelJoinV1(jamesAuthId, testCreatedChannel);
    expect(output).toStrictEqual({ error : 'error' });
});

test('tests the case that the channel is private and the user is not a global owner', () => {
    const jamesAuthId = authRegisterV1('james@email.com', 'testPassword123', 'James', 'James');
    const rufusAuthId = authRegisterV1('rufus@email.com', 'testPassword123', 'Rufus', 'Rufus');
    let testCreatedChannel = channelsCreateV1(jamesAuthId, 'testChannel1', false);
    let output = channelJoinV1(rufusAuthId, testCreatedChannel);
    expect(output).toStrictEqual({ error : 'error' });
});

test('tests the case that the channel is private and the user is a global owner', () => {
    const jamesAuthId = authRegisterV1('james@email.com', 'testPassword123', 'James', 'James');
    const rufusAuthId = authRegisterV1('rufus@email.com', 'testPassword123', 'Rufus', 'Rufus');
    let testCreatedChannel = channelsCreateV1(rufusAuthId, 'testChannel1', false);
    let output = channelJoinV1(jamesAuthId, testCreatedChannel);
    expect(output).toStrictEqual({});
});

test('tests the case of a success', () => {
    const jamesAuthId = authRegisterV1('james@email.com', 'testPassword123', 'James', 'James');
    const rufusAuthId = authRegisterV1('rufus@email.com', 'testPassword123', 'Rufus', 'Rufus');
    const alexAuthId = authRegisterV1('alex@email.com', 'bigBrainPassword', 'Alex', 'Alex');
    let testCreatedChannel = channelsCreateV1(jamesAuthId, 'testChannel1', true);
    let output1 = channelJoinV1(rufusAuthId, testCreatedChannel);
    let output2 = channelJoinV1(alexAuthId, testCreatedChannel);
    expect(output1).toStrictEqual({});
    expect(output2).toStrictEqual({});
});

////////////////////////////////////////////////
/////      Tests for channelInviteV1() 	   /////
////////////////////////////////////////////////

test('tests the case that user inviting does not exist', () => {
    const jamesAuthId = authRegisterV1('james@email.com', 'testPassword123', 'James', 'James');
    const rufusAuthId = authRegisterV1('rufus@email.com', 'testPassword123', 'Rufus', 'Rufus');
    let testCreatedChannel = channelsCreateV1(jamesAuthId, 'testChannel1', true);
    let output = channelInviteV1('fakeUser', testCreatedChannel, rufusAuthId.getUId());
    expect(output).toStrictEqual({ error : 'error' });
});

test('tests the case user joining does not exist', () => {
    const jamesAuthId = authRegisterV1('james@email.com', 'testPassword123', 'James', 'James');
    const rufusAuthId = authRegisterV1('rufus@email.com', 'testPassword123', 'Rufus', 'Rufus');
    let testCreatedChannel = channelsCreateV1(jamesAuthId, 'testChannel1', true);
    let output = channelInviteV1(jamesAuthId, testCreatedChannel, 'fakeUId');
    expect(output).toStrictEqual({ error : 'error' });
});

test('tests the case channel does not exist', () => {
    const jamesAuthId = authRegisterV1('james@email.com', 'testPassword123', 'James', 'James');
    const rufusAuthId = authRegisterV1('rufus@email.com', 'testPassword123', 'Rufus', 'Rufus');
    let testCreatedChannel = channelsCreateV1(jamesAuthId, 'testChannel1', true);
    let output = channelInviteV1(jamesAuthId, 'fakeChannel', rufusAuthId.getUId());
    expect(output).toStrictEqual({ error : 'error' });
});

test('tests the case channel uId refers to an existing channel member', () => {
    const jamesAuthId = authRegisterV1('james@email.com', 'testPassword123', 'James', 'James');
    const rufusAuthId = authRegisterV1('rufus@email.com', 'testPassword123', 'Rufus', 'Rufus');
    const alexAuthId = authRegisterV1('alex@email.com', 'bigBrainPassword', 'Alex', 'Alex');
    let testCreatedChannel = channelsCreateV1(jamesAuthId, 'testChannel1', true);
    let joinAlex = channelJoinV1(alexAuthId, testCreatedChannel);
    let output = channelInviteV1(jamesAuthId, testCreatedChannel, alexAuthId.getUId());
    expect(output).toStrictEqual({ error : 'error' });
});

test('tests the case that the user inviting is not a member of the channel', () => {
    const jamesAuthId = authRegisterV1('james@email.com', 'testPassword123', 'James', 'James');
    const rufusAuthId = authRegisterV1('rufus@email.com', 'testPassword123', 'Rufus', 'Rufus');
    const alexAuthId = authRegisterV1('alex@email.com', 'bigBrainPassword', 'Alex', 'Alex');
    let testCreatedChannel = channelsCreateV1(jamesAuthId, 'testChannel1', true);
    let output = channelInviteV1(alexAuthId, testCreatedChannel, rufusAuthId.getUId());
    expect(output).toStrictEqual({ error : 'error' });
});

test('tests the case that the user invites themself', () => {
    const jamesAuthId = authRegisterV1('james@email.com', 'testPassword123', 'James', 'James');
    const rufusAuthId = authRegisterV1('rufus@email.com', 'testPassword123', 'Rufus', 'Rufus');
    let testCreatedChannel = channelsCreateV1(jamesAuthId, 'testChannel1', true);
    let output = channelInviteV1(rufusAuthId, testCreatedChannel, rufusAuthId.getUId());
    expect(output).toStrictEqual({ error : 'error' });
});

test('tests the successful case', () => {
    const jamesAuthId = authRegisterV1('james@email.com', 'testPassword123', 'James', 'James');
    const rufusAuthId = authRegisterV1('rufus@email.com', 'testPassword123', 'Rufus', 'Rufus');
    let testCreatedChannel = channelsCreateV1(jamesAuthId, 'testChannel1', true);
    let output = channelInviteV1(jamesAuthId, testCreatedChannel, rufusAuthId.getUId());
    expect(output).toStrictEqual({});
});