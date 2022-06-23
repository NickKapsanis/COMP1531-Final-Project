import { channelsCreateV1, channelsListV1 } from './channels.js';
import { authRegisterV1, authLoginV1 } from './auth.js'
import { clearV1, getUId} from './other.js'

////////////////////////////////////////////////
/////          Tests for clearV1()         /////
////////////////////////////////////////////////

describe('Testing clearV1()', () => {

  test('Testing if dataStore is cleared after new data is added', () => {
    
    const testAuthId = authRegisterV1('testemail@email.com', 'testPassword123', 'testFirstName', 'testLastName');
    clearV1();
    expect(authLoginV1('testemail@email.com', 'testPassword123')).toStrictEqual({ error : 'error' });
  });
});

////////////////////////////////////////////////
/////          Tests for getUId()     	   /////
////////////////////////////////////////////////

describe('Testing getUID()', () => {
  test('Testing getUId for correct input', () => {

    clearV1();
    const testAuthId = authRegisterV1('testemail@email.com', 'testPassword123', 'testFirstName', 'testLastName');
    expect(getUId(testAuthId)).toStrictEqual(testAuthId);

  });

  test('Testing getUId for incorrect input', () => {

    clearV1();
    expect(getUId(-1)).toStrictEqual({ error : 'error' });
    
  });

});
