import request from 'sync-request';
import config from './config.json';

const OK = 200;
const port = config.port;
const url = config.url;

describe('Tests for message/senddm/V1', () => {
  let token1: string;
  let token2: string;
  let dmId1: number;
  let dmId2: number;

  beforeEach(() => {
    //  member of: token1: [1], token2: [2]
    // TODO: find uIDs of token1 and token2 to pass in
    token1 = requestAuthUserRegisterV2('example1@email.com', 'password1', 'John', 'Smith');
    token2 = requestAuthUserRegisterV2('example2@email.com', 'password2', 'Jane', 'Citizen');
    dmId1 = requestDmCreateV1(token1, [1, 2]);
    dmId2 = requestDmCreateV1(token2, [2, 3]);
  });

  afterEach(() => {
    requestClear();
  });

  test('Case 1: token is invalid', () => {
    const res = requestMessageSendDmV1('invalid-token', dmId1, 'Message 1');

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({ error: 'error' });
  });

  test('Case 2: dmId does not refer to valid DM', () => {
    // NOTE: cannot use method as did before as cannot list all DMs in dataStore without referring to it
    const invalidId = Math.floor((Math.random() * 1000) + 1000);

    const res = requestMessageSendDmV1(token1, invalidId, 'Message 1');

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({ error: 'error' });
  });

  test('Case 3: length of message is less than 1 or more than 1000 characters', () => {
    // Generate 1000+ character message
    const testMessage100 = 'dlXqa8qv6YSWfOcAO7Vf9gAjigjRXGjHygJahreDg0yKUIpKRKhQWpruNwESu7nKdwtJU0zGsM34tgCm9CaWyPkV4hhVClmFfQNM';
    let testMessage1000 = '';
    for (let i = 0; i < 11; i++) {
      testMessage1000 = testMessage1000 + testMessage100;
    }

    const res1 = requestMessageSendDmV1(token1, dmId1, '');
    const res2 = requestMessageSendDmV1(token1, dmId1, testMessage1000);

    expect(res1.statusCode).toBe(OK);
    expect(res2.statusCode).toBe(OK);
    const bodyObj1 = JSON.parse(String(res1.getBody()));
    const bodyObj2 = JSON.parse(String(res2.getBody()));

    expect(bodyObj1).toStrictEqual({ error: 'error' });
    expect(bodyObj2).toStrictEqual({ error: 'error' });
  });

  test('Case 4: user not member of DM', () => {
    const res = requestMessageSendDmV1(token1, dmId2, 'Message 1');

    const bodyObj = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({ error: 'error' });
  });

  test('Case 5: successful message senddm', () => {
    const res = requestMessageSendDmV1(token1, dmId1, 'Message 1');
    const bodyObj = JSON.parse(String(res.getBody())).messageId;
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual(expect.any(Number)); // To change once format of ids finalised.
  });
});

function requestMessageSendDmV1(token: string, dmId: number, message: string) {
  return request(
    'POST',
        `${url}:${port}/message/senddm/v1`,
        {
          json: {
            token: token,
            dmId: dmId,
            message: message,
          }
        }
  );
}

/// /////////////////////////////////////////////////////////////////////////////
/// /////////////////////////////////////////////////////////////////////////////
/// /////////////////////        Helper Functions       /////////////////////////
/// /////////////////////////////////////////////////////////////////////////////
/// /////////////////////////////////////////////////////////////////////////////
function requestAuthUserRegisterV2(email: string, password: string, nameFirst: string, nameLast: string) {
  const res = request(
    'POST',
      `${url}:${port}/auth/register/v2`,
      {
        json: {
          email: email,
          password: password,
          nameFirst: nameFirst,
          nameLast: nameLast
        }
      }
  );

  return JSON.parse(String(res.getBody())).token;
}

function requestDmCreateV1(token: string, uIds: Array<number>) {
  const res = request(
    'POST',
      `${url}:${port}/dm/create/v1`,
      {
        json: {
          token: token,
          uIds: uIds,
        }
      }
  );

  return JSON.parse(String(res.getBody())).dmId;
}

function requestClear() {
  const res = request(
    'DELETE',
      `${url}:${port}/clear/v1`
  );

  return JSON.parse(String(res.getBody()));
}
