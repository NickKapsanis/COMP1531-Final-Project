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
   let firstCreatedChannel = channelsCreateV1(1234, 'James', true);
   let secondCreatedChannel = channelsCreateV1(1234, 'James', false);
   let thirdCreatedChannel = channelsCreateV1(6969, 'Rufus', true);
   let fourthCreatedChannel = channelsCreateV1(1234, 'James', true);
   let fifthCreatedChannel = channelsCreateV1(6969, 'Rufus', false);
 
   let jamesChannelArray = channelsListV1(1234);
 
   expect(jamesChannelArray[0].name).toEqual(firstCreatedChannel.name);
   expect(jamesChannelArray[1].name).toEqual(secondCreatedChannel.name);
   expect(jamesChannelArray[2].name).toEqual(fourthCreatedChannel.name);
 
   expect(jamesChannelArray[0].channelId).toEqual(firstCreatedChannel.channelId);
   expect(jamesChannelArray[1].channelId).toEqual(secondCreatedChannel.channelId);
   expect(jamesChannelArray[2].channelId).toEqual(fourthCreatedChannel.channelId);
  });
  
 
  test('tests if correct channel properties are listed in channel list', () => {
    let firstCreatedChannel = channelsCreateV1(4321, 'Alice', true);
    let secondCreatedChannel = channelsCreateV1(4321, 'Alice', true);
    let thirdCreatedChannel = channelsCreateV1(4210, 'Damian', false);
    let fourthCreatedChannel = channelsCreateV1(4321, 'Alice', true);
    let fifthCreatedChannel = channelsCreateV1(4210, 'Damian', true);
 
   let aliceChannelArray = channelsListV1(4321);
 
   expect(aliceChannelArray[0].channelId).toEqual(firstCreatedChannel.channelId);
   expect(aliceChannelArray[1].channelId).toEqual(secondCreatedChannel.channelId);
   expect(aliceChannelArray[2].channelId).toEqual(fourthCreatedChannel.channelId);
 
   expect(aliceChannelArray[0].name).toEqual(firstCreatedChannel.name);
   expect(aliceChannelArray[1].name).toEqual(secondCreatedChannel.name);
   expect(aliceChannelArray[2].name).toEqual(fourthCreatedChannel.name);

   expect(aliceChannelArray.length).toEqual(3);
 
  });

////////////////////////////////////////////////
/////    Tests for channelsListAllV1()	   /////
////////////////////////////////////////////////

//similar to previous function test, but no matter if private or not.

 test('tests the empty case', () => {

  let everyChannelArray = channelsListallV1(9696);
  expect(everyChannelArray).toEqual(null);

 });

 test('tests if all correct channels are listed in channel list', () => {
  let firstCreatedChannel = channelsCreateV1(1234, 'James', false);
  let secondCreatedChannel = channelsCreateV1(1234, 'James', false);
  let thirdCreatedChannel = channelsCreateV1(6969, 'Rufus', false);
  let fourthCreatedChannel = channelsCreateV1(1234, 'James', true);

  let everyChannelArray = channelsListallV1(1234);

  expect(everyChannelArray[0].name).toEqual(firstCreatedChannel.name);
  expect(everyChannelArray[1].name).toEqual(secondCreatedChannel.name);
  expect(everyChannelArray[2].name).toEqual(thirdCreatedChannel.name);
  expect(everyChannelArray[2].name).toEqual(fourthCreatedChannel.name);

  expect(everyChannelArray[0].channelId).toEqual(firstCreatedChannel.channelId);
  expect(everyChannelArray[1].channelId).toEqual(secondCreatedChannel.channelId);
  expect(everyChannelArray[2].channelId).toEqual(thirdCreatedChannel.channelId);
  expect(everyChannelArray[3].channelId).toEqual(fourthCreatedChannel.channelId);

 });
 

 test('tests if correct channel properties are listed in channel list', () => {
  let firstCreatedChannel = channelsCreateV1(4321, 'Alice', false);
  let secondCreatedChannel = channelsCreateV1(4321, 'Alice', true);
  let thirdCreatedChannel = channelsCreateV1(6969, 'Rufus', false);
  let fourthCreatedChannel = channelsCreateV1(4321, 'Alice', true);

  let everyChannelArray = channelsListallV1(4321);

  expect(everyChannelArray[0].name).toEqual(firstCreatedChannel.name);
  expect(everyChannelArray[1].name).toEqual(secondCreatedChannel.name);
  expect(everyChannelArray[2].name).toEqual(thirdCreatedChannel.name);
  expect(everyChannelArray[2].name).toEqual(fourthCreatedChannel.name);

  expect(everyChannelArray[0].channelId).toEqual(firstCreatedChannel.channelId);
  expect(everyChannelArray[1].channelId).toEqual(secondCreatedChannel.channelId);
  expect(everyChannelArray[2].channelId).toEqual(thirdCreatedChannel.channelId);
  expect(everyChannelArray[2].channelId).toEqual(fourthCreatedChannel.channelId);

  expect(everyChannelArray.length).toEqual(3);

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

  // test('Testing correct input - Checking if user is in created channel (ii)', () => {
    
  //   clearV1();
  //   const testAuthId = authRegisterV1('testemail@email.com', 'testPassword123', 'testFirstName', 'testLastName');
  //   const testChannelId = channelsCreateV1(testAuthId, "testChannelName", true); 

  //   // Checking if channel is reflected in user's channels
  //   const testUserChannels = channelsListV1(testAuthId);
  //   const testChannel1 = testUserChannels.find(i => i.channelId === testChannelId);
  //   expect(testChannel1['name']).toStrictEqual('testChannelName');

  //   // Checking if user is reflected in channel's all members and user array
  //   const testUId = getUId(testAuthId);
  //   const testChannel2 = channelDetailsV1(testAuthId, testChannelId);
  //   const testAllMembers = testChannel2.allMembers.find(i => i === testUId);
  //   const testOwnerMembers = testChannel2.ownerMembers.find(i => i === testUId);
  //   expect(testAllMembers).toStrictEqual(testUId);
  //   expect(testOwnerMembers).toStrictEqual(testUId);

  // });

});
