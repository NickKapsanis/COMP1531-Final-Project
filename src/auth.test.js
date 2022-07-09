import { authRegisterV1, authLoginV1 } from './auth';
import { clearV1 } from './other'
import { request } from 'sync-request'
import { PORT, HOST } from './server'

const url = 'http://' + HOST + ':' + PORT;

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
      const res = request(
        'POST', 
        url + '/auth/register/v2', 
        {
          body: JSON.stringify({
            email: email,
            password: password,
            nameFirst: nameFirst,
            nameLast: nameLast,
          })
        }
      )
      const bodyObj = JSON.parse(String(res.getBody()));
      expect(bodyObj).toStrictEqual(2);
      //expect(authRegisterV1(email, password, nameFirst, nameLast)).toStrictEqual({ error: 'error' });
    });
 
  }
  )

describe('testing that sequential registration does not produce identical authUserId', () => {
  test('non matching authUserId for sequential registration', () => {
    clearV1();
    const authUserId1 = authRegisterV1('james.bond@gmail.com', '1234567', 'James', 'Bond').authUserId;
    expect(authRegisterV1('jimmyBond@gmail.com','1234567', 'Jimmy', 'Bond').authUserId).toEqual(expect.any(Number));
    expect(authRegisterV1('jimBond@gmail.com','1234567', 'Jim', 'Bond').authUserId).not.toEqual(authUserId1);
  });

});

describe('testing authLoginV1 for input errors', () => {

  let authUserId1;
  beforeEach( () => {
    clearV1();
    authUserId1 = authRegisterV1('TheEmail@gmail.com', '1234567', 'James', 'Bond').authUserId;
  });

  test.each([
    {email: 'NotTheEmail@gmail.com', password: '1234567', d: 'incorrect email (email does not belong to a user)'},
    {email: 'TheEmail@gmail.com', password: 'notThePassword', d: 'incorrect password (password does not match the email given)'},
    {email: 'NotTheEmail@gmail.com', password: 'notThePassword', d: 'incorrect email and password'},
   // {email: '', password: '', d: ''},
  ]) ('$d', ({email, password, d}) => {
    expect(authLoginV1(email, password)).toEqual({error: 'error'});
  });

  test.each([
    {email: 'TheEmail@gmail.com', password: '1234567', d: 'email and password match'},
   // {email: '', password: '', d: ''},
  ]) ('$d', ({email, password, d}) => {
    expect(authLoginV1(email, password).authUserId).toEqual(authUserId1);
  });

  test.each([
    {email: '', password: '', d: 'Both string empty'},
    {email: 12, password: '123', d: 'email is not a string'},
    {email: 'email@email.com', password: 12, d: 'password is not a string'},
  ]) ('$d', ({email, password, d}) => {
    expect(authLoginV1(email, password)).toEqual({error : 'error'});
  })
});