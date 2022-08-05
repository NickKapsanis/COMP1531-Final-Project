import request from 'sync-request';
import config from './config.json';
import { createUser, createChannel, userType } from './channel.test';
import { messageSendV1, messageSendDmV1 } from './message';
import { dmCreateV2 } from './dm';
import { getUID } from './channel.test';
import { message } from './dataStore';

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
      url + '/auth/register/v3',
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
      url + '/auth/login/v3',
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
    expect(res3.statusCode).toBe(400);
  });
});

/*
/////////////////////////////////////////////
///         Tests for searchV1()        /////
/////////////////////////////////////////////
*/

function searchV1(token: string, queryStr: string) {
  const res = request(
    'GET',
        `${hosturl}:${port}/search/v1`,
        {
          qs: {
            queryStr: queryStr,
          },
          headers: {
            token: token,
          }
        }
  );
  if (res.statusCode !== 200) {
    return res.statusCode;
  }
  return JSON.parse(String(res.getBody()));
}

describe('testing for SearchV1', () => {
  let homer: userType, bart: userType, bartuId: number;

  beforeEach(() => {
    request('DELETE', url + '/clear/v1');
    homer = createUser('homer@gmail.com', 'testPassword123', 'homer', 'Brown');
    bart = createUser('bart@gmail.com', 'testPassword123', 'bart', 'Hayes');
    bartuId = getUID(bart.authUserId);
  });

  test('bad token', () => {
    expect(searchV1('bad token', 'search')).toEqual(403);
  });
  test('query string too short', () => {
    expect(searchV1(homer.token, '')).toEqual(400);
  });
  test('query string too long', () => {
    expect(searchV1(homer.token, `bljUwrWuzjLodaeOV97GSZ23rlzLz6AyqSZm5V9EgJLxVv8ZIIyQI6HV
    83X78XZaB53wCUVSUeuZpzOr9jpBEPxs4UR1qMZsX2DGR0P1GoRdugJ4F2Ct803XNlNMTFnQ6D5wwaokuKs
    CQquJYLcdDkbFrWW9xZQCglXWzvpJgD3ITaNIddcnpusRhbhv1MsxLpNmUl5yTSAQaGuYDV2IJypWHu3H1XD
    e6jqHnOsbXNskzMduAsNfpjl1aJTHsLjQnO77WIs0P9vjpho1ViZHqEC99wlRKdAbZjkxnD1Qdl2YVs1aoaAz
    GEpkXF04whQe1fPg3iVrqU8QQXzi9awrt15bh5zb9osrgfmIhpMkMRaZwOOQRqTXLaXeEwCRrSvSrV8Ck5zw
    HMg0qCRnMrpsytPw9j8i3JLHU8coVlANMSzjUw2qHh57gFRoxBci4fOmaS8OoLYXkl1Aa2hxMEB7rh22qrNy
    UrldCcRjDrJxsahsRLFRsc0aijDFT0tiDMFgFfuHwTvuw4Notdpozf9lQHVjuHIEjbB6t9eqP2Q6EBBxBr8bm
    7QzzKaLHbWsETyrRfQmjerJgTVcLpi9SxwQCHd1nqYjFchcBuVkwAiewsNFyAkSgSsOLbxxlf2SVV2XnCGPRL
    ICkJotjrzoD6uqZ6E4kwBKcpaUDJ4vEMRvaDgcuxMRzVrWibbzvrPJDSoKLiCXiKPSNla2FW0Lh5NP1smOuSxp
    p3we6nMpOjgu9PpevwCKfmRANMFa0lhOeKwOQTnAFsPOzPvZX3Jg07aZE0TkW4nD9Fkq0Jd0RrCelZS3OfEz
    xbQkJ0qQ0iu2BAdvuRKpwOFhjldgLgDytciqT4s7xVl4lwVRWvrdiZqBdyMf3aqJx1KfNgOzBPTpLVOu7bZ6
    tKP405NmY3lFhZrag6cXkdSAmEUibz4xNgJmPymwt5EF3geATfdYA8yHzz6K42wx`)).toEqual(400);
  });
  test('successful search', () => {
    const channelID = createChannel(homer.token, 'channel1', true);
    const dmID = dmCreateV2(homer.token, [bartuId]);
    messageSendV1(homer.token, channelID.channelId, 'I want to search for something!');
    messageSendDmV1(homer.token, dmID.dmId, 'I also want to search something!');
    messageSendDmV1(homer.token, dmID.dmId, 'This one shouldn\'t show up');
    const searchData: message[] = searchV1(homer.token, 'search');
    expect(searchData.length).toEqual(2);
  });
});
