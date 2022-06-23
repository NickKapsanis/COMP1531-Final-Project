import { authRegisterV1, authLoginV1 } from './auth.js'
import { clearV1 } from './other.js'

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


