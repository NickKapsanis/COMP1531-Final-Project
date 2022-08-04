import { createChannel, createUser, channelJoin } from './channel.test';
import request from 'sync-request';
import config from './config.json';
import { getData } from './dataStore';

type userType = {
  token? : string;
  authUserId? : number;
}

const port = config.port;
const hosturl = config.url;
const url = hosturl + ':' + port;

const standupStart = (token: string, channelId: number, length: number) => {
  const res = request(
    'POST',
    url + '/standup/start/v1',
    {
      body: JSON.stringify({ channelId: channelId, length: length }),
      headers: {
        token: token,
        'Content-type': 'application/json',
      },
    }
  );
  if (res.statusCode !== 200) {
    return res.statusCode;
  }
  return JSON.parse(String(res.getBody()));
};

// helper function - calls standupActive through the server
const standupActive = (token: string, channelId: number) => {
  const res = request(
    'GET',
    url + '/standup/active/v1',
    {
      qs: {
        channelId: channelId,
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
};

// helper function - calls standupSend through the server
const standupSend = (token: string, channelId: number, message: string) => {
  const res = request(
    'POST',
    url + '/standup/send/v1',
    {
      body: JSON.stringify({ channelId: channelId, message: message }),
      headers: {
        token: token,
        'Content-type': 'application/json',
      },
    }
  );
  if (res.statusCode !== 200) {
    return res.statusCode;
  }
  return JSON.parse(String(res.getBody()));
};

/// /////////////////////////////////////////////
/// //      Tests for standupStartV1()      /////
/// /////////////////////////////////////////////
describe('standupStart', () => {
  let sampleChannel: { channelId: number }, John: userType;

  beforeEach(() => {
    request('DELETE', url + '/clear/v1');
    jest.useFakeTimers();
    John = createUser('johnsmith@gmail.com', 'testPassword123', 'John', 'Smith');
    sampleChannel = createChannel(John.token, 'SampleChannel', true);
    channelJoin(John.token, sampleChannel.channelId);
  });

  afterEach(() => {
    jest.runAllTimers();
  });

  test('successful return value', () => {
    jest.useRealTimers();
    const startTime: number = Math.floor((new Date()).getTime() / 1000);
    expect(standupStart(John.token, sampleChannel.channelId, 0.5)).toEqual({ finishTime: startTime + 0.5 });
    jest.useFakeTimers();
  });
  test('token is invalid', () => {
    expect(standupStart('gobbledook', sampleChannel.channelId, 0.5)).toEqual(403);
  });
  test('bad channel Id', () => {
    expect(standupStart(John.token, -100, 0.5)).toEqual(400);
  });
  test('length is a negative number', () => {
    expect(standupStart(John.token, sampleChannel.channelId, -10)).toEqual(400);
  });
  test('standup is already active in channel', () => {
    standupStart(John.token, sampleChannel.channelId, 2);
    expect(standupStart(John.token, sampleChannel.channelId, 0.5)).toEqual(400);
  });
  test('user is not a member of the channel', () => {
    const Steve = createUser('steve@gmail.com', 'testPassword123', 'Steve', 'Smith');
    expect(standupStart(Steve.token, sampleChannel.channelId, 0.5)).toEqual(403);
  });
});

/// /////////////////////////////////////////////
/// //      Tests for standupActiveV1()     /////
/// /////////////////////////////////////////////
describe('standupActive', () => {
  let sampleChannel: { channelId: number }, John: userType;

  beforeEach(() => {
    jest.useFakeTimers();
    request('DELETE', url + '/clear/v1');
    John = createUser('johnsmith@gmail.com', 'testPassword123', 'John', 'Smith');
    sampleChannel = createChannel(John.token, 'SampleChannel', true);
  });

  afterEach(() => {
    jest.runAllTimers();
  });

  test('bad channel Id', () => {
    expect(standupActive(John.token, -100)).toEqual(400);
  });
  test('user is not a member of the channel', () => {
    const Steve = createUser('steve@gmail.com', 'testPassword123', 'Steve', 'Smith');
    expect(standupActive(Steve.token, sampleChannel.channelId)).toEqual(403);
  });
  test('successful return', () => {
    const finishTime: { finishTime: number } = standupStart(John.token, sampleChannel.channelId, 0.5);
    expect(standupActive(John.token, sampleChannel.channelId)).toEqual({ isActive: true, timeFinish: finishTime.finishTime });
  });
  test('token is invalid', () => {
    expect(standupActive('gobbledook', sampleChannel.channelId)).toEqual(403);
  });
  test('standup is not active', () => {
    expect(standupActive(John.token, sampleChannel.channelId)).toEqual({ isActive: false, timeFinish: null });
  });
});

/// /////////////////////////////////////////////
/// //       Tests for standupSendV1()      /////
/// /////////////////////////////////////////////
describe('standupSend', () => {
  let sampleChannel: { channelId: number }, John: userType;

  beforeEach(() => {
    jest.useFakeTimers();
    request('DELETE', url + '/clear/v1');
    John = createUser('johnsmith@gmail.com', 'testPassword123', 'John', 'Smith');
    sampleChannel = createChannel(John.token, 'SampleChannel', true);
  });

  afterEach(() => {
    jest.runAllTimers();
  });

  test('success', () => {
    standupStart(John.token, sampleChannel.channelId, 0.5);
    expect(standupSend(John.token, sampleChannel.channelId, 'add this message to the queue')).toEqual({});
  });
  test('bad channel Id', () => {
    standupStart(John.token, sampleChannel.channelId, 0.5);
    expect(standupSend(John.token, -100, 'add this message to the queue')).toEqual(400);
  });
  test('length of message exceeds 1000 chars (1050 chars)', () => {
    standupStart(John.token, sampleChannel.channelId, 0.5);
    expect(standupSend(John.token, sampleChannel.channelId, `bljUwrWuzjLodaeOV97GSZ23rlzLz6AyqSZm5V9EgJLxVv8ZIIyQI6HV
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
  test('no active standup', () => {
    expect(standupSend(John.token, sampleChannel.channelId, 'add this message to the queue')).toEqual(400);
  });
  test('user is not a member of the channel', () => {
    const Steve = createUser('steve@gmail.com', 'testPassword123', 'Steve', 'Smith');
    standupStart(John.token, sampleChannel.channelId, 0.5);
    expect(standupSend(Steve.token, sampleChannel.channelId, 'message')).toEqual(403);
  });
  test('token is invalid', () => {
    standupStart(John.token, sampleChannel.channelId, 0.5);
    expect(standupSend('gobbledook', sampleChannel.channelId, 'message')).toEqual(403);
  });
  test('successful run through', () => {
    jest.spyOn(global, 'setTimeout');
    standupStart(John.token, sampleChannel.channelId, 0.5);
    standupSend(John.token, sampleChannel.channelId, 'add this message to the queue');
    standupSend(John.token, sampleChannel.channelId, 'add message number 2 to the queue');
    jest.runAllTimers();
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 750);
    const data = getData();
    expect(data.channels[0].messages.length).toEqual(1);
  });
});

afterAll(() => {
  jest.useRealTimers()
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 750);
});