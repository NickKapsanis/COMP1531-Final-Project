import request from 'sync-request';
import config from './config.json';

const port = config.port;
const url = config.url;

/*

test('testing when authUserId doesn\'t exist', () => {

  clearV1();
  let somebodyChannelArray = channelsListV1(9690);
  expect(somebodyChannelArray).toEqual({error : 'error'});

});

test('testing when user is not in any channel', () => {

  clearV1();
  const jamesAuthId = authRegisterV1('james@email.com', 'testPassword123', 'James', 'James').authUserId;
  let JamesChannelArray = channelsListV1(jamesAuthId).channels;
  expect(JamesChannelArray).toEqual([]);

});

test('tests if all correct channels are listed in channel list', () => {

  clearV1();

  const jamesAuthId = authRegisterV1('james@email.com', 'testPassword123', 'James', 'James').authUserId;
  const rufusAuthId = authRegisterV1('rufus@email.com', 'testPassword123', 'Rufus', 'Rufus').authUserId;

  let firstCreatedChannel = channelsCreateV1(jamesAuthId, 'James C1', true).channelId;
  let secondCreatedChannel = channelsCreateV1(jamesAuthId, 'James C2', false).channelId;
  let thirdCreatedChannel = channelsCreateV1(rufusAuthId, 'Rufus C1', true).channelId;
  let fourthCreatedChannel = channelsCreateV1(jamesAuthId, 'James C3', true).channelId;

  let jamesChannelArray = channelsListV1(jamesAuthId).channels;

  let findC1 = jamesChannelArray.find(i => i.channelId === firstCreatedChannel);
  let findC2 = jamesChannelArray.find(i => i.channelId === secondCreatedChannel);
  let findC3 = jamesChannelArray.find(i => i.channelId === thirdCreatedChannel);
  let findC4 = jamesChannelArray.find(i => i.channelId === fourthCreatedChannel);

  expect(findC1.name).toEqual('James C1');
  expect(findC2.name).toEqual('James C2');
  expect(findC4.name).toEqual('James C3');

  expect(findC1.channelId).toEqual(firstCreatedChannel);
  expect(findC2.channelId).toEqual(secondCreatedChannel);
  expect(findC4.channelId).toEqual(fourthCreatedChannel);
  expect(findC3).toEqual(undefined);

});

test('tests if correct channel properties are listed in channel list', () => {

  clearV1();

  const aliceAuthId = authRegisterV1('Alice@email.com', 'testPassword123', 'Alice', 'Alice').authUserId;
  const damianAuthId = authRegisterV1('Damian@email.com', 'testPassword123', 'Damian', 'Damian').authUserId;

  let firstCreatedChannel = channelsCreateV1(aliceAuthId, 'Alice C1', true).channelId;
  let secondCreatedChannel = channelsCreateV1(aliceAuthId, 'Alice C2', true).channelId;
  let thirdCreatedChannel = channelsCreateV1(damianAuthId, 'Damian C1', false).channelId;
  let fourthCreatedChannel = channelsCreateV1(aliceAuthId, 'Alice C3', true).channelId;
  let fifthCreatedChannel = channelsCreateV1(damianAuthId, 'Damian C2', true).channelId;

  let aliceChannelArray = channelsListV1(aliceAuthId).channels;

  let findC1 = aliceChannelArray.find(i => i.channelId === firstCreatedChannel);
  let findC2 = aliceChannelArray.find(i => i.channelId === secondCreatedChannel);
  let findC3 = aliceChannelArray.find(i => i.channelId === thirdCreatedChannel);
  let findC4 = aliceChannelArray.find(i => i.channelId === fourthCreatedChannel);
  let findC5 = aliceChannelArray.find(i => i.channelId === fifthCreatedChannel);

  expect(findC1.name).toEqual('Alice C1');
  expect(findC2.name).toEqual('Alice C2');
  expect(findC4.name).toEqual('Alice C3');

  expect(findC1.channelId).toEqual(firstCreatedChannel);
  expect(findC2.channelId).toEqual(secondCreatedChannel);
  expect(findC3).toEqual(undefined);
  expect(findC4.channelId).toEqual(fourthCreatedChannel);
  expect(findC5).toEqual(undefined);

  expect(aliceChannelArray.length).toEqual(3);

});

test('tests when no channel exists', () => {

  clearV1();
  const jamesAuthId = authRegisterV1('james@email.com', 'testPassword123', 'James', 'James').authUserId;
  let everyChannelArray = channelsListallV1(jamesAuthId).channels;
  expect(everyChannelArray).toEqual([]);

});

test('tests when authUserId does\'nt exist', () => {

  clearV1();
  let everyChannelArray = channelsListallV1(11);
  expect(everyChannelArray).toEqual({error : 'error'});

});

test('tests if all correct channels are listed in channel list', () => {

  clearV1();

  const jamesAuthId = authRegisterV1('james@email.com', 'testPassword123', 'James', 'James').authUserId;
  const rufusAuthId = authRegisterV1('rufus@email.com', 'testPassword123', 'Rufus', 'Rufus').authUserId;

  let firstCreatedChannel = channelsCreateV1(jamesAuthId, 'James C1', false).channelId;
  let secondCreatedChannel = channelsCreateV1(jamesAuthId, 'James C2', false).channelId;
  let thirdCreatedChannel = channelsCreateV1(rufusAuthId, 'Rufus C1', false).channelId;
  let fourthCreatedChannel = channelsCreateV1(jamesAuthId, 'James C3', true).channelId;

  let everyChannelArray = channelsListallV1(rufusAuthId).channels;

  let findC1 = everyChannelArray.find(i => i.channelId === firstCreatedChannel);
  let findC2 = everyChannelArray.find(i => i.channelId === secondCreatedChannel);
  let findC3 = everyChannelArray.find(i => i.channelId === thirdCreatedChannel);
  let findC4 = everyChannelArray.find(i => i.channelId === fourthCreatedChannel);

  expect(findC1.name).toEqual('James C1');
  expect(findC2.name).toEqual('James C2');
  expect(findC3.name).toEqual('Rufus C1');
  expect(findC4.name).toEqual('James C3');

  expect(findC1.channelId).toEqual(firstCreatedChannel);
  expect(findC2.channelId).toEqual(secondCreatedChannel);
  expect(findC3.channelId).toEqual(thirdCreatedChannel);
  expect(findC4.channelId).toEqual(fourthCreatedChannel);

});

test('tests if correct channel properties are listed in channel list', () => {

  clearV1();

  const aliceAuthId = authRegisterV1('alice@email.com', 'testPassword123', 'Alice', 'Alice').authUserId;
  const rufusAuthId = authRegisterV1('rufus@email.com', 'testPassword123', 'Rufus', 'Rufus').authUserId;

  let firstCreatedChannel = channelsCreateV1(aliceAuthId, 'Alice C1', false).channelId;
  let secondCreatedChannel = channelsCreateV1(aliceAuthId, 'Alice C2', false).channelId;
  let thirdCreatedChannel = channelsCreateV1(rufusAuthId, 'Rufus C1', false).channelId;
  let fourthCreatedChannel = channelsCreateV1(aliceAuthId, 'Alice C3', true).channelId;

  let everyChannelArray = channelsListallV1(aliceAuthId).channels;

  let findC1 = everyChannelArray.find(i => i.channelId === firstCreatedChannel);
  let findC2 = everyChannelArray.find(i => i.channelId === secondCreatedChannel);
  let findC3 = everyChannelArray.find(i => i.channelId === thirdCreatedChannel);
  let findC4 = everyChannelArray.find(i => i.channelId === fourthCreatedChannel);

  expect(findC1.name).toEqual('Alice C1');
  expect(findC2.name).toEqual('Alice C2');
  expect(findC3.name).toEqual('Rufus C1');
  expect(findC4.name).toEqual('Alice C3');

  expect(findC1.channelId).toEqual(firstCreatedChannel);
  expect(findC2.channelId).toEqual(secondCreatedChannel);
  expect(findC3.channelId).toEqual(thirdCreatedChannel);
  expect(findC4.channelId).toEqual(fourthCreatedChannel);

  expect(everyChannelArray.length).toEqual(4);

});
*/

