import { channelsListV1, channelsListallV1, channelsCreateV1 } from './channels.js';
import { authRegisterV1 } from './auth.js'
import { clearV1 } from './other.js'
import { getData } from './dataStore.js'

// Manav 
////////////////////////////////////////////////
/////      Tests for channelsListV1() 	   /////
////////////////////////////////////////////////

//  Manav
////////////////////////////////////////////////
/////    Tests for channelsListAllV1()	   /////
////////////////////////////////////////////////


////////////////////////////////////////////////
/////    Tests for channelsCreateV1() 	   /////
////////////////////////////////////////////////

describe('Testing channelsCreateV1()', () => {

  test('Testing if error is returned when name length < 1', () => {

    clearV1();
    const testAuthId = authRegisterV1('testemail@email.com', 'testPassword123', 'testFirstName', 'testLastName');
    const output = channelsCreateV1(testAuthId, "", true);
    expect(output1).toStrictEqual({ error : 'error' });
  
  });

  test('Testing if error is returned when name length > 20', () => {

    clearV1();
    const testAuthId = authRegisterV1('testemail@email.com', 'testPassword123', 'testFirstName', 'testLastName');
    const output = channelsCreateV1(testAuthId, "thisIsAVeryLongChannelNameWhichIsInvalid", true);
    expect(output1).toStrictEqual({ error : 'error' });
  
  });

  test('Testing if error is returned when authUserId does not exist', () => {

    clearV1();
    const testAuthId = -111;
    const output = channelsCreateV1(testAuthId, "testChannelName", true);
    expect(output1).toStrictEqual({ error : 'error' });
  
  });

  test('Testing correct input - (i)', () => {
    
    clearV1();
    const testAuthId = authRegisterV1('testemail@email.com', 'testPassword123', 'testFirstName', 'testLastName');
    const output = channelsCreateV1(testAuthId, "testChannelName", false); 
    expect(output).toStrictEqual(expect.any(Number));
    const dataStore = getData();
    const check = dataStore.channels.find(check => check.channelId === output);
    expect(check['name']).toStrictEqual('testChannelName');
    expect(check['isPublic']).toStrictEqual(false);

  });

  test('Testing correct input - (ii)', () => {
    
    clearV1();
    const testAuthId = authRegisterV1('testemail@email.com', 'testPassword123', 'testFirstName', 'testLastName');
    const output = channelsCreateV1(testAuthId, "testChannelName", true); 
    expect(output).toStrictEqual(expect.any(Number));
    const dataStore = getData();
    const check = dataStore.channels.find(check => check.channelId === output);
    // check length of all memebers
    const checkAllMembers = check.allMembers.find(i => i === testAuthId);
    expect(check['name']).toStrictEqual('testChannelName');
    expect(check['isPublic']).toStrictEqual(true);

  });

});

test('Testsing ', () => {

  // Testing if valid number is given as channel Id
  // Testing if dataStore has new channel  
  // Testing if user channels include new channel
  // Testing if channels includes user  
});

test('Tests for channelsCreateV1', () => {
  // Testing if error is returned when authUserId does not exist
  // Testing if error is returned when name length < 1 or > 20 chars
  // Testing if valid number is given as channel Id
  // Testing if dataStore has new channel  
  // Testing if user channels include new channel
  // Testing if channels includes user  
});

test('Tests for channelsCreateV1', () => {
  // Testing if error is returned when authUserId does not exist
  // Testing if error is returned when name length < 1 or > 20 chars
  // Testing if valid number is given as channel Id
  // Testing if dataStore has new channel  
  // Testing if user channels include new channel
  // Testing if channels includes user  
});

test('Tests for channelsCreateV1', () => {
  // Testing if error is returned when authUserId does not exist
  // Testing if error is returned when name length < 1 or > 20 chars
  // Testing if valid number is given as channel Id
  // Testing if dataStore has new channel  
  // Testing if user channels include new channel
  // Testing if channels includes user  
});

test('Test invalid echo', () => {
  expect(echo({ echo: 'echo' })).toStrictEqual({ error: 'error' });
});

