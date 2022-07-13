import { authRegisterV1, authLoginV1 } from './auth.js'
import { clearV1, getUId } from './other.js'

////////////////////////////////////////////////
/////          Tests for clearV1()         /////
////////////////////////////////////////////////

describe('Testing clear()', () => {

  test('', () => {
    
    const testAuthId = authRegisterV1('testemail@email.com', 'testPassword123', 'testFirstName', 'testLastName').authUserId;
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
    const testAuthId = authRegisterV1('testemail@email.com', 'testPassword123', 'testFirstName', 'testLastName').authUserId;
    expect(getUId(testAuthId)).toStrictEqual(testAuthId);

  });

  test('Testing getUId for incorrect input', () => {

    clearV1();
    expect(getUId(-1)).toStrictEqual({ error : 'error' });
    
  });

});

