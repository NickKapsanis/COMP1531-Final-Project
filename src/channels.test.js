import { channelsListV1, channelsListallV1, channelsCreateV1 } from './channels.js';
import { authRegisterV1 } from './auth.js'
import { clearV1, getUId } from './other.js'
import { channelDetailsV1 } from './channel.js'

////////////////////////////////////////////////
/////      Tests for channelsListV1() 	   /////
////////////////////////////////////////////////

test('tests the empty case', () => {

    let somebodyChannelArray = channelsListV1(9690);
    expect(somebodyChannelArray).toEqual(null);
  
   });

  test('tests if all correct channels are listed in channel list', () => {

    clearV1();

    const jamesAuthId = authRegisterV1('james@email.com', 'testPassword123', 'James', 'James');
    const rufusAuthId = authRegisterV1('rufus@email.com', 'testPassword123', 'Rufus', 'Rufus');

   let firstCreatedChannel = channelsCreateV1(jamesAuthId, 'James C1', true);
   let secondCreatedChannel = channelsCreateV1(jamesAuthId, 'James C2', false);
   let thirdCreatedChannel = channelsCreateV1(rufusAuthId, 'Rufus C1', true);
   let fourthCreatedChannel = channelsCreateV1(jamesAuthId, 'James C3', true);
 
   let jamesChannelArray = channelsListV1(jamesAuthId);
 
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

    const aliceAuthId = authRegisterV1('Alice@email.com', 'testPassword123', 'Alice', 'Alice');
    const damianAuthId = authRegisterV1('Damian@email.com', 'testPassword123', 'Damian', 'Damian');

    let firstCreatedChannel = channelsCreateV1(aliceAuthId, 'Alice C1', true);
    let secondCreatedChannel = channelsCreateV1(aliceAuthId, 'Alice C2', true);
    let thirdCreatedChannel = channelsCreateV1(damianAuthId, 'Damian C1', false);
    let fourthCreatedChannel = channelsCreateV1(aliceAuthId, 'Alice C3', true);
    let fifthCreatedChannel = channelsCreateV1(damianAuthId, 'Damian C2', true);
 
   let aliceChannelArray = channelsListV1(aliceAuthId);

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

////////////////////////////////////////////////
/////    Tests for channelsListAllV1()	   /////
////////////////////////////////////////////////

//similar to previous function test, but no matter if private or not.

 test('tests the empty case', () => {

  clearV1();

  let everyChannelArray = channelsListallV1(9696);
  expect(everyChannelArray).toEqual(null);

 });

 test('tests if all correct channels are listed in channel list', () => {

  clearV1();

  const jamesAuthId = authRegisterV1('james@email.com', 'testPassword123', 'James', 'James');
  const rufusAuthId = authRegisterV1('rufus@email.com', 'testPassword123', 'Rufus', 'Rufus');

  let firstCreatedChannel = channelsCreateV1(jamesAuthId, 'James C1', false);
  let secondCreatedChannel = channelsCreateV1(jamesAuthId, 'James C2', false);
  let thirdCreatedChannel = channelsCreateV1(rufusAuthId, 'Rufus C1', false);
  let fourthCreatedChannel = channelsCreateV1(jamesAuthId, 'James C3', true);

  let everyChannelArray = channelsListallV1(rufusAuthId);

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

  const aliceAuthId = authRegisterV1('alice@email.com', 'testPassword123', 'Alice', 'Alice');
  const rufusAuthId = authRegisterV1('rufus@email.com', 'testPassword123', 'Rufus', 'Rufus');

  let firstCreatedChannel = channelsCreateV1(aliceAuthId, 'Alice C1', false);
  let secondCreatedChannel = channelsCreateV1(aliceAuthId, 'Alice C2', false);
  let thirdCreatedChannel = channelsCreateV1(rufusAuthId, 'Rufus C1', false);
  let fourthCreatedChannel = channelsCreateV1(aliceAuthId, 'Alice C3', true);

  let everyChannelArray = channelsListallV1(aliceAuthId);

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

////////////////////////////////////////////////
/////    Tests for channelsCreateV1() 	   /////
////////////////////////////////////////////////

describe('Testing channelsCreateV1()', () => {

  test('Testing if error is returned when name length < 1', () => {

    clearV1();
    const testAuthId = authRegisterV1('testemail@email.com', 'testPassword123', 'testFirstName', 'testLastName');
    const output = channelsCreateV1(testAuthId, "", true);
    expect(output).toStrictEqual({ error : 'error' });
  
  });

  test('Testing if error is returned when name length > 20', () => {

    clearV1();
    const testAuthId = authRegisterV1('testemail@email.com', 'testPassword123', 'testFirstName', 'testLastName');
    const output = channelsCreateV1(testAuthId, "thisIsAVeryLongChannelNameWhichIsInvalid", true);
    expect(output).toStrictEqual({ error : 'error' });
  
  });

  test('Testing if error is returned when authUserId does not exist', () => {

    clearV1();
    const testAuthId = -111;
    const output = channelsCreateV1(testAuthId, "testChannelName", true);
    expect(output).toStrictEqual({ error : 'error' });
  
  });

  test('Testing correct input - Checking if channel is created (i)', () => {
    
    clearV1();
    const testAuthId = authRegisterV1('testemail@email.com', 'testPassword123', 'testFirstName', 'testLastName');
    const testChannelId = channelsCreateV1(testAuthId, "testChannelName", false); 

    // Checking if channel id is created
    expect(testChannelId).toStrictEqual(expect.any(Number));

    // Checking if channel is created and pushed in the datastore
    const allChannels = channelsListallV1(testAuthId);
    const check = allChannels.find(i => i.channelId === testChannelId);
    expect(check['name']).toStrictEqual('testChannelName');

  });

  test('Testing correct input - Checking if user is in created channel (ii)', () => {
    
    clearV1();
    const testAuthId = authRegisterV1('testemail@email.com', 'testPassword123', 'testFirstName', 'testLastName');
    const testChannelId = channelsCreateV1(testAuthId, "testChannelName", true); 

    // Checking if channel is reflected in user's channels
    const testUserChannels = channelsListV1(testAuthId);
    const testChannel1 = testUserChannels.find(i => i.channelId === testChannelId);
    expect(testChannel1['name']).toStrictEqual('testChannelName');

    // Checking if user is reflected in channel's all members and user array
    const testUId = getUId(testAuthId);
    const testChannel2 = channelDetailsV1(testAuthId, testChannelId);
    const testAllMembers = testChannel2.allMembers.find(i => i.uId === testUId);
    const testOwnerMembers = testChannel2.ownerMembers.find(i => i.uId === testUId);
    expect(testAllMembers.uId).toStrictEqual(testUId);
    expect(testOwnerMembers.uId).toStrictEqual(testUId);
  });

});
