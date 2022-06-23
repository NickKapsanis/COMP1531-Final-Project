import { channelsCreateV1, channelsListV1 } from './channels.js';
import { authRegisterV1, authLoginV1 } from './auth.js'
import { clearV1, getUId} from './other.js'

////////////////////////////////////////////////
/////          Tests for clearV1()         /////
////////////////////////////////////////////////

describe('Testing clear()', () => {

  test('', () => {
    
    const testAuthId = authRegisterV1('testemail@email.com', 'testPassword123', 'testFirstName', 'testLastName');
    clearV1();
    expect(authLoginV1('testemail@email.com', 'testPassword123')).toStrictEqual({ error : 'error' });
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
