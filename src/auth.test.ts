
import request from 'sync-request';
// import { PORT, HOST } from './server';
import config from './config.json';

const port = config.port;
const hosturl = config.url;
const url = hosturl + ':' + port;

const FORBID = 403;
const BAD_REQ = 400;
const OKAY = 200;

// /////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////

describe('Testing authRegisterV3 for input Error', () => {
  test.each([
    { email: 'notanemail.com', password: '1234567', nameFirst: 'James', nameLast: 'Bond', resExpect: BAD_REQ},
    { email: 'ThisisAnEmail@gmail.com', password: 'sub6', nameFirst: 'James', nameLast: 'Bond', resExpect: BAD_REQ},
    { email: 'ThisisAnEmail@gmail.com', password: '1234567', nameFirst: '', nameLast: 'Bond', resExpect: BAD_REQ},
    { email: 'ThisisAnEmail@gmail.com', password: '1234567', nameFirst: 'James', nameLast: '', resExpect: BAD_REQ},
    {
      email: 'ThisisAnEmail@gmail.com',
      password: '1234567',
      nameFirst: 'James012345678901234567890123456789012345678901234567890',
      nameLast: 'Bond',
      resExpect: BAD_REQ
    },
    {
      email: 'ThisisAnEmail@gmail.com',
      password: '1234567',
      nameFirst: 'James',
      nameLast: 'Bond012345678901234567890123456789012345678901234567890',
      resExpect: BAD_REQ
    },
    // {email: 'email123@gmail.com', password: '1234567', nameFirst: 'James', nameLast: 'Bond'},
  ])('authRegisterV3($email , $password, $nameFirst, $nameLast)', (
    {
      email,
      password,
      nameFirst,
      nameLast,
      resExpect,
    }
  ) => {
    const res = request(
      'POST',
      url + '/auth/register/v3',
      {
        body: JSON.stringify({
          email: email,
          password: password,
          nameFirst: nameFirst,
          nameLast: nameLast,
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );
    expect(res.statusCode).toStrictEqual(resExpect);
  });
}
);

// /////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////

describe('testing registration for sucess', () => {
  test('registration correct parameters', () => {
    request('DELETE', url + '/clear/v1');
    const res = request(
      'POST',
      url + '/auth/register/v3',
      {
        body: JSON.stringify({
          email: 'james.bond@gmail.com',
          password: '12345678',
          nameFirst: 'James',
          nameLast: 'Bond',
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );
    const bodyObj = JSON.parse(String(res.getBody()));
    expect(bodyObj).toEqual(
      expect.objectContaining({
        token: expect.any(String),
        authUserId: expect.any(Number),
      })
    );
    expect(res.statusCode).toStrictEqual(OKAY);
  });
});

// /////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////

describe('testing authLoginV3 for input errors', () => {
  beforeEach(() => {
    request('DELETE', url + '/clear/v1');
    request(
      'POST',
      url + '/auth/register/v3',
      {
        body: JSON.stringify({
          email: 'TheEmail@gmail.com',
          password: '1234567',
          nameFirst: 'The',
          nameLast: 'Tester',
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );
  });

  test.each([
    { email: 'NotTheEmail@gmail.com', password: '1234567', d: 'incorrect email (email does not belong to a user)' },
    { email: 'TheEmail@gmail.com', password: 'notThePassword', d: 'incorrect password (password does not match the email given)' },
    { email: 'NotTheEmail@gmail.com', password: 'notThePassword', d: 'incorrect email and password' },
  ])('$d', ({ email, password }) => {
    const res = request(
      'POST',
      url + '/auth/login/v3',
      {
        body: JSON.stringify({
          email: email,
          password: password,
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );
    expect(res.statusCode).toBe(BAD_REQ);
  });
  /// /////////////////////////////////////////////////////////////////////////
  /// /////////////////////////////////////////////////////////////////////////

  test.each([
    { email: 'TheEmail@gmail.com', password: '1234567', d: 'email and password match' },
  ])('$d', ({ email, password }) => {
    const res = request(
      'POST',
      url + '/auth/login/v3',
      {
        body: JSON.stringify({
          email: email,
          password: password,
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );
    const bodyObj = JSON.parse(String(res.getBody()));
    expect(bodyObj).toEqual(
      expect.objectContaining({
        token: expect.any(String),
        authUserId: expect.any(Number),
      })
    );
    expect(res.statusCode).toStrictEqual(OKAY);
  });
});

// /////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////
describe('testing auth/logout/v2', () => {
  test('given an active token log out', () => {
    const res1 = request(
      'POST',
      url + '/auth/register/v3',
      {
        body: JSON.stringify({
          email: 'ThisIsaUser@gmail.com',
          password: '1234567',
          nameFirst: 'The',
          nameLast: 'Tester',
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }
    );
    const tok = JSON.parse(String(res1.getBody())).token;
    // log out the user
    const res2 = request(
      'POST',
      url + '/auth/logout/v2',
      {
        body: JSON.stringify({
          token: tok,
        }),
        headers: {
          'Content-type': 'application/json',
          token : tok,
        },
      }
    );
    const bodyObj = JSON.parse(String(res2.getBody()));
    expect(bodyObj).toEqual({});
    expect(res2.statusCode).toStrictEqual(OKAY);
  });
});

//  ///////////////////////////////////////////////////////////////////
//  ///////////////////////////////////////////////////////////////////
//  ///////////////////////////////////////////////////////////////////
//  ///////////////////////////////////////////////////////////////////
