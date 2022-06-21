import { channelsCreateV1, channelsListV1 } from './channels.js';
import { authRegisterV1 } from './auth.js'
import { clearV1, getUId} from './other.js'

////////////////////////////////////////////////
/////          Tests for clearV1()         /////
////////////////////////////////////////////////

describe('Testing clear()', () => {

  test('', () => {
    
    const testAuthId = authRegisterV1('testemail@email.com', 'testPassword123', 'testFirstName', 'testLastName');
    const testChannelId = channelsCreateV1(testAuthId, "testChannelName", false); 
    clearV1();
    expect(channelsListV1(testAuthId)).toStrictEqual({ error : 'error' });
  
  });
});

////////////////////////////////////////////////
/////          Tests for getUId()     	   /////
////////////////////////////////////////////////

test('Testing getUId', () => {
  clearV1();
  const testAuthId = authRegisterV1('testemail@email.com', 'testPassword123', 'testFirstName', 'testLastName');
  expect(getUId(testAuthId)).toStrictEqual(testAuthId);
});


