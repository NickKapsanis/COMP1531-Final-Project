import request from 'sync-request';
import config from './config.json';

const OK = 200;
const port = config.port;
const hosturl = config.url;
const url = hosturl + ':' + port;

/*
/////////////////////////////////////////////
///          Tests for clearV1()        /////
/////////////////////////////////////////////
*/

describe('Testing clearV1()', () => {
  test('', () => {
    request(
      'POST',
      url + '/auth/register/v2',
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
      url + '/clear/v1',
      {
        qs: {},
      }
    );

    const body = JSON.parse(String(res2.getBody()));
    expect(body).toStrictEqual({});
    expect(res2.statusCode).toBe(OK);
    const res3 = request(
      'POST',
      url + '/auth/login/v2',
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

/*
/////////////////////////////////////////////
///     Tests for Notifications/get     /////
/////////////////////////////////////////////
*/

















// Helper Functions 

/* Function to get Notifications from server
 PARAMETERS - 
  token : string 

  RETURN - 
  Error code:        Number (Incase of error)
  {notifications}:   An object containing an array of 
                     20 of the user's latest notifications

*/
function requestGetNotifications(token: string) {
  const res = request(
    'GET',
    url + '/notifications/get/v1',
    {
      headers: {
        token: token,
      }
    }
  )

  if (res.statusCode !== OK) {
    return (res.statusCode);
  }

  return (JSON.parse(String(res.getBody())));
}

function requestMessageReact(token: string, messageId: number, reactId: number) {
  const res = request(
    'POST',
    url + '/message/react/v1',
    {
      body : JSON.stringify({
        messageId: messageId,
        reactId: reactId,
      }),
      headers: {
        token: token,
      }
    }
  )

  if (res.statusCode !== OK) {
    return (res.statusCode);
  }

  return (JSON.parse(String(res.getBody())));
}

function requestCreateUser(token: string, messageId: number, reactId: number) {
  const res = request(
    'POST',
    url + '/message/react/v1',
    {
      body : JSON.stringify({
        messageId: messageId,
        reactId: reactId,
      }),
      headers: {
        token: token,
      }
    }
  )

  if (res.statusCode !== OK) {
    return (res.statusCode);
  }

  return (JSON.parse(String(res.getBody())));
}

const createUser = (emails: string, passwords: string, name: string, surname: string) => {
  const res = request(
    'POST', url + '/auth/register/v3',
    {
      body: JSON.stringify({ email: emails, password: passwords, nameFirst: name, nameLast: surname }),
      headers: {
        'Content-type': 'application/json',
      },
    }
  );
  return JSON.parse(String(res.getBody()));
};

const createChannel = (tokens: string, names: string, publicity: boolean) => {
  const res = request(
    'POST',
    url + '/channels/create/v2',
    {
      body: JSON.stringify({name: names, isPublic: publicity}),
      headers: {
        token: tokens,
        'Content-type': 'application/json',
      },
    }
  );
  return JSON.parse(String(res.getBody()));
};

