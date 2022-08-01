import { createChannel, createUser } from './channel.test';
import request from 'sync-request';
import config from './config.json';

type userType = {
  token? : string;
  authUserId? : number;
}

const port = config.port;
const hosturl = config.url;
const url = hosturl + ':' + port;

// helper function - calls standupStart through the server
const standupStart = (channelId: number, length: number) => {
    const res = request(
      'POST',
      url + '/standup/start/v1',
      {
        body: JSON.stringify({ channelId: channelId, length: length }),
        headers: {
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
const standupActive = (channelId: number) => {
    const res = request(
        'GET',
        url + '/standup/active/v1',
        {
          qs: {
            channelId: channelId,
          }
        }
    );
    if (res.statusCode !== 200) {
      return res.statusCode;
  }
return JSON.parse(String(res.getBody()));
};

// helper function - calls standupSend through the server
const standupSend = (channelId: number, message: string) => {
    const res = request(
      'POST',
      url + '/standup/send/v1',
      {
        body: JSON.stringify({ channelId: channelId, message: message }),
        headers: {
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
  let sampleChannel: number, John: userType;

  beforeEach(() => {
    request('DELETE', url + '/clear/v1');
    John = createUser('johnsmith@gmail.com', 'testPassword123', 'John', 'Smith');
    sampleChannel = createChannel(John.token, 'SampleChannel', true);
  });

  test('successful return value', () => {
    let startTime: number = Math.floor((new Date()).getTime() / 1000)
    expect(standupStart(sampleChannel, 10).toEqual(startTime+10));
  });
  test('bad channel Id', () => {
    expect(standupStart(-100, 10).toEqual(400));
  });
  test('length is a negative number', () => {
    expect(standupStart(sampleChannel, -10).toEqual(400));
  });
  test('standup is already active in channel', () => {
    standupStart(sampleChannel, 10)
    expect(standupStart(sampleChannel, 10).toEqual(400));
  });
  test('user is not a member of the channel', () => {
    //TODO - complete this
  });
});

/// /////////////////////////////////////////////
/// //      Tests for standupActiveV1()     /////
/// /////////////////////////////////////////////
describe('standupActive', () => {
  let sampleChannel: number, John: userType;

  beforeEach(() => {
    request('DELETE', url + '/clear/v1');
    John = createUser('johnsmith@gmail.com', 'testPassword123', 'John', 'Smith');
    sampleChannel = createChannel(John.token, 'SampleChannel', true);
  });

  test('test', () => {
    test('bad channel Id', () => {
      expect(standupActive(-100).toEqual(400));
    });
    test('user is not a member of the channel', () => {
      //TODO - complete this
    });
    test('success', () => {
      let finishTime: number = standupStart(sampleChannel, 10);
      expect(standupActive(sampleChannel).toEqual({ isActive: true , timeFinish: finishTime }));
    });
  });
});

/// /////////////////////////////////////////////
/// //       Tests for standupSendV1()      /////
/// /////////////////////////////////////////////
describe('standupSend', () => {
  let sampleChannel: number, John: userType;

  beforeEach(() => {
    request('DELETE', url + '/clear/v1');
    John = createUser('johnsmith@gmail.com', 'testPassword123', 'John', 'Smith');
    sampleChannel = createChannel(John.token, 'SampleChannel', true);
  });

  test('standupSend', () => {
    test('success', () => {
      standupStart(sampleChannel, 10);
      expect(standupSend(sampleChannel, 'add this message to the queue').toEqual({}));
    });
    test('bad channel Id', () => {
      standupStart(sampleChannel, 10);
      expect(standupSend(-100, 'add this message to the queue').toEqual(400));
    });
    test('length of message exceeds 1000 chars (1050 chars)', () => {
      standupStart(sampleChannel, 10);
      expect(standupSend(sampleChannel, `bljUwrWuzjLodaeOV97GSZ23rlzLz6AyqSZm5V9EgJLxVv8ZIIyQI6HV
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
      tKP405NmY3lFhZrag6cXkdSAmEUibz4xNgJmPymwt5EF3geATfdYA8yHzz6K42wx`).toEqual(400));
    });
    test('no active standup', () => {
      expect(standupSend(sampleChannel, 'add this message to the queue').toEqual(400));
    });
    test('user is not a member of the channel', () => {
      //TODO - complete this
    });
  });
});