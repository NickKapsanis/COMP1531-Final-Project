 //@module channel.test



  //testing channelsListV1 function.
  //similar to previous function test, but no matter if private or not.
  import { channelsListV1 } from './channels';

  test('tests if all correct channels are listed in channel list', () => {
   let firstCreatedChannel = channelsCreateV1(1234, James, true);
   let secondCreatedChannel = channelsCreateV1(1234, James, false);
   let thirdCreatedChannel = channelsCreateV1(6969, Rufus, true);
   let fourthCreatedChannel = channelsCreateV1(1234, James, true);
   let fifthCreatedChannel = channelsCreateV1(6969, Rufus, false);
 
   let jamesChannelArray = channelsListV1(1234);
 
   expect(jamesChannelArray[0]).toEqual(firstCreatedChannel);
   expect(jamesChannelArray[1]).toEqual(fourthCreatedChannel);
 
   expect(jamesChannelArray[0].isPublic).toEqual(true);
   expect(jamesChannelArray[1].isPublic).toEqual(true);
 
  });
  
 
  test('tests if correct channel properties are listed in channel list', () => {
    let firstCreatedChannel = channelsCreateV1(4321, Alice, true);
    let secondCreatedChannel = channelsCreateV1(4321, Alice, true);
    let thirdCreatedChannel = channelsCreateV1(4210, Damian, false);
    let fourthCreatedChannel = channelsCreateV1(4321, Alice, true);
    let fifthCreatedChannel = channelsCreateV1(4210, Damian, true);
 
   let aliceChannelArray = channelsListV1(4321);
 
   expect(aliceChannelArray[0].isPublic).toEqual(true);
   expect(aliceChannelArray[1].isPublic).toEqual(true);
   expect(aliceChannelArray[2].isPublic).toEqual(true);
 
   expect(aliceChannelArray[0].name).toEqual('Alice');
   expect(aliceChannelArray[1].name).toEqual('Alice');
   expect(aliceChannelArray[2].name).toEqual('Alice');
 
  });

  //testing channelsListallV1 function.
  //similar to previous function test, but no matter if private or not.
 import { channelsListallV1 } from './channels';

 test('tests if all correct channels are listed in channel list', () => {
  let firstCreatedChannel = channelsCreateV1(1234, James, false);
  let secondCreatedChannel = channelsCreateV1(1234, James, false);
  let thirdCreatedChannel = channelsCreateV1(6969, Rufus, false);
  let fourthCreatedChannel = channelsCreateV1(1234, James, true);

  let jamesChannelArray = channelsListallV1(1234);

  expect(jamesChannelArray[0]).toEqual(firstCreatedChannel);
  expect(jamesChannelArray[1]).toEqual(secondCreatedChannel);
  expect(jamesChannelArray[2]).toEqual(fourthCreatedChannel);

  expect(jamesChannelArray[1].isPublic).toEqual(false);
  expect(jamesChannelArray[2].isPublic).toEqual(true);

 });
 

 test('tests if correct channel properties are listed in channel list', () => {
  let firstCreatedChannel = channelsCreateV1(4321, Alice, false);
  let secondCreatedChannel = channelsCreateV1(4321, Alice, true);
  let thirdCreatedChannel = channelsCreateV1(6969, Rufus, false);
  let fourthCreatedChannel = channelsCreateV1(4321, Alice, true);

  let jamesChannelArray = channelsListallV1(4321);

  expect(jamesChannelArray[0].isPublic).toEqual(false);
  expect(jamesChannelArray[1].isPublic).toEqual(true);
  expect(jamesChannelArray[2].isPublic).toEqual(true);

  expect(jamesChannelArray[0].name).toEqual('Alice');
  expect(jamesChannelArray[1].name).toEqual('Alice');
  expect(jamesChannelArray[2].name).toEqual('Alice');

 });









 /*
 
 // You can remove or replace this with your own tests.
 // TIP: you may want to explore "test.each"
 describe('Example block of tests', () => {
   test('Example test 1', () => {
     expect(checkPassword('something')).toEqual('Poor Password');
   });
 
   test('Example test 2', () => {
     expect(checkPassword('not a good test')).toEqual('Poor Password');
   });
 });
 
 */
 