/*
////////////////////////////////////////////////
Tests for channelsCreateV1()
////////////////////////////////////////////////
*/
describe('Testing channelsCreateV1()', () => {
  beforeEach(() => {
    requestClear();
  });

  test('Testing if error is returned when name length < 1', () => {
    const user = requestAuthRegister();
    const token = user.token;
    const output = requestChannelsCreate(token, '', true);
    expect(output).toStrictEqual({ error: 'error' });
  });

  test('Testing if error is returned when name length > 20', () => {
    const user = requestAuthRegister();
    const token = user.token;
    const output = requestChannelsCreate(token, 'thisIsAVeryLongChannelNameWhichIsInvalid', true);
    expect(output).toStrictEqual({ error: 'error' });
  });

  test('Testing if error is returned when token is invalid', () => {
    const output = requestChannelsCreate('invalid-token', 'testChannelName', true);
    expect(output).toStrictEqual({ error: 'error' });
  });

  test('Testing correct input - Checking if channel is created (i)', () => {
    const user = requestAuthRegister();
    const token = user.token;
    const testChannelId = requestChannelsCreate(token, 'testChannelName', false).channelId;

    // Checking if channel id is created
    expect(testChannelId).toStrictEqual(expect.any(Number));
  });
});

/*
Helper Functions
*/

function requestClear() {
  request(
    'DELETE',
    `${url}:${port}/clear/v1`
  );
}

function requestAuthRegister() {
  const res = request(
    'POST',
    `${url}:${port}/auth/register/v2`,
    {
      body: JSON.stringify({
        email: 'testemail@email.com',
        password: 'testPassword123',
        nameFirst: 'testFirstName',
        nameLast: 'testLastName'
      }),
      headers: {
        'Content-type': 'application/json',
      },
    }
  );

  return JSON.parse(String(res.getBody()));
}

function requestChannelsCreate(token: string, name: string, isPublic: boolean) {
  const res = request(
    'POST',
    `${url}:${port}/channels/create/v2`,
    {
      body: JSON.stringify({
        token: token,
        name: name,
        isPublic: isPublic,
      }),
      headers: {
        'Content-type': 'application/json',
      },
    }
  );

  return JSON.parse(String(res.getBody()));
}
