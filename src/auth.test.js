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

  describe('Testing authRegisterV1 for string handle output' , () => {
    test.each([
        {email: 'ThisisAnEmail@gmail.com', password: '1234567', nameFirst: 'James', nameLast: 'Bond', handle: 'jamesbond'},
        {email: 'ThisisAnEmail@gmail.com', password: '1234567', nameFirst: 'J', nameLast: 'Bond', handle: 'jbond'},
        {email: 'ThisisAnEmail@gmail.com', password: '1234567', nameFirst: 'James', nameLast: 'Bond007', handle: 'jamesbond007'},
        {email: 'ThisisAnEmail@gmail.com', password: '1234567', nameFirst: 'James', nameLast: 'Bond0123456789012345678910', handle: 'jamesbond01234567890'},
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