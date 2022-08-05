
import request from 'sync-request';
// import { PORT, HOST } from './server';
import config from './config.json';
import { registerUser } from './dm.test';

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
    { email: 'notanemail.com', password: '1234567', nameFirst: 'James', nameLast: 'Bond', resExpect: BAD_REQ },
    { email: 'ThisisAnEmail@gmail.com', password: 'sub6', nameFirst: 'James', nameLast: 'Bond', resExpect: BAD_REQ },
    { email: 'ThisisAnEmail@gmail.com', password: '1234567', nameFirst: '', nameLast: 'Bond', resExpect: BAD_REQ },
    { email: 'ThisisAnEmail@gmail.com', password: '1234567', nameFirst: 'James', nameLast: '', resExpect: BAD_REQ },
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
  test('invalid token', () => {
    request('DELETE', url + '/clear/v1');
    request(
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
    // log out the user
    const res2 = request(
      'POST',
      url + '/auth/logout/v2',
      {
        body: JSON.stringify({
        }),
        headers: {
          'Content-type': 'application/json',
          token: 'notAToken',
        },
      }
    );
    expect(res2.statusCode).toStrictEqual(FORBID);
  });
  // test sucess
  test('given an active token log out', () => {
    request('DELETE', url + '/clear/v1');
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
        }),
        headers: {
          'Content-type': 'application/json',
          token: tok,
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

describe('testing authPasswordresetRequest', () => {
  // error conditions is bad email
  // with no error thrown expect an empty object return

  // with bad email no error should throw. Expect empty return obj
  test('bad email', () => {
    request('DELETE', url + '/clear/v1');
    registerUser('m13aboost.testingemail@gmail.com', '12345678', 'Austin', 'Powers');
    const res = passwordResetRequest('m13aboost.testingemail@gmail.com');

    expect(res.statusCode).toBe(OKAY);
    expect(JSON.parse(String(res.getBody()))).toEqual({});
  });
  // testing for sucessful call
  // on sucess expect all tokens the user has to become invalid
  // i.e log the user out globally as such calling logout should FORBID error
  test('sucessful call user has 1 token valid', () => {
    request('DELETE', url + '/clear/v1');
    const user = registerUser('austin_powers@gmail.com', '12345678', 'Austin', 'Powers');
    const res = passwordResetRequest('austin_powers@gmail.com');

    expect(res.statusCode).toBe(OKAY);
    expect(JSON.parse(String(res.getBody()))).toEqual({});
    expect(logoutUser(user.token).statusCode).toBe(FORBID);
  });
  test('sucessful call user has 5 token valid', () => {
    request('DELETE', url + '/clear/v1');
    const userEmail = 'm13aboost.testingemail@gmail.com';
    const userPassword = '12345678';

    const userToken0 = registerUser(userEmail, userPassword, 'Austin', 'Powers').token;
    // log in 4 times
    const userToken1 = JSON.parse(String(loginUser(userEmail, userPassword).getBody())).token;
    const userToken2 = JSON.parse(String(loginUser(userEmail, userPassword).getBody())).token;
    const userToken3 = JSON.parse(String(loginUser(userEmail, userPassword).getBody())).token;
    const userToken4 = JSON.parse(String(loginUser(userEmail, userPassword).getBody())).token;

    // now call password reset, expect all of the above tokens to become invalid
    const res = passwordResetRequest(userEmail);

    // check response codes for passwordResetRequest
    expect(res.statusCode).toBe(OKAY);
    expect(JSON.parse(String(res.getBody()))).toEqual({});

    // now check that every token is now invalid
    expect(logoutUser(userToken0).statusCode).toBe(FORBID);
    expect(logoutUser(userToken1).statusCode).toBe(FORBID);
    expect(logoutUser(userToken2).statusCode).toBe(FORBID);
    expect(logoutUser(userToken3).statusCode).toBe(FORBID);
    expect(logoutUser(userToken4).statusCode).toBe(FORBID);
  });
});
//  ///////////////////////////////////////////////////////////////////
//  ///////////////////////////////////////////////////////////////////
//  ///////////////////////////////////////////////////////////////////
//  ///////////////////////////////////////////////////////////////////

describe('testing authPasswordresetReset', () => {
  // can error 2 ways, bad newPassword or bad resetCode
  test('bad password reset code', () => {
    request('DELETE', url + '/clear/v1');
    registerUser('m13aboost.testingemail@gmail.com', '12345678', 'Austin', 'Powers');
    passwordResetRequest('m13aboost.testingemail@gmail.com');

    const res = passwordResetReset('ThisIsNOTaResetCode', '12345678');

    expect(res.statusCode).toBe(BAD_REQ);
  });
  // test('bad new password, too short', () => {
  //   request('DELETE', url + '/clear/v1');
  //   registerUser('m13aboost.testingemail@gmail.com', '12345678', 'Austin', 'Powers');
  //   passwordResetRequest('m13aboost.testingemail@gmail.com');

  //   // note that this test only tests the m13A_BOOST testing email
  //   const resetCode = getTestEmailResponseCode();
  //   // note that currntly this just uses a master reset code. It does not check
  //   // for a new code.
  //   const res = passwordResetReset(resetCode, '123');

  //   expect(res.statusCode).toBe(BAD_REQ);
  // });
  // test('good call. password resets', () => {
  //   request('DELETE', url + '/clear/v1');
  //   registerUser('m13aboost.testingemail@gmail.com', '12345678', 'Austin', 'Powers');
  //   passwordResetRequest('m13aboost.testingemail@gmail.com');

  //   // note that this test only tests the m13A_BOOST testing email
  //   const resetCode = getTestEmailResponseCode();
  //   // note that currntly this just uses a master reset code. It does not check
  //   // for a new code.
  //   const res = passwordResetReset(resetCode, 'ThisIsTheNewPassword');

  //   expect(res.statusCode).toBe(OKAY);
  //   expect(loginUser('m13aboost.testingemail@gmail.com', 'ThisIsTheNewPassword').statusCode).toBe(OKAY);
  // });
});
/// //////////////////////////////////////////////////////////////////////////////
/// //////////////////////////////////////////////////////////////////////////////
/// //////////////////////////////////////////////////////////////////////////////
// helper function - requests a password reset email, returns a response object
function passwordResetRequest(email: string) {
  return request(
    'POST',
    url + '/auth/passwordreset/request/v1',
    {
      body: JSON.stringify({
        email: email,
      }),
      headers: {
        'Content-type': 'application/json',
      },
    }
  );
}
// helper function - requests a password reset given code, returns a response object
function passwordResetReset(resetCode: string, newPassword: string) {
  return request(
    'POST',
    url + '/auth/passwordreset/reset/v1',
    {
      body: JSON.stringify({
        resetCode: resetCode,
        newPassword: newPassword,
      }),
      headers: {
        'Content-type': 'application/json',
      },
    }
  );
}
// helper function requests a logout, returns a response object
function logoutUser(token: string) {
  return request(
    'POST',
    url + '/auth/logout/v2',
    {
      headers: {
        'Content-type': 'application/json',
        token: token,
      },
    }
  );
}
// helper function requests a login, returns a response object
function loginUser(email: string, password: string) {
  return request(
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
}
// helper function that reads the inbox of
// m13aboost.testingemail@gmail.com to look for emails
// that have the subject 'UNSW Treats Passoword Reset Requested'
// reads the email and returns the body, which is just the code as a string.
// returns the string. Will throw error if it cannot read.
// currently returns a master reset code
// function getTestEmailResponseCode() {
// const Imap = require('imap');
// const {simpleParser} = require('mailparser');
// const imapConfig = {
//   user: 'm13aboost.testingemail@gmail.com',
//   password: 'ThisIsATestingAccount123',
//   host: 'imap.gmail.com',
//   port: 993,
//   tls: true,
// };

// const getEmails = () => {
//   try {
//     const imap = new Imap(imapConfig);
//     imap.once('ready', () => {
//       imap.openBox('INBOX', false, () => {
//         imap.search(['ALL', ['SINCE', new Date()]], (err, results) => {
//           const f = imap.fetch(results, {bodies: ''});
//           f.on('message', msg => {
//             msg.on('body', stream => {
//               simpleParser(stream, async (err, parsed) => {
//                 // const {from, subject, textAsHtml, text} = parsed;
//                 console.log(parsed);
//                 /* Make API call to save the data
//                    Save the retrieved data into a database.
//                    E.t.c
//                 */
//               });
//             });
//             msg.once('attributes', attrs => {
//               const {uid} = attrs;
//               imap.addFlags(uid, ['\\Seen'], () => {
//                 // Mark the email as read after reading it
//                 console.log('Marked as read!');
//               });
//             });
//           });
//           f.once('error', ex => {
//             return Promise.reject(ex);
//           });
//           f.once('end', () => {
//             console.log('Done fetching all messages!');
//             imap.end();
//           });
//         });
//       });
//     });

//     imap.once('error', err => {
//       console.log(err);
//     });

//     imap.once('end', () => {
//       console.log('Connection ended');
//     });

//     imap.connect();
//   } catch (ex) {
//     console.log('email parseing error occured');
//   }
// };

// getEmails();

// return 'master_reset';
// }
// function getTestEmailResponseCode() {
//   return 'MASTER_CODE';
// }
