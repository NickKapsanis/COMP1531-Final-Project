import { channelsListV1, channelsListallV1, channelsCreateV1 } from './channels.js';
import { authRegisterV1 } from './auth.js'
import { clearV1, getUId } from './other.js'
import { channelDetailsV1 } from './channel.js'

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
    const testAllMembers = testChannel2.allMembers.find(i => i === testUId);
    const testOwnerMembers = testChannel2.ownerMembers.find(i => i === testUId);
    expect(testAllMembers).toStrictEqual(testUId);
    expect(testOwnerMembers).toStrictEqual(testUId);

  });

});