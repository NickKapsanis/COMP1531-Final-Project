import request from 'sync-request';
import config from './config.json';

const OK = 200;
const port = config.port;
const url = config.url;

/*
/////////////////////////////////////////////
///          Tests for clearV1()        /////
/////////////////////////////////////////////
*/

describe('Testing clearV1()', () => {
  test('', () => {
    request(
      'POST',
      `${url}:${port}/auth/register/v2`,
      {
        body: JSON.stringify({
          email: 'testemail@email.com',
          password: 'testPassword123',
          nameFirst: 'testFirstName',
          nameLast: 'testLastName'
        }),
        headers: {
          'Content-type': 'application/json',
        }
      }
    );

    const res2 = request(
      'DELETE',
      `${url}:${port}/clear/v1`
    );

    const body = JSON.parse(String(res2.getBody()));
    expect(res2.statusCode).toBe(OK);
    expect(body).toStrictEqual({});

    const res3 = request(
      'POST',
      `${url}:${port}/auth/login/v2`,
      {
        body: JSON.stringify({
          email: 'testemail@email.com',
          password: 'testPassword123',
        }),
        headers: {
          'Content-type': 'application/json',
        }
      }
    );

    const body1 = JSON.parse(String(res3.getBody()));
    expect(res3.statusCode).toBe(OK);
    expect(body1).toStrictEqual({ error: 'error' });
  });
});
