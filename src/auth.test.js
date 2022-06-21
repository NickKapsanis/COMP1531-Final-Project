import { authRegisterV1, authLoginV1, containsEmail } from './auth';


describe('Testing authRegisterV1 for input Error' , () => {
    test.each([
      {email: 'notanemail.com', password: '1234567', nameFirst: 'James', nameLast: 'Bond'},
      {email: 'ThisisAnEmail@gmail.com', password: 'sub6', nameFirst: 'James', nameLast: 'Bond'},
      {email: 'ThisisAnEmail@gmail.com', password: '1234567', nameFirst: '', nameLast: 'Bond'},
      {email: 'ThisisAnEmail@gmail.com', password: '1234567', nameFirst: 'James', nameLast: ''},
      {email: 'ThisisAnEmail@gmail.com', password: '1234567',
       nameFirst: 'James012345678901234567890123456789012345678901234567890',
        nameLast: 'Bond'},
        {email: 'ThisisAnEmail@gmail.com', password: '1234567',
       nameFirst: 'James',
        nameLast: 'Bond012345678901234567890123456789012345678901234567890'},
        //{email: 'email123@gmail.com', password: '1234567', nameFirst: 'James', nameLast: 'Bond'},
    ]) ('authRegisterV1($email , $password, $nameFirst, $nameLast)', (
        {
        email,
        password,
        nameFirst,
        nameLast,
    }
    ) => {
      expect(authRegisterV1(email, password, nameFirst, nameLast)).toStrictEqual({ error: 'error' });
    });
  }
  )
  // This testing does not work with the return value of  authRegisterV1 === authUserId
  // This testing checked that the handle generated by authRegisterV1 matched the specifications in the brief by modifying
  // authRegister to return the handle.
  
  /*
  clearV1()
  describe('Testing authRegisterV1 for string handle output' , () => {
    test.each([
        {email: 'Email@gmail.com', password: '1234567', nameFirst: 'James', nameLast: 'Bond', handle: 'jamesbond'},
        {email: 'Email1@gmail.com', password: '1234567', nameFirst: 'JAMES', nameLast: 'bond', handle: 'jamesbond0'},
        {email: 'Email2@gmail.com', password: '1234567', nameFirst: 'J##$ames', nameLast: 'Bond&*&^', handle: 'jamesbond1'},
        {email: 'Email3@gmail.com', password: '1234567', nameFirst: 'James', nameLast: 'Bond', handle: 'jamesbond2'},
      ]) ('authRegisterV1($email , $password, $nameFirst, $nameLast)', (
          {
          email,
          password,
          nameFirst,
          nameLast,
          handle,
      }
      ) => {
        expect(authRegisterV1(email, password, nameFirst, nameLast)).toStrictEqual(handle);
      });

  }
  )
  */
  
expect(authRegisterV1('james.bond@gmail.com', '1234567', 'James', 'Bond')).toEqual(1);
expect(authRegisterV1('007Bond@gmail.com','1234567', 'Jimmy', 'Bond', )).toEqual(2);