 //this is the test file for the channels.js file
 //each test tests a different aspect of the
 //expected functionality of the functions
 
 //@module channel.test





  //testing channelsListV1 function.
  import { channelsListV1 } from './channels';
  import { channelsCreateV1 } from './channels';

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





  //testing channelsListallV1 function.
  //similar to previous function test, but no matter if private or not.
 import { channelsListallV1 } from './channels';

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