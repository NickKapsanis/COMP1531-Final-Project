
import request from "sync-request"
import { PORT, HOST } from './server'

const url = 'http://' + HOST + ':' + PORT;

// /////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////

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
          }),
          headers: {
            'Content-type' : 'application/json',
          },
        }
      )
      const bodyObj = JSON.parse(String(res.getBody()));
      expect(bodyObj).toStrictEqual({ error: 'error'});
      expect(res.statusCode).toStrictEqual(200);
    });
  }
  )

// /////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////

describe('testing registration for sucess', () => {
  test('registration correct parameters', () => {
    const res = request(
      'POST', 
      url + '/auth/register/v2', 
      {
        body: JSON.stringify({
          email: 'james.bond@gmail.com',
          password: '12345678',
          nameFirst: 'James',
          nameLast: 'Bond',
        }),
        headers: {
          'Content-type' : 'application/json',
        },
      }
    )
      const bodyObj = JSON.parse(String(res.getBody()));
      expect(bodyObj).toEqual(
        expect.objectContaining({
          token: expect.any(String),
          authUserId: expect.any(Number),
        })
      );
      expect(res.statusCode).toStrictEqual(200);
  });
});
// /////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////
/*
describe('testing authLoginV1 for input errors', () => {

  beforeEach(() => {
    request('DELETE', url + '/clear/v1');
    const info = {
      email: 'TheEmail@gmail.com',
      password: '1234567',
      nameFirst: 'James',
      nameLast: 'Bond',
    }
    const res = request(
      'POST', 
      url + '/auth/register/v2', 
      {
        body: JSON.stringify({
          email: info.email,
          password: info.password,
          nameFirst: info.nameFirst,
          nameLast: info.nameLast,
        })
      })
    });

  test.each([
    {email: 'NotTheEmail@gmail.com', password: '1234567', d: 'incorrect email (email does not belong to a user)'},
    {email: 'TheEmail@gmail.com', password: 'notThePassword', d: 'incorrect password (password does not match the email given)'},
    {email: 'NotTheEmail@gmail.com', password: 'notThePassword', d: 'incorrect email and password'},
  ]) ('$d', ({email, password, d}) => {
    const res = request(
      'POST', 
      url + '/auth/login/v2', 
      {
        body: JSON.stringify({
          email: email,
          password: password,
        })
      })
        const bodyObj = JSON.parse(String(res.getBody()));
        expect(bodyObj).toEqual({error: 'error'});
        expect(res.statusCode).toStrictEqual(200);
   });

  test.each([
    {email: 'TheEmail@gmail.com', password: '1234567', d: 'email and password match'},
   // {email: '', password: '', d: ''},
  ]) ('$d', ({email, password, d}) => {
    const res = request(
      'POST', 
      url + '/auth/login/v2', 
      {
        body: JSON.stringify({
          email: email,
          password: password,
        })
      })
    const bodyObj = JSON.parse(String(res.getBody()));
    expect(bodyObj).toEqual(
      expect.objectContaining({
        token: expect.any(Number),
        authUserId: expect.any(Number),
      })
    );
    expect(res.statusCode).toStrictEqual(200);
  });
 });


                                                                                                */

// /////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////
// describe('testing authLogoutV1', () => {


//     request('DELETE', url + '/clear/v1');
//     const info = {
//       email: 'TheEmail@gmail.com',
//       password: '1234567',
//       nameFirst: 'James',
//       nameLast: 'Bond',
//     }
//     const res = request(
//       'POST', 
//       url + '/auth/register/v2', 
//       {
//         body: JSON.stringify({
//           email: info.email,
//           password: info.password,
//           nameFirst: info.nameFirst,
//           nameLast: info.nameLast,
//         })
//       })


//   test.each([
//     {email: 'NotTheEmail@gmail.com', password: '1234567', d: 'incorrect email (email does not belong to a user)'},
//     {email: 'TheEmail@gmail.com', password: 'notThePassword', d: 'incorrect password (password does not match the email given)'},
//     {email: 'NotTheEmail@gmail.com', password: 'notThePassword', d: 'incorrect email and password'},
//   ]) ('$d', ({email, password, d}) => {
//     const res = request(
//       'POST', 
//       url + '/auth/login/v2', 
//       {
//         body: JSON.stringify({
//           email: email,
//           password: password,
//         })
//       })
//         const bodyObj = JSON.parse(String(res.getBody()));
//         expect(bodyObj).toEqual({error: 'error'});
//         expect(res.statusCode).toStrictEqual(200);
//    });

//   test.each([
//     {email: 'TheEmail@gmail.com', password: '1234567', d: 'email and password match'},
//    // {email: '', password: '', d: ''},
//   ]) ('$d', ({email, password, d}) => {
//     const res = request(
//       'POST', 
//       url + '/auth/login/v2', 
//       {
//         body: JSON.stringify({
//           email: email,
//           password: password,
//         })
//       })
//     const bodyObj = JSON.parse(String(res.getBody()));
//     expect(bodyObj).toEqual(
//       expect.objectContaining({
//         token: expect.any(Number),
//         authUserId: expect.any(Number),
//       })
//     );
//     expect(res.statusCode).toStrictEqual(200);
//   });
//  });

//  ///////////////////////////////////////////////////////////////////
//  ///////////////////////////////////////////////////////////////////
//  ///////////////////////////////////////////////////////////////////
//  ///////////////////////////////////////////////////////////////////

 