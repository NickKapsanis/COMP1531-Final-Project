import { channelsListV1, channelsListallV1,channelsCreateV1 } from './channels.js';

// Tests for channelsListV1() - Manav 


// Tests for channelsListAllV1() - Manav


// Tests for channelsCreateV1
test('Tests for channelsCreateV1', () => {
  // Testing if error is returned when authUserId does not exist
  // Testing if error is returned when name length < 1 or > 20 chars
  // Testing if valid number is given as channel Id
  // Testing if dataStore has new channel  
  // Testing if user channels include new channel
  // Testing if channels includes user  
});

test('Test invalid echo', () => {
  expect(echo({ echo: 'echo' })).toStrictEqual({ error: 'error' });
});

