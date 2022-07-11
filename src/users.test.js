import { authRegisterV1 } from './auth.js'
import { clearV1, getUId } from './other.js'
import { userProfileV1, userSetnameV1, userSetemailV1, userSethandlelV1 } from './users.js'

////////////////////////////////////////////////
/////      Tests for userProfileV1() 	     /////
////////////////////////////////////////////////

describe('Testing userProfileV1()', () => {

  test('Testing if error is returned if both authUserId and uId do not exist', () => {

    clearV1();
    expect(userProfileV1(-1,-3)).toStrictEqual({ error : 'error' });
  
  });

  test('Testing if error is returned if authUserId does not exist', () => {

    clearV1();
    const testAuthId = authRegisterV1('testemail@email.com', 'testPassword123', 'testFirstName', 'testLastName').authUserId;
    const testUId = getUId(testAuthId);
    expect(userProfileV1(-1, testUId)).toStrictEqual({ error : 'error' });
  
  });

  test('Testing if error is returned if uId does not exist', () => {

    clearV1();
    const testAuthId = authRegisterV1('testemail@email.com', 'testPassword123', 'testFirstName', 'testLastName').authUserId;
    expect(userProfileV1(testAuthId, -1)).toStrictEqual({ error : 'error' });
  
  });

  test('Testing correct output for when authUserId and uId belong to same person', () => {

    clearV1();
    const testAuthId = authRegisterV1('testemail@email.com', 'testPassword123', 'testFirstName', 'testLastName').authUserId;
    const testUId = getUId(testAuthId);
    const output =  userProfileV1(testAuthId, testUId);
    expect(output.uId).toStrictEqual(testUId);
    expect(output.email).toStrictEqual('testemail@email.com');
    expect(output.nameFirst).toStrictEqual('testFirstName');
    expect(output.nameLast).toStrictEqual('testLastName');

  });

  test('Testing correct output for when authUserId and uId belong to different people', () => {

    clearV1();
    const testAuthId = authRegisterV1('testemail@email.com', 'testPassword123', 'testFirstName', 'testLastName').authUserId;
    const testAuthId2 = authRegisterV1('correct@email.com', 'correctPassword1', 'correctFirstName', 'correctLastName').authUserId;
    const testUId = getUId(testAuthId2);
    const output =  userProfileV1(testAuthId, testUId);
    expect(output.uId).toStrictEqual(testUId);
    expect(output.email).toStrictEqual('correct@email.com');
    expect(output.nameFirst).toStrictEqual('correctFirstName');
    expect(output.nameLast).toStrictEqual('correctLastName');

  });

});


////////////////////////////////////////////////
/////      Tests for userSetnameV1() 	     /////
////////////////////////////////////////////////
test('Testing if changing nothing still returns same name.', () => {

  clearV1();

  const aliceAuthId = authRegisterV1('alice@email.com', 'testPassword123', 'Alice', 'Smith').authUserId;
  const rufusAuthId = authRegisterV1('rufus@email.com', 'testPassword123', 'Rufus', 'James').authUserId;

  userSetnameV1(aliceAuthId, Alice, Smith);

  expect(userProfileV1(aliceAuthId.nameFirst)).toEqual( 'Alice' );
  expect(userProfileV1(aliceAuthId.lastFirst)).toEqual( 'Smith' );


});

test('Testing changing only first name.', () => {

  clearV1();

  const aliceAuthId = authRegisterV1('alice@email.com', 'testPassword123', 'Alice', 'Smith').authUserId;
  const rufusAuthId = authRegisterV1('rufus@email.com', 'testPassword123', 'Rufus', 'James').authUserId;

  userSetnameV1(aliceAuthId, Alison, Smith);

  expect(userProfileV1(aliceAuthId.nameFirst)).toEqual( 'Alison' );
  expect(userProfileV1(aliceAuthId.lastFirst)).toEqual( 'Smith' );


});

test('Testing changing only last name.', () => {

  clearV1();

  const aliceAuthId = authRegisterV1('alice@email.com', 'testPassword123', 'Alice', 'Smith').authUserId;
  const rufusAuthId = authRegisterV1('rufus@email.com', 'testPassword123', 'Rufus', 'James').authUserId;

  userSetnameV1(aliceAuthId, Alice, Sithlord);

  expect(userProfileV1(aliceAuthId.nameFirst)).toEqual( 'Alice' );
  expect(userProfileV1(aliceAuthId.lastFirst)).toEqual( 'Sithlord' );

});

test('Testing changing both names.', () => {

  clearV1();

  const aliceAuthId = authRegisterV1('alice@email.com', 'testPassword123', 'Alice', 'Smith').authUserId;
  const rufusAuthId = authRegisterV1('rufus@email.com', 'testPassword123', 'Rufus', 'James').authUserId;

  userSetnameV1(aliceAuthId, Alison, Sithlord);

  expect(userProfileV1(aliceAuthId.nameFirst)).toEqual( 'Alison' );
  expect(userProfileV1(aliceAuthId.lastFirst)).toEqual( 'Sithlord' );

});



////////////////////////////////////////////////
/////      Tests for userSetemailV1() 	   /////
////////////////////////////////////////////////
test('Testing if changing nothing still returns same email.', () => {

  clearV1();

  const aliceAuthId = authRegisterV1('alice@email.com', 'testPassword123', 'Alice', 'Smith').authUserId;

  userSetemailV1(aliceAuthId, 'alice@email.com');

  expect(userProfileV1(aliceAuthId.email)).toEqual( 'alice@email.com' );


});

test('Testing changing email.', () => {

  clearV1();

  const aliceAuthId = authRegisterV1('alice@email.com', 'testPassword123', 'Alice', 'Smith').authUserId;

  userSetemailV1(aliceAuthId, 'supercoolnew@email.com');

  expect(userProfileV1(aliceAuthId.email)).toEqual( 'supercoolnew@email.com' );

});

////////////////////////////////////////////////
/////      Tests for userSethandleV1() 	   /////
////////////////////////////////////////////////
test('Testing if changing nothing still returns same handle.', () => {

  clearV1();

  const aliceAuthId = authRegisterV1('alice@email.com', 'testPassword123', 'Alice', 'Smith').authUserId;

  userSethandleV1(aliceAuthId, AliceSmith);

  expect(userProfileV1(aliceAuthId.handleStr)).toEqual( 'alice@AliceSmith' );


});

test('Testing changing handle.', () => {

  clearV1();

  const aliceAuthId = authRegisterV1('alice@email.com', 'testPassword123', 'Alice', 'Smith').authUserId;

  userSethandleV1(aliceAuthId, AwesomeNewHandle);

  expect(userProfileV1(aliceAuthId.handleStr)).toEqual( 'AwesomeNewHandle' );

});